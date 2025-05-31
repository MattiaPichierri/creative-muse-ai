"""
Creative Muse AI - Session-Manager
Sichere Verwaltung von Benutzer-Sessions mit Verschlüsselung und Audit-Logging
"""

import secrets
import hashlib
import json
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, Set, List
import threading
import time
from dataclasses import dataclass, asdict
from enum import Enum
import logging

from .crypto_manager import CryptoManager
from .audit_logger import AuditLogger, EventCategory, SeverityLevel

logger = logging.getLogger('security.session')

class SessionStatus(Enum):
    """Status einer Session"""
    ACTIVE = "active"
    EXPIRED = "expired"
    TERMINATED = "terminated"
    SUSPENDED = "suspended"

@dataclass
class SessionData:
    """Datenstruktur für Session-Informationen"""
    session_id: str
    user_id: Optional[str]
    created_at: datetime
    last_activity: datetime
    expires_at: datetime
    ip_address: Optional[str]
    user_agent: Optional[str]
    status: SessionStatus
    security_flags: int = 0  # Bitfeld für Sicherheits-Flags
    data: Dict[str, Any] = None  # Verschlüsselte Session-Daten
    
    def to_dict(self) -> Dict[str, Any]:
        """Konvertiere zu Dictionary für Serialisierung"""
        result = asdict(self)
        # Datetime-Objekte zu ISO-Strings konvertieren
        result['created_at'] = self.created_at.isoformat()
        result['last_activity'] = self.last_activity.isoformat()
        result['expires_at'] = self.expires_at.isoformat()
        result['status'] = self.status.value
        return result
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SessionData':
        """Erstelle SessionData aus Dictionary"""
        # ISO-Strings zu Datetime-Objekten konvertieren
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        data['last_activity'] = datetime.fromisoformat(data['last_activity'])
        data['expires_at'] = datetime.fromisoformat(data['expires_at'])
        data['status'] = SessionStatus(data['status'])
        return cls(**data)

class SecurityFlags:
    """Sicherheits-Flags für Sessions (Bitfeld)"""
    NONE = 0
    SUSPICIOUS_ACTIVITY = 1
    MULTIPLE_IPS = 2
    UNUSUAL_USER_AGENT = 4
    RAPID_REQUESTS = 8
    FAILED_AUTH_ATTEMPTS = 16
    ADMIN_SESSION = 32
    ELEVATED_PRIVILEGES = 64

class SessionManager:
    """Zentraler Session-Manager für sichere Session-Verwaltung"""
    
    def __init__(self, config: Dict[str, Any], crypto_manager: CryptoManager, audit_logger: AuditLogger):
        self.config = config
        self.crypto_manager = crypto_manager
        self.audit_logger = audit_logger
        
        # Session-Konfiguration
        self.session_config = config.get('network', {}).get('api', {}).get('authentication', {})
        self.session_timeout_minutes = self.session_config.get('session_timeout_minutes', 30)
        self.max_concurrent_sessions = self.session_config.get('max_concurrent_sessions', 1)
        
        # Session-Storage (in-memory mit Verschlüsselung)
        self.sessions: Dict[str, SessionData] = {}
        self.user_sessions: Dict[str, Set[str]] = {}  # user_id -> set of session_ids
        
        # Thread-Sicherheit
        self.lock = threading.RLock()
        
        # Cleanup-Thread
        self.cleanup_thread = None
        self.shutdown_event = threading.Event()
        
        # Statistiken
        self.stats = {
            'total_sessions_created': 0,
            'active_sessions': 0,
            'expired_sessions': 0,
            'terminated_sessions': 0,
            'security_violations': 0
        }
        
        self._start_cleanup_thread()
    
    def _start_cleanup_thread(self):
        """Starte Thread für automatische Session-Bereinigung"""
        try:
            self.cleanup_thread = threading.Thread(
                target=self._cleanup_expired_sessions,
                daemon=True,
                name="SessionCleanup"
            )
            self.cleanup_thread.start()
            logger.info("Session-Cleanup-Thread gestartet")
            
        except Exception as e:
            logger.error(f"Fehler beim Starten des Cleanup-Threads: {e}")
    
    def create_session(self, 
                      user_id: Optional[str] = None,
                      ip_address: Optional[str] = None,
                      user_agent: Optional[str] = None,
                      session_data: Optional[Dict[str, Any]] = None) -> str:
        """
        Erstelle eine neue Session
        
        Args:
            user_id: Benutzer-ID (optional für anonyme Sessions)
            ip_address: IP-Adresse des Clients
            user_agent: User-Agent des Clients
            session_data: Zusätzliche Session-Daten
            
        Returns:
            Session-ID
        """
        try:
            with self.lock:
                # Prüfe maximale gleichzeitige Sessions
                if user_id and self._check_max_sessions(user_id):
                    raise ValueError(f"Maximale Anzahl gleichzeitiger Sessions erreicht: {self.max_concurrent_sessions}")
                
                # Session-ID generieren
                session_id = self._generate_session_id()
                
                # Session-Daten erstellen
                now = datetime.now(timezone.utc)
                expires_at = now + timedelta(minutes=self.session_timeout_minutes)
                
                # Session-Daten verschlüsseln falls vorhanden
                encrypted_data = None
                if session_data:
                    data_json = json.dumps(session_data)
                    encrypted_data = self.crypto_manager.encrypt_string(data_json, "session")
                
                session = SessionData(
                    session_id=session_id,
                    user_id=user_id,
                    created_at=now,
                    last_activity=now,
                    expires_at=expires_at,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    status=SessionStatus.ACTIVE,
                    data={"encrypted": encrypted_data} if encrypted_data else None
                )
                
                # Session speichern
                self.sessions[session_id] = session
                
                # User-Session-Mapping aktualisieren
                if user_id:
                    if user_id not in self.user_sessions:
                        self.user_sessions[user_id] = set()
                    self.user_sessions[user_id].add(session_id)
                
                # Statistiken aktualisieren
                self.stats['total_sessions_created'] += 1
                self.stats['active_sessions'] += 1
                
                # Audit-Log
                self.audit_logger.log_event(
                    category=EventCategory.SYSTEM_EVENTS,
                    event_type="session_created",
                    source_component="session_manager",
                    description="New session created",
                    details={
                        "session_id": session_id,
                        "user_id": user_id,
                        "ip_address": ip_address,
                        "expires_at": expires_at.isoformat()
                    },
                    user_id=user_id,
                    session_id=session_id,
                    ip_address=ip_address,
                    user_agent=user_agent
                )
                
                logger.info(f"Session erstellt: {session_id} für User: {user_id}")
                return session_id
                
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Session: {e}")
            raise
    
    def validate_session(self, session_id: str, 
                        ip_address: Optional[str] = None,
                        user_agent: Optional[str] = None) -> Optional[SessionData]:
        """
        Validiere eine Session und aktualisiere Last-Activity
        
        Args:
            session_id: Session-ID
            ip_address: Aktuelle IP-Adresse
            user_agent: Aktueller User-Agent
            
        Returns:
            SessionData wenn gültig, None sonst
        """
        try:
            with self.lock:
                session = self.sessions.get(session_id)
                
                if not session:
                    self._log_security_event("session_not_found", session_id, ip_address)
                    return None
                
                # Status prüfen
                if session.status != SessionStatus.ACTIVE:
                    self._log_security_event("session_inactive", session_id, ip_address)
                    return None
                
                # Ablaufzeit prüfen
                now = datetime.now(timezone.utc)
                if now > session.expires_at:
                    self._expire_session(session_id)
                    self._log_security_event("session_expired", session_id, ip_address)
                    return None
                
                # Sicherheitsprüfungen
                security_flags = self._check_session_security(session, ip_address, user_agent)
                
                # Session aktualisieren
                session.last_activity = now
                session.expires_at = now + timedelta(minutes=self.session_timeout_minutes)
                session.security_flags |= security_flags
                
                # Audit-Log für Session-Zugriff
                self.audit_logger.log_event(
                    category=EventCategory.SYSTEM_EVENTS,
                    event_type="session_accessed",
                    source_component="session_manager",
                    description="Session accessed and validated",
                    details={
                        "session_id": session_id,
                        "security_flags": security_flags,
                        "new_expires_at": session.expires_at.isoformat()
                    },
                    user_id=session.user_id,
                    session_id=session_id,
                    ip_address=ip_address,
                    user_agent=user_agent
                )
                
                return session
                
        except Exception as e:
            logger.error(f"Fehler bei der Session-Validierung: {e}")
            return None
    
    def get_session_data(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Hole entschlüsselte Session-Daten
        
        Args:
            session_id: Session-ID
            
        Returns:
            Session-Daten oder None
        """
        try:
            with self.lock:
                session = self.sessions.get(session_id)
                
                if not session or session.status != SessionStatus.ACTIVE:
                    return None
                
                if not session.data or "encrypted" not in session.data:
                    return {}
                
                # Daten entschlüsseln
                encrypted_data = session.data["encrypted"]
                decrypted_json = self.crypto_manager.decrypt_string(encrypted_data, "session")
                return json.loads(decrypted_json)
                
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Session-Daten: {e}")
            return None
    
    def update_session_data(self, session_id: str, data: Dict[str, Any]) -> bool:
        """
        Aktualisiere Session-Daten
        
        Args:
            session_id: Session-ID
            data: Neue Session-Daten
            
        Returns:
            True wenn erfolgreich, False sonst
        """
        try:
            with self.lock:
                session = self.sessions.get(session_id)
                
                if not session or session.status != SessionStatus.ACTIVE:
                    return False
                
                # Daten verschlüsseln
                data_json = json.dumps(data)
                encrypted_data = self.crypto_manager.encrypt_string(data_json, "session")
                
                # Session aktualisieren
                session.data = {"encrypted": encrypted_data}
                session.last_activity = datetime.now(timezone.utc)
                
                # Audit-Log
                self.audit_logger.log_data_access(
                    operation="update",
                    table_name="session_data",
                    user_id=session.user_id,
                    session_id=session_id
                )
                
                return True
                
        except Exception as e:
            logger.error(f"Fehler beim Aktualisieren der Session-Daten: {e}")
            return False
    
    def terminate_session(self, session_id: str, reason: str = "user_logout") -> bool:
        """
        Beende eine Session
        
        Args:
            session_id: Session-ID
            reason: Grund für die Beendigung
            
        Returns:
            True wenn erfolgreich, False sonst
        """
        try:
            with self.lock:
                session = self.sessions.get(session_id)
                
                if not session:
                    return False
                
                # Session-Status ändern
                session.status = SessionStatus.TERMINATED
                
                # Aus User-Session-Mapping entfernen
                if session.user_id and session.user_id in self.user_sessions:
                    self.user_sessions[session.user_id].discard(session_id)
                    if not self.user_sessions[session.user_id]:
                        del self.user_sessions[session.user_id]
                
                # Statistiken aktualisieren
                self.stats['active_sessions'] -= 1
                self.stats['terminated_sessions'] += 1
                
                # Audit-Log
                self.audit_logger.log_event(
                    category=EventCategory.SYSTEM_EVENTS,
                    event_type="session_terminated",
                    source_component="session_manager",
                    description=f"Session terminated: {reason}",
                    details={
                        "session_id": session_id,
                        "reason": reason,
                        "duration_minutes": (datetime.now(timezone.utc) - session.created_at).total_seconds() / 60
                    },
                    user_id=session.user_id,
                    session_id=session_id
                )
                
                logger.info(f"Session beendet: {session_id}, Grund: {reason}")
                return True
                
        except Exception as e:
            logger.error(f"Fehler beim Beenden der Session: {e}")
            return False
    
    def terminate_user_sessions(self, user_id: str, exclude_session: Optional[str] = None) -> int:
        """
        Beende alle Sessions eines Benutzers
        
        Args:
            user_id: Benutzer-ID
            exclude_session: Session-ID die nicht beendet werden soll
            
        Returns:
            Anzahl beendeter Sessions
        """
        try:
            with self.lock:
                if user_id not in self.user_sessions:
                    return 0
                
                session_ids = self.user_sessions[user_id].copy()
                terminated_count = 0
                
                for session_id in session_ids:
                    if session_id != exclude_session:
                        if self.terminate_session(session_id, "user_sessions_terminated"):
                            terminated_count += 1
                
                logger.info(f"{terminated_count} Sessions für User {user_id} beendet")
                return terminated_count
                
        except Exception as e:
            logger.error(f"Fehler beim Beenden der User-Sessions: {e}")
            return 0
    
    def _generate_session_id(self) -> str:
        """Generiere eine sichere Session-ID"""
        # 256-bit zufällige Session-ID
        random_bytes = secrets.token_bytes(32)
        
        # Zusätzliche Entropie durch Timestamp
        timestamp = str(time.time()).encode('utf-8')
        
        # Hash erstellen
        hash_input = random_bytes + timestamp
        session_hash = hashlib.sha256(hash_input).hexdigest()
        
        return session_hash
    
    def _check_max_sessions(self, user_id: str) -> bool:
        """Prüfe ob maximale Anzahl Sessions erreicht"""
        if user_id not in self.user_sessions:
            return False
        
        active_sessions = 0
        for session_id in self.user_sessions[user_id]:
            session = self.sessions.get(session_id)
            if session and session.status == SessionStatus.ACTIVE:
                active_sessions += 1
        
        return active_sessions >= self.max_concurrent_sessions
    
    def _check_session_security(self, session: SessionData, 
                               ip_address: Optional[str], 
                               user_agent: Optional[str]) -> int:
        """Prüfe Session auf Sicherheitsprobleme"""
        security_flags = SecurityFlags.NONE
        
        try:
            # IP-Adresse geändert
            if ip_address and session.ip_address and ip_address != session.ip_address:
                security_flags |= SecurityFlags.MULTIPLE_IPS
                self._log_security_event("ip_address_changed", session.session_id, ip_address)
            
            # User-Agent geändert
            if user_agent and session.user_agent and user_agent != session.user_agent:
                security_flags |= SecurityFlags.UNUSUAL_USER_AGENT
                self._log_security_event("user_agent_changed", session.session_id, ip_address)
            
            # Weitere Sicherheitsprüfungen können hier hinzugefügt werden
            
        except Exception as e:
            logger.error(f"Fehler bei Sicherheitsprüfung: {e}")
        
        return security_flags
    
    def _expire_session(self, session_id: str):
        """Markiere Session als abgelaufen"""
        try:
            session = self.sessions.get(session_id)
            if session:
                session.status = SessionStatus.EXPIRED
                
                # Aus User-Session-Mapping entfernen
                if session.user_id and session.user_id in self.user_sessions:
                    self.user_sessions[session.user_id].discard(session_id)
                
                # Statistiken aktualisieren
                self.stats['active_sessions'] -= 1
                self.stats['expired_sessions'] += 1
                
        except Exception as e:
            logger.error(f"Fehler beim Ablaufen der Session: {e}")
    
    def _log_security_event(self, event_type: str, session_id: str, ip_address: Optional[str]):
        """Protokolliere Sicherheitsereignis"""
        try:
            self.stats['security_violations'] += 1
            
            self.audit_logger.log_security_event(
                event_type=event_type,
                severity=SeverityLevel.WARNING,
                description=f"Session security event: {event_type}",
                details={
                    "session_id": session_id,
                    "ip_address": ip_address
                },
                source_component="session_manager"
            )
            
        except Exception as e:
            logger.error(f"Fehler beim Protokollieren des Sicherheitsereignisses: {e}")
    
    def _cleanup_expired_sessions(self):
        """Bereinige abgelaufene Sessions (läuft in separatem Thread)"""
        while not self.shutdown_event.is_set():
            try:
                # Alle 5 Minuten aufräumen
                if self.shutdown_event.wait(300):  # 5 Minuten
                    break
                
                with self.lock:
                    now = datetime.now(timezone.utc)
                    expired_sessions = []
                    
                    for session_id, session in self.sessions.items():
                        if session.status == SessionStatus.ACTIVE and now > session.expires_at:
                            expired_sessions.append(session_id)
                    
                    # Abgelaufene Sessions markieren
                    for session_id in expired_sessions:
                        self._expire_session(session_id)
                    
                    # Alte Sessions löschen (älter als 24 Stunden)
                    cutoff_time = now - timedelta(hours=24)
                    old_sessions = []
                    
                    for session_id, session in self.sessions.items():
                        if session.created_at < cutoff_time and session.status != SessionStatus.ACTIVE:
                            old_sessions.append(session_id)
                    
                    # Alte Sessions entfernen
                    for session_id in old_sessions:
                        del self.sessions[session_id]
                    
                    if expired_sessions or old_sessions:
                        logger.info(f"Session-Cleanup: {len(expired_sessions)} abgelaufen, {len(old_sessions)} gelöscht")
                
            except Exception as e:
                logger.error(f"Fehler beim Session-Cleanup: {e}")
    
    def get_active_sessions(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Hole aktive Sessions
        
        Args:
            user_id: Benutzer-ID (optional, für alle Sessions None)
            
        Returns:
            Liste der aktiven Sessions
        """
        try:
            with self.lock:
                active_sessions = []
                
                for session_id, session in self.sessions.items():
                    if session.status == SessionStatus.ACTIVE:
                        if user_id is None or session.user_id == user_id:
                            session_info = session.to_dict()
                            # Sensible Daten entfernen
                            session_info.pop('data', None)
                            active_sessions.append(session_info)
                
                return active_sessions
                
        except Exception as e:
            logger.error(f"Fehler beim Abrufen aktiver Sessions: {e}")
            return []
    
    def get_statistics(self) -> Dict[str, Any]:
        """Hole Session-Statistiken"""
        return self.stats.copy()
    
    def shutdown(self):
        """Beende Session-Manager ordnungsgemäß"""
        try:
            # Shutdown-Signal setzen
            self.shutdown_event.set()
            
            # Warte auf Cleanup-Thread
            if self.cleanup_thread and self.cleanup_thread.is_alive():
                self.cleanup_thread.join(timeout=5.0)
            
            # Alle aktiven Sessions beenden
            with self.lock:
                active_session_ids = [
                    sid for sid, session in self.sessions.items() 
                    if session.status == SessionStatus.ACTIVE
                ]
                
                for session_id in active_session_ids:
                    self.terminate_session(session_id, "system_shutdown")
            
            logger.info("Session-Manager erfolgreich beendet")
            
        except Exception as e:
            logger.error(f"Fehler beim Beenden des Session-Managers: {e}")