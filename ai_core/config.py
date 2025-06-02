"""
Creative Muse AI - Sichere Konfigurationsverwaltung
"""

import os
import yaml
from pathlib import Path
from typing import Dict, Any, Optional
from pydantic_settings import BaseSettings
from pydantic import Field
from cryptography.fernet import Fernet
import logging

# Basis-Pfade
BASE_DIR = Path(__file__).parent.parent
SECURITY_CONFIG_PATH = BASE_DIR / "security-config.yaml"
KEYS_DIR = BASE_DIR / "security" / "keys"
LOGS_DIR = BASE_DIR / "logs"


class SecurityConfig:
    """Sichere Konfigurationsverwaltung"""

    def __init__(self):
        self.config = self._load_security_config()
        self._setup_logging()

    def _load_security_config(self) -> Dict[str, Any]:
        """Lade Sicherheitskonfiguration"""
        try:
            with open(SECURITY_CONFIG_PATH, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            logging.warning(
                f"Sicherheitskonfiguration nicht gefunden: {SECURITY_CONFIG_PATH}"
            )
            return self._get_default_config()

    def _get_default_config(self) -> Dict[str, Any]:
        """Standard-Sicherheitskonfiguration"""
        return {
            "encryption": {
                "algorithm": "AES-256-GCM",
                "key_derivation": {"algorithm": "PBKDF2", "iterations": 100000},
            },
            "audit": {
                "level": 4,
                "categories": ["data_access", "system_events", "security_events"],
            },
            "network": {
                "tls": {"version": "1.3"},
                "api": {"rate_limiting": {"enabled": True}},
            },
        }

    def _setup_logging(self):
        """Konfiguriere sicheres Logging"""
        log_level = (
            self.config.get("development", {}).get("debug", {}).get("log_level", "INFO")
        )

        # Erstelle Log-Verzeichnisse
        for log_type in ["audit", "security", "performance"]:
            (LOGS_DIR / log_type).mkdir(parents=True, exist_ok=True)

        logging.basicConfig(
            level=getattr(logging, log_level),
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=[
                logging.FileHandler(LOGS_DIR / "security" / "app.log"),
                logging.StreamHandler(),
            ],
        )


class DatabaseConfig(BaseSettings):
    """Datenbank-Konfiguration"""

    # SQLite-Konfiguration
    database_url: str = Field(
        default="sqlite:///./database/creative_muse.db", description="Datenbank-URL"
    )

    # Verschlüsselungseinstellungen
    encrypt_database: bool = Field(default=True, description="Datenbank verschlüsseln")

    # Connection Pool
    pool_size: int = Field(default=5, description="Verbindungspool-Größe")

    pool_timeout: int = Field(default=30, description="Verbindungs-Timeout in Sekunden")

    # Backup-Einstellungen
    auto_backup: bool = Field(default=True, description="Automatische Backups")

    backup_interval_hours: int = Field(
        default=24, description="Backup-Intervall in Stunden"
    )


class AIModelConfig(BaseSettings):
    """AI-Modell-Konfiguration"""

    # Modell-Einstellungen
    model_name: str = Field(
        default="mistralai/Mistral-7B-Instruct-v0.3",
        description="HuggingFace Modell-Name",
    )

    model_path: str = Field(
        default="./ai_core/models/mistral-7b-instruct",
        description="Lokaler Modell-Pfad",
    )

    # Hardware-Konfiguration
    device: str = Field(
        default="auto", description="Gerät für Modell-Inferenz (auto, cpu, cuda)"
    )

    max_memory_gb: int = Field(
        default=8, description="Maximaler Speicherverbrauch in GB"
    )

    # Generierungs-Parameter
    max_length: int = Field(default=2048, description="Maximale Antwortlänge")

    temperature: float = Field(default=0.7, description="Kreativitäts-Parameter")

    top_p: float = Field(default=0.9, description="Nucleus Sampling Parameter")

    # Sicherheitseinstellungen
    input_max_length: int = Field(default=10000, description="Maximale Eingabelänge")

    enable_content_filter: bool = Field(
        default=True, description="Content-Filter aktivieren"
    )


class APIConfig(BaseSettings):
    """API-Konfiguration"""

    # Server-Einstellungen
    host: str = Field(default="127.0.0.1", description="Server-Host")

    port: int = Field(default=8000, description="Server-Port")

    # TLS-Konfiguration
    use_tls: bool = Field(default=True, description="TLS verwenden")

    cert_file: str = Field(
        default="./security/certificates/server.crt", description="TLS-Zertifikat"
    )

    key_file: str = Field(
        default="./security/certificates/server.key",
        description="TLS-Privater Schlüssel",
    )

    # CORS-Einstellungen
    cors_origins: list[str] = Field(
        default=["http://localhost:3000", "https://localhost:3000"],
        description="Erlaubte CORS-Origins",
    )

    # Rate Limiting
    rate_limit_requests: int = Field(default=60, description="Anfragen pro Minute")

    rate_limit_burst: int = Field(default=10, description="Burst-Limit")

    # Session-Konfiguration
    session_timeout_minutes: int = Field(
        default=30, description="Session-Timeout in Minuten"
    )

    max_concurrent_sessions: int = Field(
        default=1, description="Maximale gleichzeitige Sessions"
    )


class MonitoringConfig(BaseSettings):
    """Monitoring-Konfiguration"""

    # Performance-Monitoring
    enable_monitoring: bool = Field(default=True, description="Monitoring aktivieren")

    metrics_interval_seconds: int = Field(
        default=30, description="Metriken-Intervall in Sekunden"
    )

    # Alert-Schwellenwerte
    cpu_alert_threshold: int = Field(
        default=80, description="CPU-Alert-Schwellenwert in Prozent"
    )

    memory_alert_threshold: int = Field(
        default=85, description="Speicher-Alert-Schwellenwert in Prozent"
    )

    disk_alert_threshold: int = Field(
        default=90, description="Festplatten-Alert-Schwellenwert in Prozent"
    )

    # Audit-Konfiguration
    audit_level: int = Field(default=4, description="Audit-Level (1-5)")

    audit_categories: list = Field(
        default=["data_access", "system_events", "security_events"],
        description="Audit-Kategorien",
    )


class AppConfig:
    """Hauptkonfigurationsklasse"""

    def __init__(self):
        self.security = SecurityConfig()
        self.database = DatabaseConfig()
        self.ai_model = AIModelConfig()
        self.api = APIConfig()
        self.monitoring = MonitoringConfig()

        # Umgebungsvariablen laden
        self._load_environment_variables()

    def _load_environment_variables(self):
        """Lade Umgebungsvariablen"""
        # Entwicklungsmodus
        self.debug = os.getenv("DEBUG", "false").lower() == "true"

        # Verschlüsselungsschlüssel
        self.encryption_key = os.getenv("ENCRYPTION_KEY")
        if not self.encryption_key and not self.debug:
            raise ValueError("ENCRYPTION_KEY Umgebungsvariable ist erforderlich")

    def get_database_url(self) -> str:
        """Sichere Datenbank-URL generieren"""
        if self.database.encrypt_database:
            # SQLCipher-URL für verschlüsselte Datenbank
            return f"sqlite+pysqlcipher://:{self.encryption_key}@/{self.database.database_url.replace('sqlite:///', '')}"
        return self.database.database_url

    def get_tls_context(self):
        """TLS-Kontext für sichere Kommunikation"""
        if not self.api.use_tls:
            return None

        import ssl

        context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        context.load_cert_chain(self.api.cert_file, self.api.key_file)
        context.minimum_version = ssl.TLSVersion.TLSv1_3
        return context

    def is_development(self) -> bool:
        """Prüfe ob Entwicklungsmodus aktiv ist"""
        return self.debug

    def get_log_config(self) -> Dict[str, Any]:
        """Logging-Konfiguration"""
        return {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                },
                "security": {
                    "format": "%(asctime)s - SECURITY - %(levelname)s - %(message)s",
                },
            },
            "handlers": {
                "default": {
                    "formatter": "default",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                },
                "security": {
                    "formatter": "security",
                    "class": "logging.FileHandler",
                    "filename": str(LOGS_DIR / "security" / "security.log"),
                },
                "audit": {
                    "formatter": "default",
                    "class": "logging.FileHandler",
                    "filename": str(LOGS_DIR / "audit" / "audit.log"),
                },
            },
            "loggers": {
                "": {
                    "level": "INFO",
                    "handlers": ["default"],
                },
                "security": {
                    "level": "INFO",
                    "handlers": ["security"],
                    "propagate": False,
                },
                "audit": {
                    "level": "INFO",
                    "handlers": ["audit"],
                    "propagate": False,
                },
            },
        }


# Globale Konfigurationsinstanz
config = AppConfig()
