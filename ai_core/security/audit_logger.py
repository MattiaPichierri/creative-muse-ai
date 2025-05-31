"""
Creative Muse AI - Audit-Logger
Umfassende Sicherheits- und Compliance-Protokollierung
"""

import json
import logging
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional, List
from enum import Enum
import hashlib
import uuid
from dataclasses import dataclass, asdict
import queue
import time


class AuditLevel(Enum):
    """Audit-Level für verschiedene Ereignistypen"""

    MINIMAL = 1
    BASIC = 2
    STANDARD = 3
    DETAILED = 4
    COMPREHENSIVE = 5


class EventCategory(Enum):
    """Kategorien für Audit-Ereignisse"""

    DATA_ACCESS = "data_access"
    SYSTEM_EVENTS = "system_events"
    SECURITY_EVENTS = "security_events"
    PERFORMANCE_EVENTS = "performance_events"
    ERROR_EVENTS = "error_events"
    USER_ACTIONS = "user_actions"
    API_CALLS = "api_calls"
    DATABASE_OPERATIONS = "database_operations"
    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"


class SeverityLevel(Enum):
    """Schweregrad von Ereignissen"""

    INFO = 1
    WARNING = 2
    ERROR = 3
    CRITICAL = 4
    EMERGENCY = 5


@dataclass
class AuditEvent:
    """Struktur für Audit-Ereignisse"""

    event_id: str
    timestamp: str
    category: str
    event_type: str
    severity: int
    source_component: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    description: str = ""
    details: Dict[str, Any] = None
    outcome: str = "success"  # success, failure, error
    duration_ms: Optional[int] = None
    data_classification: str = "internal"  # public, internal, confidential, secret
    compliance_tags: List[str] = None
    checksum: Optional[str] = None


class AuditLogger:
    """Zentraler Audit-Logger für alle Sicherheitsereignisse"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.audit_config = config.get("audit", {})
        self.audit_level = AuditLevel(self.audit_config.get("level", 4))
        self.enabled_categories = set(self.audit_config.get("categories", []))

        # Logging-Setup
        self.logs_dir = Path("logs")
        self.audit_dir = self.logs_dir / "audit"
        self.security_dir = self.logs_dir / "security"

        # Thread-sichere Queue für asynchrone Protokollierung
        self.event_queue = queue.Queue()
        self.processing_thread = None
        self.shutdown_event = threading.Event()

        # Statistiken
        self.stats = {
            "total_events": 0,
            "events_by_category": {},
            "events_by_severity": {},
            "last_event_time": None,
        }

        self._setup_logging()
        self._start_processing_thread()

    def _setup_logging(self):
        """Richte Logging-Infrastruktur ein"""
        try:
            # Verzeichnisse erstellen
            self.audit_dir.mkdir(parents=True, exist_ok=True)
            self.security_dir.mkdir(parents=True, exist_ok=True)

            # Berechtigungen setzen
            import os

            os.chmod(self.logs_dir, 0o700)
            os.chmod(self.audit_dir, 0o700)
            os.chmod(self.security_dir, 0o700)

            # Logger konfigurieren
            self.audit_logger = logging.getLogger("audit")
            self.security_logger = logging.getLogger("security")

            # Handler für verschiedene Log-Typen
            self._setup_file_handlers()

            print("Audit-Logging erfolgreich eingerichtet")

        except Exception as e:
            print(f"Fehler beim Einrichten des Audit-Loggings: {e}")
            raise

    def _setup_file_handlers(self):
        """Richte Datei-Handler für verschiedene Log-Kategorien ein"""
        try:
            # Audit-Handler
            audit_handler = logging.FileHandler(
                self.audit_dir / f"audit_{datetime.now().strftime('%Y%m%d')}.log"
            )
            audit_handler.setFormatter(
                logging.Formatter("%(asctime)s - AUDIT - %(message)s")
            )
            self.audit_logger.addHandler(audit_handler)
            self.audit_logger.setLevel(logging.INFO)

            # Security-Handler
            security_handler = logging.FileHandler(
                self.security_dir / f"security_{datetime.now().strftime('%Y%m%d')}.log"
            )
            security_handler.setFormatter(
                logging.Formatter(
                    "%(asctime)s - SECURITY - %(levelname)s - %(message)s"
                )
            )
            self.security_logger.addHandler(security_handler)
            self.security_logger.setLevel(logging.INFO)

            # Kategorie-spezifische Handler
            for category in EventCategory:
                category_handler = logging.FileHandler(
                    self.audit_dir
                    / f"{category.value}_{datetime.now().strftime('%Y%m%d')}.log"
                )
                category_handler.setFormatter(
                    logging.Formatter(
                        f"%(asctime)s - {category.value.upper()} - %(message)s"
                    )
                )

                category_logger = logging.getLogger(f"audit.{category.value}")
                category_logger.addHandler(category_handler)
                category_logger.setLevel(logging.INFO)

        except Exception as e:
            print(f"Fehler beim Einrichten der Datei-Handler: {e}")
            raise

    def _start_processing_thread(self):
        """Starte Thread für asynchrone Event-Verarbeitung"""
        try:
            self.processing_thread = threading.Thread(
                target=self._process_events, daemon=True, name="AuditProcessor"
            )
            self.processing_thread.start()

        except Exception as e:
            print(f"Fehler beim Starten des Processing-Threads: {e}")
            raise

    def _process_events(self):
        """Verarbeite Events aus der Queue"""
        while not self.shutdown_event.is_set():
            try:
                # Event aus Queue holen (mit Timeout)
                event = self.event_queue.get(timeout=1.0)

                # Event verarbeiten
                self._write_event(event)
                self._update_statistics(event)

                # Queue-Task als erledigt markieren
                self.event_queue.task_done()

            except queue.Empty:
                # Timeout - normal, weiter warten
                continue
            except Exception as e:
                print(f"Fehler bei der Event-Verarbeitung: {e}")

    def log_event(
        self,
        category: EventCategory,
        event_type: str,
        severity: SeverityLevel = SeverityLevel.INFO,
        source_component: str = "unknown",
        description: str = "",
        details: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        outcome: str = "success",
        duration_ms: Optional[int] = None,
        data_classification: str = "internal",
        compliance_tags: Optional[List[str]] = None,
    ) -> str:
        """
        Protokolliere ein Audit-Ereignis

        Args:
            category: Ereigniskategorie
            event_type: Spezifischer Ereignistyp
            severity: Schweregrad
            source_component: Quell-Komponente
            description: Ereignisbeschreibung
            details: Zusätzliche Details
            user_id: Benutzer-ID (falls verfügbar)
            session_id: Session-ID
            ip_address: IP-Adresse
            user_agent: User-Agent
            outcome: Ergebnis (success, failure, error)
            duration_ms: Dauer in Millisekunden
            data_classification: Datenklassifizierung
            compliance_tags: Compliance-Tags

        Returns:
            Event-ID
        """
        try:
            # Prüfe ob Kategorie aktiviert ist
            if category.value not in self.enabled_categories:
                return ""

            # Prüfe Audit-Level
            if not self._should_log_event(category, severity):
                return ""

            # Event-ID generieren
            event_id = str(uuid.uuid4())

            # Timestamp erstellen
            timestamp = datetime.now(timezone.utc).isoformat()

            # Event erstellen
            event = AuditEvent(
                event_id=event_id,
                timestamp=timestamp,
                category=category.value,
                event_type=event_type,
                severity=severity.value,
                source_component=source_component,
                user_id=user_id,
                session_id=session_id,
                ip_address=ip_address,
                user_agent=user_agent,
                description=description,
                details=details or {},
                outcome=outcome,
                duration_ms=duration_ms,
                data_classification=data_classification,
                compliance_tags=compliance_tags or [],
            )

            # Checksum berechnen
            event.checksum = self._calculate_checksum(event)

            # Event zur Queue hinzufügen
            self.event_queue.put(event)

            return event_id

        except Exception as e:
            print(f"Fehler beim Protokollieren des Events: {e}")
            return ""

    def _should_log_event(
        self, category: EventCategory, severity: SeverityLevel
    ) -> bool:
        """Prüfe ob Event protokolliert werden soll basierend auf Level und Kategorie"""

        # Immer kritische und Notfall-Events protokollieren
        if severity in [SeverityLevel.CRITICAL, SeverityLevel.EMERGENCY]:
            return True

        # Sicherheitsereignisse haben Priorität
        if (
            category == EventCategory.SECURITY_EVENTS
            and severity.value >= SeverityLevel.WARNING.value
        ):
            return True

        # Basierend auf Audit-Level entscheiden
        if self.audit_level == AuditLevel.MINIMAL:
            return severity.value >= SeverityLevel.ERROR.value
        elif self.audit_level == AuditLevel.BASIC:
            return severity.value >= SeverityLevel.WARNING.value
        elif self.audit_level == AuditLevel.STANDARD:
            return severity.value >= SeverityLevel.INFO.value
        else:
            # DETAILED oder COMPREHENSIVE - alles protokollieren
            return True

    def _calculate_checksum(self, event: AuditEvent) -> str:
        """Berechne Checksum für Event-Integrität"""
        try:
            # Event zu Dictionary konvertieren (ohne checksum)
            event_dict = asdict(event)
            event_dict.pop("checksum", None)

            # JSON-String erstellen (sortiert für Konsistenz)
            event_json = json.dumps(event_dict, sort_keys=True, separators=(",", ":"))

            # SHA-256 Hash berechnen
            return hashlib.sha256(event_json.encode("utf-8")).hexdigest()

        except Exception as e:
            print(f"Fehler bei Checksum-Berechnung: {e}")
            return ""

    def _write_event(self, event: AuditEvent):
        """Schreibe Event in entsprechende Log-Dateien"""
        try:
            # Event zu JSON konvertieren
            event_json = json.dumps(asdict(event), separators=(",", ":"))

            # In Haupt-Audit-Log schreiben
            self.audit_logger.info(event_json)

            # In kategorie-spezifisches Log schreiben
            category_logger = logging.getLogger(f"audit.{event.category}")
            category_logger.info(event_json)

            # Sicherheitsereignisse zusätzlich in Security-Log
            if event.category == EventCategory.SECURITY_EVENTS.value:
                if event.severity >= SeverityLevel.WARNING.value:
                    self.security_logger.warning(event_json)
                elif event.severity >= SeverityLevel.ERROR.value:
                    self.security_logger.error(event_json)
                elif event.severity >= SeverityLevel.CRITICAL.value:
                    self.security_logger.critical(event_json)
                else:
                    self.security_logger.info(event_json)

        except Exception as e:
            print(f"Fehler beim Schreiben des Events: {e}")

    def _update_statistics(self, event: AuditEvent):
        """Aktualisiere Audit-Statistiken"""
        try:
            self.stats["total_events"] += 1
            self.stats["last_event_time"] = event.timestamp

            # Kategorie-Statistiken
            if event.category not in self.stats["events_by_category"]:
                self.stats["events_by_category"][event.category] = 0
            self.stats["events_by_category"][event.category] += 1

            # Severity-Statistiken
            severity_name = SeverityLevel(event.severity).name
            if severity_name not in self.stats["events_by_severity"]:
                self.stats["events_by_severity"][severity_name] = 0
            self.stats["events_by_severity"][severity_name] += 1

        except Exception as e:
            print(f"Fehler beim Aktualisieren der Statistiken: {e}")

    # Convenience-Methoden für häufige Event-Typen

    def log_data_access(
        self,
        operation: str,
        table_name: str,
        record_count: int = 1,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
    ):
        """Protokolliere Datenzugriff"""
        return self.log_event(
            category=EventCategory.DATA_ACCESS,
            event_type=f"database_{operation}",
            source_component="database",
            description=f"{operation.upper()} operation on {table_name}",
            details={
                "table_name": table_name,
                "operation": operation,
                "record_count": record_count,
            },
            user_id=user_id,
            session_id=session_id,
        )

    def log_authentication(
        self,
        auth_type: str,
        outcome: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        failure_reason: Optional[str] = None,
    ):
        """Protokolliere Authentifizierung"""
        severity = SeverityLevel.INFO if outcome == "success" else SeverityLevel.WARNING

        details = {"auth_type": auth_type}
        if failure_reason:
            details["failure_reason"] = failure_reason

        return self.log_event(
            category=EventCategory.AUTHENTICATION,
            event_type=f"auth_{auth_type}",
            severity=severity,
            source_component="auth_system",
            description=f"Authentication attempt: {auth_type}",
            details=details,
            user_id=user_id,
            ip_address=ip_address,
            outcome=outcome,
        )

    def log_api_call(
        self,
        endpoint: str,
        method: str,
        status_code: int,
        duration_ms: int,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        ip_address: Optional[str] = None,
    ):
        """Protokolliere API-Aufruf"""
        severity = SeverityLevel.INFO
        if status_code >= 400:
            severity = SeverityLevel.WARNING
        if status_code >= 500:
            severity = SeverityLevel.ERROR

        outcome = "success" if status_code < 400 else "error"

        return self.log_event(
            category=EventCategory.API_CALLS,
            event_type="api_request",
            severity=severity,
            source_component="api_server",
            description=f"{method} {endpoint}",
            details={
                "endpoint": endpoint,
                "method": method,
                "status_code": status_code,
            },
            user_id=user_id,
            session_id=session_id,
            ip_address=ip_address,
            outcome=outcome,
            duration_ms=duration_ms,
        )

    def log_security_event(
        self,
        event_type: str,
        severity: SeverityLevel,
        description: str,
        details: Optional[Dict[str, Any]] = None,
        source_component: str = "security_system",
    ):
        """Protokolliere Sicherheitsereignis"""
        return self.log_event(
            category=EventCategory.SECURITY_EVENTS,
            event_type=event_type,
            severity=severity,
            source_component=source_component,
            description=description,
            details=details,
            compliance_tags=["security", "monitoring"],
        )

    def log_error(
        self,
        error_type: str,
        error_message: str,
        source_component: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        """Protokolliere Fehler"""
        return self.log_event(
            category=EventCategory.ERROR_EVENTS,
            event_type=error_type,
            severity=SeverityLevel.ERROR,
            source_component=source_component,
            description=error_message,
            details=details,
            outcome="error",
        )

    def get_statistics(self) -> Dict[str, Any]:
        """Hole aktuelle Audit-Statistiken"""
        return self.stats.copy()

    def verify_event_integrity(self, event_json: str) -> bool:
        """Überprüfe Integrität eines Events anhand der Checksum"""
        try:
            event_dict = json.loads(event_json)
            stored_checksum = event_dict.pop("checksum", "")

            # Checksum neu berechnen
            event_json_clean = json.dumps(
                event_dict, sort_keys=True, separators=(",", ":")
            )
            calculated_checksum = hashlib.sha256(
                event_json_clean.encode("utf-8")
            ).hexdigest()

            return stored_checksum == calculated_checksum

        except Exception as e:
            print(f"Fehler bei der Integritätsprüfung: {e}")
            return False

    def shutdown(self):
        """Beende Audit-Logger ordnungsgemäß"""
        try:
            # Shutdown-Signal setzen
            self.shutdown_event.set()

            # Warte auf Verarbeitung aller Events
            self.event_queue.join()

            # Warte auf Thread-Ende
            if self.processing_thread and self.processing_thread.is_alive():
                self.processing_thread.join(timeout=5.0)

            print("Audit-Logger erfolgreich beendet")

        except Exception as e:
            print(f"Fehler beim Beenden des Audit-Loggers: {e}")
