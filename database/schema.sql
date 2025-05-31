-- Creative Muse AI - Datenbank-Schema
-- SQLite-Schema mit Verschlüsselungsunterstützung und Audit-Funktionen

-- Aktiviere Foreign Key Constraints
PRAGMA foreign_keys = ON;

-- Aktiviere WAL-Modus für bessere Concurrency
PRAGMA journal_mode = WAL;

-- Setze sichere Synchronisation
PRAGMA synchronous = FULL;

-- ============================================================================
-- HAUPTTABELLEN
-- ============================================================================

-- Ideas Table - Haupttabelle für generierte Ideen
CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Verschlüsselte Inhalte
    prompt_encrypted BLOB NOT NULL,           -- Verschlüsselter Prompt
    generated_idea_encrypted BLOB NOT NULL,   -- Verschlüsselte generierte Idee
    category_encrypted BLOB,                  -- Verschlüsselte Kategorie
    tags_encrypted BLOB,                      -- Verschlüsselte Tags (JSON)
    
    -- Metadaten (unverschlüsselt für Queries)
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    is_favorite BOOLEAN DEFAULT FALSE,
    word_count INTEGER,                       -- Wortanzahl der Idee
    language_code VARCHAR(5) DEFAULT 'de',    -- Sprachcode
    
    -- Zeitstempel
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Sicherheit und Integrität
    checksum TEXT NOT NULL,                   -- SHA-256 Checksum für Integrität
    encryption_version INTEGER DEFAULT 1,     -- Version der Verschlüsselung
    
    -- Benutzer-Kontext (falls Multi-User später implementiert wird)
    user_id VARCHAR(128),                     -- Benutzer-ID (optional)
    session_id VARCHAR(128),                  -- Session-ID
    
    -- Indizes für Performance
    UNIQUE(checksum)                          -- Verhindert Duplikate
);

-- Indizes für Ideas-Tabelle
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_rating ON ideas(rating DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_favorite ON ideas(is_favorite, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_user_session ON ideas(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_ideas_language ON ideas(language_code);

-- ============================================================================
-- AUDIT UND LOGGING TABELLEN
-- ============================================================================

-- Audit Logs - Umfassende Audit-Protokollierung
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Event-Identifikation
    event_id VARCHAR(128) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    
    -- Zeitstempel und Dauer
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_ms INTEGER,
    
    -- Benutzer und Session
    user_id VARCHAR(128),
    session_id VARCHAR(128),
    ip_address VARCHAR(45),                   -- IPv4/IPv6
    user_agent_hash VARCHAR(64),              -- Hash des User-Agents
    
    -- Event-Details (verschlüsselt)
    event_description_encrypted BLOB,
    event_details_encrypted BLOB,            -- JSON-Details verschlüsselt
    
    -- Klassifikation
    severity_level INTEGER DEFAULT 1,        -- 1=Info, 2=Warning, 3=Error, 4=Critical, 5=Emergency
    outcome VARCHAR(20) DEFAULT 'success',   -- success, failure, error
    data_classification VARCHAR(20) DEFAULT 'internal',
    
    -- Compliance
    compliance_tags_encrypted BLOB,          -- JSON-Array verschlüsselt
    
    -- Quell-Information
    source_component VARCHAR(100),
    source_file VARCHAR(255),
    source_line INTEGER,
    
    -- Integrität
    checksum TEXT NOT NULL,
    encryption_version INTEGER DEFAULT 1
);

-- Indizes für Audit-Logs
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_category ON audit_logs(event_category, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON audit_logs(severity_level DESC, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_session ON audit_logs(session_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_outcome ON audit_logs(outcome, timestamp DESC);

-- Security Events - Spezielle Sicherheitsereignisse
CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Event-Identifikation
    event_id VARCHAR(128) UNIQUE NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    threat_level INTEGER CHECK(threat_level >= 1 AND threat_level <= 5),
    
    -- Zeitstempel
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Event-Details (verschlüsselt)
    event_details_encrypted BLOB,
    
    -- Quelle
    source_component VARCHAR(100),
    source_ip VARCHAR(45),
    
    -- Status
    resolved BOOLEAN DEFAULT FALSE,
    resolution_timestamp TIMESTAMP,
    resolution_notes_encrypted BLOB,
    
    -- Integrität
    checksum TEXT NOT NULL
);

-- Indizes für Security-Events
CREATE INDEX IF NOT EXISTS idx_security_timestamp ON security_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_threat_level ON security_events(threat_level DESC);
CREATE INDEX IF NOT EXISTS idx_security_resolved ON security_events(resolved, timestamp DESC);

-- ============================================================================
-- SESSION MANAGEMENT
-- ============================================================================

-- Sessions - Sichere Session-Verwaltung
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Session-Identifikation
    session_id VARCHAR(128) UNIQUE NOT NULL,
    session_token_hash VARCHAR(64),           -- Hash des Session-Tokens
    
    -- Benutzer-Information
    user_id VARCHAR(128),
    
    -- Zeitstempel
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    -- Client-Information
    ip_address VARCHAR(45),
    user_agent_hash VARCHAR(64),
    client_fingerprint VARCHAR(128),
    
    -- Session-Daten (verschlüsselt)
    session_data_encrypted BLOB,
    
    -- Statistiken
    ideas_generated INTEGER DEFAULT 0,
    api_calls_count INTEGER DEFAULT 0,
    
    -- Status und Sicherheit
    is_active BOOLEAN DEFAULT TRUE,
    security_flags INTEGER DEFAULT 0,        -- Bitfeld für Sicherheits-Flags
    
    -- Integrität
    checksum TEXT NOT NULL
);

-- Indizes für Sessions
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity DESC);

-- ============================================================================
-- KONFIGURATION UND METADATEN
-- ============================================================================

-- Settings - Systemeinstellungen (verschlüsselt)
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Schlüssel-Wert-Paar
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value_encrypted BLOB NOT NULL,
    
    -- Metadaten
    is_sensitive BOOLEAN DEFAULT FALSE,
    data_type VARCHAR(20) DEFAULT 'string',  -- string, integer, boolean, json
    description TEXT,
    
    -- Zeitstempel
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    
    -- Integrität
    checksum TEXT NOT NULL
);

-- Indizes für Settings
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_sensitive ON settings(is_sensitive);

-- Encryption Metadata - Metadaten für Verschlüsselungsschlüssel
CREATE TABLE IF NOT EXISTS encryption_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Schlüssel-Identifikation
    key_id VARCHAR(128) UNIQUE NOT NULL,
    key_type VARCHAR(50) NOT NULL,
    key_purpose VARCHAR(100),
    
    -- Zeitstempel
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_rotation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Konfiguration
    rotation_interval_days INTEGER DEFAULT 90,
    algorithm VARCHAR(50) DEFAULT 'AES-256-GCM',
    key_size INTEGER DEFAULT 256,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    
    -- Integrität
    checksum TEXT NOT NULL
);

-- Indizes für Encryption-Metadata
CREATE INDEX IF NOT EXISTS idx_encryption_key_id ON encryption_metadata(key_id);
CREATE INDEX IF NOT EXISTS idx_encryption_active ON encryption_metadata(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_encryption_type ON encryption_metadata(key_type);

-- ============================================================================
-- PERFORMANCE UND MONITORING
-- ============================================================================

-- Performance Metrics - System-Performance-Metriken
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Metrik-Information
    metric_name VARCHAR(100) NOT NULL,
    metric_value REAL NOT NULL,
    metric_unit VARCHAR(20),
    
    -- Zeitstempel
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Kontext
    component VARCHAR(50),
    additional_data_encrypted BLOB,          -- JSON-Daten verschlüsselt
    
    -- Kategorisierung
    metric_category VARCHAR(50),             -- cpu, memory, disk, network, ai_model
    alert_threshold REAL,
    is_alert BOOLEAN DEFAULT FALSE
);

-- Indizes für Performance-Metrics
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_name ON performance_metrics(metric_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_category ON performance_metrics(metric_category, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_alerts ON performance_metrics(is_alert, timestamp DESC);

-- ============================================================================
-- BACKUP UND RECOVERY
-- ============================================================================

-- Backup History - Backup-Verlauf
CREATE TABLE IF NOT EXISTS backup_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Backup-Information
    backup_id VARCHAR(128) UNIQUE NOT NULL,
    backup_type VARCHAR(20) DEFAULT 'automatic', -- automatic, manual, scheduled
    
    -- Pfad und Größe (verschlüsselt)
    backup_path_encrypted BLOB NOT NULL,
    backup_size INTEGER,                     -- Größe in Bytes
    
    -- Zeitstempel
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Integrität und Verschlüsselung
    backup_checksum TEXT NOT NULL,
    encryption_key_id VARCHAR(128),
    compression_ratio REAL,
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    verification_timestamp TIMESTAMP,
    
    -- Metadaten
    tables_included TEXT,                    -- Komma-getrennte Liste
    record_count INTEGER,
    
    -- Retention
    expires_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Indizes für Backup-History
CREATE INDEX IF NOT EXISTS idx_backup_created ON backup_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_type ON backup_history(backup_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_verified ON backup_history(is_verified);
CREATE INDEX IF NOT EXISTS idx_backup_expires ON backup_history(expires_at);

-- ============================================================================
-- VIEWS FÜR REPORTING
-- ============================================================================

-- View für Ideen-Statistiken (ohne verschlüsselte Inhalte)
CREATE VIEW IF NOT EXISTS ideas_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_ideas,
    AVG(rating) as avg_rating,
    COUNT(CASE WHEN is_favorite = 1 THEN 1 END) as favorites_count,
    AVG(word_count) as avg_word_count,
    language_code
FROM ideas 
GROUP BY DATE(created_at), language_code;

-- View für Audit-Statistiken
CREATE VIEW IF NOT EXISTS audit_stats AS
SELECT 
    DATE(timestamp) as date,
    event_category,
    severity_level,
    COUNT(*) as event_count,
    COUNT(CASE WHEN outcome = 'success' THEN 1 END) as success_count,
    COUNT(CASE WHEN outcome = 'failure' THEN 1 END) as failure_count,
    COUNT(CASE WHEN outcome = 'error' THEN 1 END) as error_count
FROM audit_logs 
GROUP BY DATE(timestamp), event_category, severity_level;

-- View für Session-Statistiken
CREATE VIEW IF NOT EXISTS session_stats AS
SELECT 
    DATE(session_start) as date,
    COUNT(*) as total_sessions,
    AVG(julianday(COALESCE(session_end, CURRENT_TIMESTAMP)) - julianday(session_start)) * 24 * 60 as avg_duration_minutes,
    SUM(ideas_generated) as total_ideas_generated,
    SUM(api_calls_count) as total_api_calls
FROM sessions 
GROUP BY DATE(session_start);

-- ============================================================================
-- TRIGGERS FÜR AUTOMATISCHE UPDATES
-- ============================================================================

-- Trigger für automatische updated_at Aktualisierung in ideas
CREATE TRIGGER IF NOT EXISTS update_ideas_timestamp 
    AFTER UPDATE ON ideas
    FOR EACH ROW
BEGIN
    UPDATE ideas SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger für automatische updated_at Aktualisierung in settings
CREATE TRIGGER IF NOT EXISTS update_settings_timestamp 
    AFTER UPDATE ON settings
    FOR EACH ROW
BEGIN
    UPDATE settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger für Session-Aktivität-Update
CREATE TRIGGER IF NOT EXISTS update_session_activity 
    AFTER UPDATE ON sessions
    FOR EACH ROW
    WHEN NEW.is_active = 1
BEGIN
    UPDATE sessions SET last_activity = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Standard-Einstellungen einfügen
INSERT OR IGNORE INTO settings (setting_key, setting_value_encrypted, is_sensitive, data_type, description, checksum) 
VALUES 
    ('app_version', 'MS4wLjA=', FALSE, 'string', 'Application version', 'placeholder_checksum'),
    ('encryption_enabled', 'dHJ1ZQ==', TRUE, 'boolean', 'Encryption enabled flag', 'placeholder_checksum'),
    ('audit_level', 'NA==', FALSE, 'integer', 'Audit logging level', 'placeholder_checksum'),
    ('max_ideas_per_user', 'MTAwMA==', FALSE, 'integer', 'Maximum ideas per user', 'placeholder_checksum'),
    ('session_timeout_minutes', 'MzA=', FALSE, 'integer', 'Session timeout in minutes', 'placeholder_checksum');

-- Standard-Verschlüsselungsmetadaten
INSERT OR IGNORE INTO encryption_metadata (key_id, key_type, key_purpose, algorithm, key_size, checksum)
VALUES 
    ('master_key_001', 'master', 'Master encryption key', 'AES-256-GCM', 256, 'placeholder_checksum'),
    ('database_key_001', 'database', 'Database encryption', 'AES-256-GCM', 256, 'placeholder_checksum'),
    ('session_key_001', 'session', 'Session data encryption', 'AES-256-GCM', 256, 'placeholder_checksum'),
    ('audit_key_001', 'audit', 'Audit log encryption', 'AES-256-GCM', 256, 'placeholder_checksum');

-- ============================================================================
-- SCHEMA VERSION
-- ============================================================================

-- Schema-Version für Migrations
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    checksum TEXT
);

INSERT OR IGNORE INTO schema_version (version, description, checksum) 
VALUES (1, 'Initial schema with encryption support', 'initial_schema_checksum');

-- ============================================================================
-- KOMMENTARE UND DOKUMENTATION
-- ============================================================================

/*
SICHERHEITSHINWEISE:

1. VERSCHLÜSSELUNG:
   - Alle sensiblen Daten werden als BLOB mit AES-256-GCM verschlüsselt gespeichert
   - Checksums gewährleisten Datenintegrität
   - Encryption_version ermöglicht Schlüsselrotation

2. AUDIT-TRAIL:
   - Vollständige Protokollierung aller Datenbankoperationen
   - Unveränderliche Audit-Logs mit Checksums
   - Compliance-Tags für regulatorische Anforderungen

3. SESSION-SICHERHEIT:
   - Sichere Session-Verwaltung mit Ablaufzeiten
   - Client-Fingerprinting für Anomalie-Erkennung
   - Sicherheits-Flags für Bedrohungserkennung

4. PERFORMANCE:
   - Optimierte Indizes für häufige Abfragen
   - Views für Reporting ohne Entschlüsselung
   - WAL-Modus für bessere Concurrency

5. BACKUP UND RECOVERY:
   - Verschlüsselte Backups mit Integrätsprüfung
   - Automatische Retention-Policies
   - Verifizierung der Backup-Integrität

WARTUNG:
- Regelmäßige VACUUM-Operationen für Performance
- Automatische Log-Rotation basierend auf Größe/Zeit
- Monitoring der Verschlüsselungsschlüssel-Rotation
*/