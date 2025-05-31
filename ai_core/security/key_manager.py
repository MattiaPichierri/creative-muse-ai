"""
Creative Muse AI - Schlüssel-Manager
Sichere Verwaltung und Rotation kryptographischer Schlüssel
"""

import os
import json
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
import threading
import base64
from enum import Enum
from dataclasses import dataclass, asdict
import logging

from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
from cryptography.fernet import Fernet

from .audit_logger import AuditLogger, EventCategory, SeverityLevel

logger = logging.getLogger('security.key_manager')

class KeyType(Enum):
    """Typen von kryptographischen Schlüsseln"""
    SYMMETRIC = "symmetric"
    ASYMMETRIC = "asymmetric"
    MASTER = "master"
    DATABASE = "database"
    SESSION = "session"
    FILE = "file"
    COMMUNICATION = "communication"
    BACKUP = "backup"

class KeyStatus(Enum):
    """Status eines Schlüssels"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    REVOKED = "revoked"
    EXPIRED = "expired"

@dataclass
class KeyMetadata:
    """Metadaten für einen kryptographischen Schlüssel"""
    key_id: str
    key_type: KeyType
    algorithm: str
    key_size: int
    created_at: datetime
    expires_at: Optional[datetime]
    last_used: Optional[datetime]
    usage_count: int
    status: KeyStatus
    purpose: str
    rotation_interval_days: int
    checksum: str
    
    def to_dict(self) -> Dict[str, Any]:
        """Konvertiere zu Dictionary"""
        result = asdict(self)
        result['key_type'] = self.key_type.value
        result['status'] = self.status.value
        result['created_at'] = self.created_at.isoformat()
        if self.expires_at:
            result['expires_at'] = self.expires_at.isoformat()
        if self.last_used:
            result['last_used'] = self.last_used.isoformat()
        return result
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'KeyMetadata':
        """Erstelle KeyMetadata aus Dictionary"""
        data['key_type'] = KeyType(data['key_type'])
        data['status'] = KeyStatus(data['status'])
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        if data.get('expires_at'):
            data['expires_at'] = datetime.fromisoformat(data['expires_at'])
        if data.get('last_used'):
            data['last_used'] = datetime.fromisoformat(data['last_used'])
        return cls(**data)

class KeyManager:
    """Zentraler Manager für kryptographische Schlüssel"""
    
    def __init__(self, config: Dict[str, Any], audit_logger: AuditLogger):
        self.config = config
        self.audit_logger = audit_logger
        
        # Konfiguration
        self.encryption_config = config.get('encryption', {})
        self.key_rotation_config = self.encryption_config.get('key_rotation', {})
        
        # Pfade
        self.keys_dir = Path("security/keys")
        self.metadata_file = self.keys_dir / "key_metadata.json"
        
        # Schlüssel-Storage
        self.key_metadata: Dict[str, KeyMetadata] = {}
        self.active_keys: Dict[str, bytes] = {}  # key_id -> key_data
        
        # Master-Schlüssel für Schlüssel-Verschlüsselung
        self.master_key: Optional[bytes] = None
        
        # Thread-Sicherheit
        self.lock = threading.RLock()
        
        # Rotation-Thread
        self.rotation_thread = None
        self.shutdown_event = threading.Event()
        
        # Statistiken
        self.stats = {
            'total_keys': 0,
            'active_keys': 0,
            'rotations_performed': 0,
            'keys_by_type': {},
            'last_rotation': None
        }
        
        self._initialize()
    
    def _initialize(self):
        """Initialisiere Key-Manager"""
        try:
            # Verzeichnisse erstellen
            self.keys_dir.mkdir(parents=True, exist_ok=True)
            os.chmod(self.keys_dir, 0o700)
            
            # Master-Schlüssel laden oder erstellen
            self._initialize_master_key()
            
            # Metadaten laden
            self._load_metadata()
            
            # Aktive Schlüssel laden
            self._load_active_keys()
            
            # Rotation-Thread starten
            self._start_rotation_thread()
            
            logger.info("Key-Manager erfolgreich initialisiert")
            
        except Exception as e:
            logger.error(f"Fehler bei der Key-Manager-Initialisierung: {e}")
            raise
    
    def _initialize_master_key(self):
        """Initialisiere oder lade Master-Schlüssel"""
        try:
            master_key_file = self.keys_dir / "master.key"
            
            if master_key_file.exists():
                # Master-Schlüssel laden
                with open(master_key_file, 'rb') as f:
                    encrypted_master = f.read()
                
                # TODO: In Produktionsumgebung sollte der Master-Schlüssel
                # durch Hardware-Security-Module oder Passwort geschützt werden
                # Für Demo-Zwecke verwenden wir eine einfache Ableitung
                password = os.getenv('MASTER_KEY_PASSWORD', 'default_password')
                salt = b'creative_muse_salt'  # In Produktion: zufälliges Salt
                
                kdf = PBKDF2HMAC(
                    algorithm=hashes.SHA256(),
                    length=32,
                    salt=salt,
                    iterations=100000,
                    backend=default_backend()
                )
                key = kdf.derive(password.encode())
                
                fernet = Fernet(base64.urlsafe_b64encode(key))
                self.master_key = fernet.decrypt(encrypted_master)
                
                logger.info("Master-Schlüssel geladen")
            else:
                # Neuen Master-Schlüssel erstellen
                self.master_key = secrets.token_bytes(32)
                
                # Master-Schlüssel verschlüsselt speichern
                password = os.getenv('MASTER_KEY_PASSWORD', 'default_password')
                salt = b'creative_muse_salt'
                
                kdf = PBKDF2HMAC(
                    algorithm=hashes.SHA256(),
                    length=32,
                    salt=salt,
                    iterations=100000,
                    backend=default_backend()
                )
                key = kdf.derive(password.encode())
                
                fernet = Fernet(base64.urlsafe_b64encode(key))
                encrypted_master = fernet.encrypt(self.master_key)
                
                with open(master_key_file, 'wb') as f:
                    f.write(encrypted_master)
                
                os.chmod(master_key_file, 0o600)
                
                logger.info("Neuer Master-Schlüssel erstellt")
                
                # Audit-Log
                self.audit_logger.log_security_event(
                    event_type="master_key_created",
                    severity=SeverityLevel.INFO,
                    description="New master key created",
                    source_component="key_manager"
                )
                
        except Exception as e:
            logger.error(f"Fehler bei Master-Schlüssel-Initialisierung: {e}")
            raise
    
    def _load_metadata(self):
        """Lade Schlüssel-Metadaten"""
        try:
            if self.metadata_file.exists():
                with open(self.metadata_file, 'r') as f:
                    metadata_dict = json.load(f)
                
                for key_id, data in metadata_dict.items():
                    self.key_metadata[key_id] = KeyMetadata.from_dict(data)
                
                logger.info(f"{len(self.key_metadata)} Schlüssel-Metadaten geladen")
            
        except Exception as e:
            logger.error(f"Fehler beim Laden der Metadaten: {e}")
    
    def _save_metadata(self):
        """Speichere Schlüssel-Metadaten"""
        try:
            metadata_dict = {}
            for key_id, metadata in self.key_metadata.items():
                metadata_dict[key_id] = metadata.to_dict()
            
            with open(self.metadata_file, 'w') as f:
                json.dump(metadata_dict, f, indent=2)
            
            os.chmod(self.metadata_file, 0o600)
            
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Metadaten: {e}")
            raise
    
    def _load_active_keys(self):
        """Lade aktive Schlüssel"""
        try:
            for key_id, metadata in self.key_metadata.items():
                if metadata.status == KeyStatus.ACTIVE:
                    key_data = self._load_key_from_file(key_id)
                    if key_data:
                        self.active_keys[key_id] = key_data
            
            logger.info(f"{len(self.active_keys)} aktive Schlüssel geladen")
            
        except Exception as e:
            logger.error(f"Fehler beim Laden aktiver Schlüssel: {e}")
    
    def generate_key(self, 
                    key_type: KeyType,
                    purpose: str,
                    algorithm: str = "AES-256",
                    key_size: int = 256,
                    rotation_interval_days: int = 90) -> str:
        """
        Generiere einen neuen kryptographischen Schlüssel
        
        Args:
            key_type: Typ des Schlüssels
            purpose: Verwendungszweck
            algorithm: Algorithmus
            key_size: Schlüsselgröße in Bits
            rotation_interval_days: Rotationsintervall in Tagen
            
        Returns:
            Schlüssel-ID
        """
        try:
            with self.lock:
                # Schlüssel-ID generieren
                key_id = self._generate_key_id(key_type, purpose)
                
                # Schlüssel generieren
                if key_type == KeyType.ASYMMETRIC:
                    key_data = self._generate_asymmetric_key(key_size)
                else:
                    key_data = self._generate_symmetric_key(key_size // 8)
                
                # Metadaten erstellen
                now = datetime.now(timezone.utc)
                expires_at = now + timedelta(days=rotation_interval_days) if rotation_interval_days > 0 else None
                
                checksum = hashlib.sha256(key_data).hexdigest()
                
                metadata = KeyMetadata(
                    key_id=key_id,
                    key_type=key_type,
                    algorithm=algorithm,
                    key_size=key_size,
                    created_at=now,
                    expires_at=expires_at,
                    last_used=None,
                    usage_count=0,
                    status=KeyStatus.ACTIVE,
                    purpose=purpose,
                    rotation_interval_days=rotation_interval_days,
                    checksum=checksum
                )
                
                # Schlüssel speichern
                self._save_key_to_file(key_id, key_data)
                
                # Metadaten speichern
                self.key_metadata[key_id] = metadata
                self._save_metadata()
                
                # In aktive Schlüssel aufnehmen
                self.active_keys[key_id] = key_data
                
                # Statistiken aktualisieren
                self.stats['total_keys'] += 1
                self.stats['active_keys'] += 1
                
                key_type_name = key_type.value
                if key_type_name not in self.stats['keys_by_type']:
                    self.stats['keys_by_type'][key_type_name] = 0
                self.stats['keys_by_type'][key_type_name] += 1
                
                # Audit-Log
                self.audit_logger.log_security_event(
                    event_type="key_generated",
                    severity=SeverityLevel.INFO,
                    description=f"New {key_type.value} key generated",
                    details={
                        "key_id": key_id,
                        "key_type": key_type.value,
                        "algorithm": algorithm,
                        "key_size": key_size,
                        "purpose": purpose
                    },
                    source_component="key_manager"
                )
                
                logger.info(f"Schlüssel generiert: {key_id} ({key_type.value}, {algorithm})")
                return key_id
                
        except Exception as e:
            logger.error(f"Fehler beim Generieren des Schlüssels: {e}")
            raise
    
    def get_key(self, key_id: str) -> Optional[bytes]:
        """
        Hole einen Schlüssel
        
        Args:
            key_id: Schlüssel-ID
            
        Returns:
            Schlüssel-Daten oder None
        """
        try:
            with self.lock:
                # Prüfe ob Schlüssel aktiv ist
                if key_id not in self.active_keys:
                    return None
                
                metadata = self.key_metadata.get(key_id)
                if not metadata or metadata.status != KeyStatus.ACTIVE:
                    return None
                
                # Prüfe Ablaufzeit
                if metadata.expires_at and datetime.now(timezone.utc) > metadata.expires_at:
                    self._expire_key(key_id)
                    return None
                
                # Nutzung protokollieren
                metadata.last_used = datetime.now(timezone.utc)
                metadata.usage_count += 1
                self._save_metadata()
                
                return self.active_keys[key_id]
                
        except Exception as e:
            logger.error(f"Fehler beim Abrufen des Schlüssels: {e}")
            return None
    
    def rotate_key(self, key_id: str) -> Optional[str]:
        """
        Rotiere einen Schlüssel (erstelle neuen und archiviere alten)
        
        Args:
            key_id: ID des zu rotierenden Schlüssels
            
        Returns:
            ID des neuen Schlüssels oder None
        """
        try:
            with self.lock:
                old_metadata = self.key_metadata.get(key_id)
                if not old_metadata:
                    return None
                
                # Neuen Schlüssel mit gleichen Parametern generieren
                new_key_id = self.generate_key(
                    key_type=old_metadata.key_type,
                    purpose=old_metadata.purpose,
                    algorithm=old_metadata.algorithm,
                    key_size=old_metadata.key_size,
                    rotation_interval_days=old_metadata.rotation_interval_days
                )
                
                # Alten Schlüssel archivieren
                self._archive_key(key_id)
                
                # Statistiken aktualisieren
                self.stats['rotations_performed'] += 1
                self.stats['last_rotation'] = datetime.now(timezone.utc).isoformat()
                
                # Audit-Log
                self.audit_logger.log_security_event(
                    event_type="key_rotated",
                    severity=SeverityLevel.INFO,
                    description="Key rotated",
                    details={
                        "old_key_id": key_id,
                        "new_key_id": new_key_id,
                        "key_type": old_metadata.key_type.value,
                        "purpose": old_metadata.purpose
                    },
                    source_component="key_manager"
                )
                
                logger.info(f"Schlüssel rotiert: {key_id} -> {new_key_id}")
                return new_key_id
                
        except Exception as e:
            logger.error(f"Fehler bei der Schlüsselrotation: {e}")
            return None
    
    def revoke_key(self, key_id: str, reason: str = "manual_revocation") -> bool:
        """
        Widerrufe einen Schlüssel
        
        Args:
            key_id: Schlüssel-ID
            reason: Grund für den Widerruf
            
        Returns:
            True wenn erfolgreich, False sonst
        """
        try:
            with self.lock:
                metadata = self.key_metadata.get(key_id)
                if not metadata:
                    return False
                
                # Status ändern
                metadata.status = KeyStatus.REVOKED
                
                # Aus aktiven Schlüsseln entfernen
                if key_id in self.active_keys:
                    del self.active_keys[key_id]
                    self.stats['active_keys'] -= 1
                
                # Metadaten speichern
                self._save_metadata()
                
                # Audit-Log
                self.audit_logger.log_security_event(
                    event_type="key_revoked",
                    severity=SeverityLevel.WARNING,
                    description=f"Key revoked: {reason}",
                    details={
                        "key_id": key_id,
                        "reason": reason,
                        "key_type": metadata.key_type.value
                    },
                    source_component="key_manager"
                )
                
                logger.warning(f"Schlüssel widerrufen: {key_id}, Grund: {reason}")
                return True
                
        except Exception as e:
            logger.error(f"Fehler beim Widerrufen des Schlüssels: {e}")
            return False
    
    def _generate_key_id(self, key_type: KeyType, purpose: str) -> str:
        """Generiere eine eindeutige Schlüssel-ID"""
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        random_suffix = secrets.token_hex(8)
        return f"{key_type.value}_{purpose}_{timestamp}_{random_suffix}"
    
    def _generate_symmetric_key(self, key_length: int) -> bytes:
        """Generiere symmetrischen Schlüssel"""
        return secrets.token_bytes(key_length)
    
    def _generate_asymmetric_key(self, key_size: int) -> bytes:
        """Generiere asymmetrischen Schlüssel (RSA)"""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=key_size,
            backend=default_backend()
        )
        
        # Private Key als PEM serialisieren
        pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        return pem
    
    def _save_key_to_file(self, key_id: str, key_data: bytes):
        """Speichere Schlüssel verschlüsselt in Datei"""
        try:
            key_file = self.keys_dir / f"{key_id}.key"
            
            # Schlüssel mit Master-Key verschlüsseln
            fernet = Fernet(base64.urlsafe_b64encode(self.master_key))
            encrypted_key = fernet.encrypt(key_data)
            
            with open(key_file, 'wb') as f:
                f.write(encrypted_key)
            
            os.chmod(key_file, 0o600)
            
        except Exception as e:
            logger.error(f"Fehler beim Speichern des Schlüssels: {e}")
            raise
    
    def _load_key_from_file(self, key_id: str) -> Optional[bytes]:
        """Lade Schlüssel aus Datei"""
        try:
            key_file = self.keys_dir / f"{key_id}.key"
            
            if not key_file.exists():
                return None
            
            with open(key_file, 'rb') as f:
                encrypted_key = f.read()
            
            # Schlüssel mit Master-Key entschlüsseln
            fernet = Fernet(base64.urlsafe_b64encode(self.master_key))
            key_data = fernet.decrypt(encrypted_key)
            
            return key_data
            
        except Exception as e:
            logger.error(f"Fehler beim Laden des Schlüssels: {e}")
            return None
    
    def _archive_key(self, key_id: str):
        """Archiviere einen Schlüssel"""
        try:
            metadata = self.key_metadata.get(key_id)
            if metadata:
                metadata.status = KeyStatus.ARCHIVED
                
                # Aus aktiven Schlüsseln entfernen
                if key_id in self.active_keys:
                    del self.active_keys[key_id]
                    self.stats['active_keys'] -= 1
                
                self._save_metadata()
                
        except Exception as e:
            logger.error(f"Fehler beim Archivieren des Schlüssels: {e}")
    
    def _expire_key(self, key_id: str):
        """Markiere Schlüssel als abgelaufen"""
        try:
            metadata = self.key_metadata.get(key_id)
            if metadata:
                metadata.status = KeyStatus.EXPIRED
                
                # Aus aktiven Schlüsseln entfernen
                if key_id in self.active_keys:
                    del self.active_keys[key_id]
                    self.stats['active_keys'] -= 1
                
                self._save_metadata()
                
                # Audit-Log
                self.audit_logger.log_security_event(
                    event_type="key_expired",
                    severity=SeverityLevel.WARNING,
                    description="Key expired",
                    details={"key_id": key_id},
                    source_component="key_manager"
                )
                
        except Exception as e:
            logger.error(f"Fehler beim Ablaufen des Schlüssels: {e}")
    
    def _start_rotation_thread(self):
        """Starte Thread für automatische Schlüsselrotation"""
        try:
            if self.key_rotation_config.get('auto_rotate', True):
                self.rotation_thread = threading.Thread(
                    target=self._auto_rotation_worker,
                    daemon=True,
                    name="KeyRotation"
                )
                self.rotation_thread.start()
                logger.info("Automatische Schlüsselrotation gestartet")
                
        except Exception as e:
            logger.error(f"Fehler beim Starten der Rotation: {e}")
    
    def _auto_rotation_worker(self):
        """Worker für automatische Schlüsselrotation"""
        while not self.shutdown_event.is_set():
            try:
                # Alle 24 Stunden prüfen
                if self.shutdown_event.wait(86400):  # 24 Stunden
                    break
                
                self._check_and_rotate_keys()
                
            except Exception as e:
                logger.error(f"Fehler bei automatischer Rotation: {e}")
    
    def _check_and_rotate_keys(self):
        """Prüfe und rotiere Schlüssel die ablaufen"""
        try:
            with self.lock:
                now = datetime.now(timezone.utc)
                keys_to_rotate = []
                
                for key_id, metadata in self.key_metadata.items():
                    if (metadata.status == KeyStatus.ACTIVE and 
                        metadata.expires_at and 
                        now >= metadata.expires_at):
                        keys_to_rotate.append(key_id)
                
                for key_id in keys_to_rotate:
                    self.rotate_key(key_id)
                
                if keys_to_rotate:
                    logger.info(f"Automatische Rotation: {len(keys_to_rotate)} Schlüssel rotiert")
                
        except Exception as e:
            logger.error(f"Fehler bei der automatischen Rotation: {e}")
    
    def get_key_metadata(self, key_id: str) -> Optional[KeyMetadata]:
        """Hole Metadaten für einen Schlüssel"""
        return self.key_metadata.get(key_id)
    
    def list_keys(self, key_type: Optional[KeyType] = None, 
                  status: Optional[KeyStatus] = None) -> List[KeyMetadata]:
        """
        Liste Schlüssel basierend auf Filtern
        
        Args:
            key_type: Filter nach Schlüsseltyp
            status: Filter nach Status
            
        Returns:
            Liste der Schlüssel-Metadaten
        """
        try:
            with self.lock:
                keys = []
                
                for metadata in self.key_metadata.values():
                    if key_type and metadata.key_type != key_type:
                        continue
                    if status and metadata.status != status:
                        continue
                    
                    keys.append(metadata)
                
                return keys
                
        except Exception as e:
            logger.error(f"Fehler beim Listen der Schlüssel: {e}")
            return []
    
    def get_statistics(self) -> Dict[str, Any]:
        """Hole Key-Manager-Statistiken"""
        with self.lock:
            return self.stats.copy()
    
    def cleanup_old_keys(self, max_age_days: int = 365):
        """
        Bereinige alte archivierte/widerrufene Schlüssel
        
        Args:
            max_age_days: Maximales Alter in Tagen
        """
        try:
            with self.lock:
                cutoff_date = datetime.now(timezone.utc) - timedelta(days=max_age_days)
                keys_to_remove = []
                
                for key_id, metadata in self.key_metadata.items():
                    if (metadata.status in [KeyStatus.ARCHIVED, KeyStatus.REVOKED] and
                        metadata.created_at < cutoff_date):
                        keys_to_remove.append(key_id)
                
                for key_id in keys_to_remove:
                    # Schlüsseldatei löschen
                    key_file = self.keys_dir / f"{key_id}.key"
                    if key_file.exists():
                        key_file.unlink()
                    
                    # Metadaten entfernen
                    del self.key_metadata[key_id]
                
                if keys_to_remove:
                    self._save_metadata()
                    logger.info(f"Alte Schlüssel bereinigt: {len(keys_to_remove)}")
                
                # Audit-Log
                if keys_to_remove:
                    self.audit_logger.log_security_event(
                        event_type="old_keys_cleaned",
                        severity=SeverityLevel.INFO,
                        description="Old keys cleaned up",
                        details={
                            "removed_count": len(keys_to_remove),
                            "max_age_days": max_age_days
                        },
                        source_component="key_manager"
                    )
                
        except Exception as e:
            logger.error(f"Fehler bei der Schlüsselbereinigung: {e}")
    
    def shutdown(self):
        """Beende Key-Manager ordnungsgemäß"""
        try:
            # Shutdown-Signal setzen
            self.shutdown_event.set()
            
            # Warte auf Rotation-Thread
            if self.rotation_thread and self.rotation_thread.is_alive():
                self.rotation_thread.join(timeout=5.0)
            
            # Aktive Schlüssel aus Speicher löschen
            with self.lock:
                self.active_keys.clear()
                self.master_key = None
            
            logger.info("Key-Manager erfolgreich beendet")
            
        except Exception as e:
            logger.error(f"Fehler beim Beenden des Key-Managers: {e}")