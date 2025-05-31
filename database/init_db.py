#!/usr/bin/env python3
"""
Creative Muse AI - Datenbank-Initialisierung
Sichere Initialisierung der verschlüsselten SQLite-Datenbank
"""

import os
import sys
import sqlite3
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone
import base64
from typing import Dict, Any, Optional

# Pfad zum Projektroot hinzufügen
sys.path.append(str(Path(__file__).parent.parent))

from ai_core.security.crypto_manager import CryptoManager
from ai_core.security.audit_logger import AuditLogger, EventCategory, SeverityLevel

class DatabaseInitializer:
    """Sichere Datenbank-Initialisierung mit Verschlüsselung"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or self._load_default_config()
        self.db_path = Path("database/creative_muse.db")
        self.schema_path = Path("database/schema.sql")
        
        # Sicherheitskomponenten
        self.crypto_manager = None
        self.audit_logger = None
        
        # Statistiken
        self.stats = {
            'tables_created': 0,
            'indexes_created': 0,
            'triggers_created': 0,
            'views_created': 0,
            'initial_records': 0
        }
    
    def _load_default_config(self) -> Dict[str, Any]:
        """Lade Standard-Konfiguration"""
        return {
            'encryption': {
                'algorithm': 'AES-256-GCM',
                'key_derivation': {
                    'algorithm': 'PBKDF2',
                    'iterations': 100000
                }
            },
            'audit': {
                'level': 4,
                'categories': ['data_access', 'system_events', 'security_events']
            },
            'database': {
                'encrypt_database': True,
                'auto_backup': True,
                'wal_mode': True
            }
        }
    
    def initialize(self) -> bool:
        """Hauptinitialisierungsprozess"""
        try:
            print("🚀 Creative Muse AI - Datenbank-Initialisierung")
            print("=" * 60)
            
            # 1. Sicherheitskomponenten initialisieren
            self._initialize_security_components()
            
            # 2. Verzeichnisse erstellen
            self._create_directories()
            
            # 3. Datenbank erstellen und konfigurieren
            self._create_database()
            
            # 4. Schema laden
            self._load_schema()
            
            # 5. Verschlüsselungsschlüssel einrichten
            self._setup_encryption_keys()
            
            # 6. Initial-Daten einfügen
            self._insert_initial_data()
            
            # 7. Datenbank optimieren
            self._optimize_database()
            
            # 8. Integrität prüfen
            self._verify_integrity()
            
            # 9. Backup erstellen
            self._create_initial_backup()
            
            print("\n" + "=" * 60)
            print("✅ Datenbank-Initialisierung erfolgreich abgeschlossen!")
            self._print_statistics()
            
            return True
            
        except Exception as e:
            print(f"\n❌ Fehler bei der Datenbank-Initialisierung: {e}")
            return False
    
    def _initialize_security_components(self):
        """Initialisiere Sicherheitskomponenten"""
        try:
            print("\n🔒 Initialisiere Sicherheitskomponenten...")
            
            # Crypto-Manager
            self.crypto_manager = CryptoManager(self.config)
            print("✅ Crypto-Manager initialisiert")
            
            # Audit-Logger
            self.audit_logger = AuditLogger(self.config)
            print("✅ Audit-Logger initialisiert")
            
            # Audit-Event für Initialisierung
            self.audit_logger.log_event(
                category=EventCategory.SYSTEM_EVENTS,
                event_type="database_initialization_started",
                source_component="database_initializer",
                description="Database initialization process started"
            )
            
        except Exception as e:
            print(f"❌ Fehler bei der Sicherheitsinitialisierung: {e}")
            raise
    
    def _create_directories(self):
        """Erstelle notwendige Verzeichnisse"""
        try:
            print("\n📁 Erstelle Verzeichnisse...")
            
            directories = [
                "database",
                "database/backups",
                "logs/database"
            ]
            
            for directory in directories:
                path = Path(directory)
                path.mkdir(parents=True, exist_ok=True)
                os.chmod(path, 0o700)
                print(f"✅ {directory}")
            
        except Exception as e:
            print(f"❌ Fehler beim Erstellen der Verzeichnisse: {e}")
            raise
    
    def _create_database(self):
        """Erstelle und konfiguriere Datenbank"""
        try:
            print(f"\n🗄️ Erstelle Datenbank: {self.db_path}")
            
            # Prüfe ob Datenbank bereits existiert
            if self.db_path.exists():
                backup_path = self.db_path.with_suffix('.db.backup')
                print(f"⚠️  Datenbank existiert bereits. Backup erstellt: {backup_path}")
                self.db_path.rename(backup_path)
            
            # Neue Datenbank erstellen
            conn = sqlite3.connect(str(self.db_path))
            
            # Sichere Konfiguration
            self._configure_database(conn)
            
            conn.close()
            
            # Berechtigungen setzen
            os.chmod(self.db_path, 0o600)
            
            print(f"✅ Datenbank erstellt: {self.db_path}")
            
        except Exception as e:
            print(f"❌ Fehler beim Erstellen der Datenbank: {e}")
            raise
    
    def _configure_database(self, conn: sqlite3.Connection):
        """Konfiguriere Datenbank-Einstellungen"""
        try:
            cursor = conn.cursor()
            
            # Sichere Konfiguration
            configurations = [
                "PRAGMA foreign_keys = ON",
                "PRAGMA journal_mode = WAL",
                "PRAGMA synchronous = FULL",
                "PRAGMA secure_delete = ON",
                "PRAGMA auto_vacuum = INCREMENTAL",
                "PRAGMA temp_store = MEMORY",
                "PRAGMA cache_size = -64000",  # 64MB Cache
            ]
            
            for config in configurations:
                cursor.execute(config)
                print(f"✅ {config}")
            
            conn.commit()
            
        except Exception as e:
            print(f"❌ Fehler bei der Datenbank-Konfiguration: {e}")
            raise
    
    def _load_schema(self):
        """Lade und führe Schema-SQL aus"""
        try:
            print(f"\n📋 Lade Schema: {self.schema_path}")
            
            if not self.schema_path.exists():
                raise FileNotFoundError(f"Schema-Datei nicht gefunden: {self.schema_path}")
            
            # Schema-SQL lesen
            with open(self.schema_path, 'r', encoding='utf-8') as f:
                schema_sql = f.read()
            
            # SQL ausführen
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            
            # Schema in Teile aufteilen und ausführen
            statements = self._split_sql_statements(schema_sql)
            
            for i, statement in enumerate(statements):
                if statement.strip():
                    try:
                        cursor.execute(statement)
                        
                        # Statistiken aktualisieren
                        if 'CREATE TABLE' in statement.upper():
                            self.stats['tables_created'] += 1
                        elif 'CREATE INDEX' in statement.upper():
                            self.stats['indexes_created'] += 1
                        elif 'CREATE TRIGGER' in statement.upper():
                            self.stats['triggers_created'] += 1
                        elif 'CREATE VIEW' in statement.upper():
                            self.stats['views_created'] += 1
                        
                    except sqlite3.Error as e:
                        print(f"⚠️  Warnung bei Statement {i+1}: {e}")
            
            conn.commit()
            conn.close()
            
            print(f"✅ Schema geladen: {len(statements)} Statements ausgeführt")
            
        except Exception as e:
            print(f"❌ Fehler beim Laden des Schemas: {e}")
            raise
    
    def _split_sql_statements(self, sql: str) -> list:
        """Teile SQL in einzelne Statements auf"""
        # Einfache Aufteilung - in Produktion sollte ein SQL-Parser verwendet werden
        statements = []
        current_statement = ""
        in_comment = False
        
        for line in sql.split('\n'):
            line = line.strip()
            
            # Kommentare überspringen
            if line.startswith('--') or line.startswith('/*'):
                continue
            
            if line.endswith('*/'):
                in_comment = False
                continue
            
            if in_comment:
                continue
            
            if line.startswith('/*'):
                in_comment = True
                continue
            
            if line:
                current_statement += line + '\n'
                
                if line.endswith(';'):
                    statements.append(current_statement.strip())
                    current_statement = ""
        
        return statements
    
    def _setup_encryption_keys(self):
        """Richte Verschlüsselungsschlüssel ein"""
        try:
            print("\n🔐 Richte Verschlüsselungsschlüssel ein...")
            
            # Schlüssel für verschiedene Zwecke generieren
            key_types = [
                ("database_content", "Datenbank-Inhalte"),
                ("audit_logs", "Audit-Logs"),
                ("session_data", "Session-Daten"),
                ("backup_data", "Backup-Daten")
            ]
            
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            
            for key_type, description in key_types:
                # Schlüssel generieren
                key_data = self.crypto_manager.generate_key(key_type)
                
                # Metadaten in Datenbank speichern
                key_id = f"{key_type}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
                checksum = hashlib.sha256(key_data).hexdigest()
                
                cursor.execute("""
                    INSERT INTO encryption_metadata 
                    (key_id, key_type, key_purpose, algorithm, key_size, checksum)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (key_id, key_type, description, 'AES-256-GCM', 256, checksum))
                
                print(f"✅ {description}: {key_id}")
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"❌ Fehler beim Einrichten der Verschlüsselungsschlüssel: {e}")
            raise
    
    def _insert_initial_data(self):
        """Füge Initial-Daten ein"""
        try:
            print("\n📝 Füge Initial-Daten ein...")
            
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            
            # System-Einstellungen verschlüsselt einfügen
            settings = [
                ('app_version', '1.0.0', False, 'string', 'Application version'),
                ('encryption_enabled', 'true', True, 'boolean', 'Encryption enabled flag'),
                ('audit_level', '4', False, 'integer', 'Audit logging level'),
                ('max_ideas_per_user', '1000', False, 'integer', 'Maximum ideas per user'),
                ('session_timeout_minutes', '30', False, 'integer', 'Session timeout in minutes'),
                ('auto_backup_enabled', 'true', False, 'boolean', 'Automatic backup enabled'),
                ('backup_retention_days', '30', False, 'integer', 'Backup retention in days'),
                ('max_concurrent_sessions', '1', False, 'integer', 'Maximum concurrent sessions'),
                ('rate_limit_requests', '60', False, 'integer', 'Rate limit requests per minute'),
                ('content_filter_enabled', 'true', True, 'boolean', 'Content filter enabled')
            ]
            
            for key, value, is_sensitive, data_type, description in settings:
                # Wert verschlüsseln
                encrypted_value = self.crypto_manager.encrypt_string(value, "database_content")
                checksum = hashlib.sha256(encrypted_value.encode()).hexdigest()
                
                cursor.execute("""
                    INSERT OR REPLACE INTO settings 
                    (setting_key, setting_value_encrypted, is_sensitive, data_type, description, checksum)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (key, encrypted_value.encode(), is_sensitive, data_type, description, checksum))
                
                self.stats['initial_records'] += 1
            
            # Initial Audit-Event
            event_id = "init_" + datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
            event_details = {
                "action": "database_initialized",
                "tables_created": self.stats['tables_created'],
                "indexes_created": self.stats['indexes_created'],
                "initial_settings": len(settings)
            }
            
            encrypted_details = self.crypto_manager.encrypt_string(
                json.dumps(event_details), "audit_logs"
            )
            checksum = hashlib.sha256(encrypted_details.encode()).hexdigest()
            
            cursor.execute("""
                INSERT INTO audit_logs 
                (event_id, event_type, event_category, event_description_encrypted, 
                 event_details_encrypted, severity_level, source_component, checksum)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event_id, 
                "database_initialized", 
                "system_events",
                self.crypto_manager.encrypt_string("Database successfully initialized", "audit_logs").encode(),
                encrypted_details.encode(),
                1,  # INFO
                "database_initializer",
                checksum
            ))
            
            conn.commit()
            conn.close()
            
            print(f"✅ {len(settings)} Einstellungen eingefügt")
            print("✅ Initial Audit-Event erstellt")
            
        except Exception as e:
            print(f"❌ Fehler beim Einfügen der Initial-Daten: {e}")
            raise
    
    def _optimize_database(self):
        """Optimiere Datenbank-Performance"""
        try:
            print("\n⚡ Optimiere Datenbank...")
            
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            
            # Statistiken aktualisieren
            cursor.execute("ANALYZE")
            
            # Vacuum für Optimierung
            cursor.execute("VACUUM")
            
            # WAL-Checkpoint
            cursor.execute("PRAGMA wal_checkpoint(TRUNCATE)")
            
            conn.close()
            
            print("✅ Datenbank optimiert")
            
        except Exception as e:
            print(f"❌ Fehler bei der Datenbank-Optimierung: {e}")
            raise
    
    def _verify_integrity(self):
        """Überprüfe Datenbank-Integrität"""
        try:
            print("\n🔍 Überprüfe Datenbank-Integrität...")
            
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            
            # Integritätsprüfung
            cursor.execute("PRAGMA integrity_check")
            result = cursor.fetchone()
            
            if result[0] == "ok":
                print("✅ Datenbank-Integrität: OK")
            else:
                raise Exception(f"Integritätsprüfung fehlgeschlagen: {result[0]}")
            
            # Tabellen zählen
            cursor.execute("""
                SELECT COUNT(*) FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
            """)
            table_count = cursor.fetchone()[0]
            
            # Indizes zählen
            cursor.execute("""
                SELECT COUNT(*) FROM sqlite_master 
                WHERE type='index' AND name NOT LIKE 'sqlite_%'
            """)
            index_count = cursor.fetchone()[0]
            
            conn.close()
            
            print(f"✅ {table_count} Tabellen erstellt")
            print(f"✅ {index_count} Indizes erstellt")
            
        except Exception as e:
            print(f"❌ Fehler bei der Integritätsprüfung: {e}")
            raise
    
    def _create_initial_backup(self):
        """Erstelle Initial-Backup"""
        try:
            print("\n💾 Erstelle Initial-Backup...")
            
            backup_dir = Path("database/backups")
            timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
            backup_path = backup_dir / f"initial_backup_{timestamp}.db"
            
            # Backup erstellen
            source_conn = sqlite3.connect(str(self.db_path))
            backup_conn = sqlite3.connect(str(backup_path))
            
            source_conn.backup(backup_conn)
            
            source_conn.close()
            backup_conn.close()
            
            # Berechtigungen setzen
            os.chmod(backup_path, 0o600)
            
            # Backup-Metadaten
            backup_size = backup_path.stat().st_size
            backup_checksum = self._calculate_file_checksum(backup_path)
            
            # Backup in Datenbank registrieren
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            
            backup_id = f"initial_{timestamp}"
            encrypted_path = self.crypto_manager.encrypt_string(str(backup_path), "backup_data")
            
            cursor.execute("""
                INSERT INTO backup_history 
                (backup_id, backup_type, backup_path_encrypted, backup_size, 
                 backup_checksum, is_verified, verification_timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                backup_id,
                "initial",
                encrypted_path.encode(),
                backup_size,
                backup_checksum,
                True,
                datetime.now(timezone.utc)
            ))
            
            conn.commit()
            conn.close()
            
            print(f"✅ Initial-Backup erstellt: {backup_path}")
            print(f"✅ Backup-Größe: {backup_size:,} Bytes")
            
        except Exception as e:
            print(f"❌ Fehler beim Erstellen des Backups: {e}")
            raise
    
    def _calculate_file_checksum(self, file_path: Path) -> str:
        """Berechne Datei-Checksum"""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    def _print_statistics(self):
        """Drucke Initialisierungs-Statistiken"""
        print("\n📊 Initialisierungs-Statistiken:")
        print(f"   • Tabellen erstellt: {self.stats['tables_created']}")
        print(f"   • Indizes erstellt: {self.stats['indexes_created']}")
        print(f"   • Trigger erstellt: {self.stats['triggers_created']}")
        print(f"   • Views erstellt: {self.stats['views_created']}")
        print(f"   • Initial-Datensätze: {self.stats['initial_records']}")
        print(f"   • Datenbank-Größe: {self.db_path.stat().st_size:,} Bytes")

def main():
    """Hauptfunktion"""
    try:
        # Konfiguration laden (falls vorhanden)
        config = None
        config_file = Path("security-config.yaml")
        
        if config_file.exists():
            import yaml
            with open(config_file, 'r') as f:
                config = yaml.safe_load(f)
        
        # Datenbank initialisieren
        initializer = DatabaseInitializer(config)
        success = initializer.initialize()
        
        if success:
            print("\n🎉 Datenbank-Setup erfolgreich abgeschlossen!")
            print("\nNächste Schritte:")
            print("1. Starten Sie das Backend: python ai_core/main.py")
            print("2. Überprüfen Sie die Logs: tail -f logs/security/security.log")
            print("3. Führen Sie Tests aus: make test-security")
            sys.exit(0)
        else:
            print("\n❌ Datenbank-Setup fehlgeschlagen!")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup durch Benutzer abgebrochen")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unerwarteter Fehler: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()