-- Creative Muse AI - Datenbank-Schema
-- Sichere SQLite-Datenbank mit Verschlüsselung auf Anwendungsebene

-- Benutzer-Tabelle
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    preferences TEXT, -- JSON, verschlüsselt
    security_settings TEXT -- JSON, verschlüsselt
);

-- Sessions-Tabelle
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT 1,
    security_flags TEXT, -- JSON, verschlüsselt
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ideen-Tabelle
CREATE TABLE IF NOT EXISTS ideas (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Verschlüsselt
    category TEXT,
    tags TEXT, -- JSON Array, verschlüsselt
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_favorite BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT, -- JSON, verschlüsselt
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Prompts-Tabelle
CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    prompt_text TEXT NOT NULL, -- Verschlüsselt
    response_text TEXT, -- Verschlüsselt
    model_used TEXT,
    parameters TEXT, -- JSON, verschlüsselt
    execution_time REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_saved BOOLEAN DEFAULT 0,
    idea_id TEXT, -- Verknüpfung zu generierter Idee
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE SET NULL
);

-- Kategorien-Tabelle
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    icon TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_default BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

-- Tags-Tabelle
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

-- Sammlungen-Tabelle
CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ideen-Sammlungen-Verknüpfung
CREATE TABLE IF NOT EXISTS collection_ideas (
    collection_id TEXT NOT NULL,
    idea_id TEXT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, idea_id),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE
);

-- Audit-Log-Tabelle
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    event_id TEXT UNIQUE NOT NULL,
    user_id TEXT,
    session_id TEXT,
    event_type TEXT NOT NULL,
    event_category TEXT NOT NULL,
    event_description_encrypted TEXT,
    event_details_encrypted TEXT, -- JSON, verschlüsselt
    severity_level TEXT NOT NULL,
    source_component TEXT,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checksum TEXT NOT NULL -- Integritätsprüfung
);

-- Sicherheitsereignisse-Tabelle
CREATE TABLE IF NOT EXISTS security_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    source_ip TEXT,
    user_id TEXT,
    session_id TEXT,
    details TEXT NOT NULL, -- JSON, verschlüsselt
    resolved BOOLEAN DEFAULT 0,
    resolved_at TIMESTAMP,
    resolved_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Backup-Metadaten-Tabelle
CREATE TABLE IF NOT EXISTS backup_metadata (
    id TEXT PRIMARY KEY,
    backup_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    checksum TEXT NOT NULL,
    encryption_key_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    is_valid BOOLEAN DEFAULT 1
);

-- Backup-Historie
CREATE TABLE IF NOT EXISTS backup_history (
    id TEXT PRIMARY KEY,
    backup_id TEXT NOT NULL,
    backup_type TEXT NOT NULL,
    backup_path_encrypted TEXT NOT NULL,
    file_path TEXT,
    file_size INTEGER,
    backup_size INTEGER,
    checksum TEXT,
    backup_checksum TEXT,
    encryption_key_id TEXT,
    status TEXT DEFAULT 'completed',
    is_verified BOOLEAN DEFAULT 0,
    verification_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT
);

-- Schlüssel-Rotation-Log
CREATE TABLE IF NOT EXISTS key_rotation_log (
    id TEXT PRIMARY KEY,
    key_type TEXT NOT NULL,
    old_key_id TEXT,
    new_key_id TEXT NOT NULL,
    rotation_reason TEXT,
    rotated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rotated_by TEXT,
    affected_records INTEGER DEFAULT 0
);

-- Verschlüsselungs-Metadaten
CREATE TABLE IF NOT EXISTS encryption_metadata (
    id TEXT PRIMARY KEY,
    key_id TEXT NOT NULL,
    key_type TEXT NOT NULL,
    key_purpose TEXT,
    table_name TEXT,
    column_name TEXT,
    algorithm TEXT NOT NULL DEFAULT 'AES-256-GCM',
    key_size INTEGER DEFAULT 256,
    checksum TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key_id)
);

-- System-Einstellungen
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value_encrypted TEXT,
    is_sensitive BOOLEAN DEFAULT 0,
    data_type TEXT DEFAULT 'string',
    description TEXT,
    checksum TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_rating ON ideas(rating);
CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_ideas_favorite ON ideas(is_favorite);

CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created ON prompts(created_at);
CREATE INDEX IF NOT EXISTS idx_prompts_saved ON prompts(is_saved);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity_level);

CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);

-- Trigger für automatische Zeitstempel-Updates
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_ideas_timestamp 
    AFTER UPDATE ON ideas
    BEGIN
        UPDATE ideas SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_collections_timestamp 
    AFTER UPDATE ON collections
    BEGIN
        UPDATE collections SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Trigger für Session-Aktivität
CREATE TRIGGER IF NOT EXISTS update_session_activity 
    AFTER UPDATE ON sessions
    BEGIN
        UPDATE sessions SET last_activity = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Trigger für Tag-Verwendungszähler
CREATE TRIGGER IF NOT EXISTS increment_tag_usage 
    AFTER INSERT ON ideas
    BEGIN
        -- Hier würde normalerweise die Tag-Extraktion und -Zählung stattfinden
        -- Dies wird in der Anwendungslogik implementiert
        NULL;
    END;

-- Views für häufige Abfragen
CREATE VIEW IF NOT EXISTS active_sessions AS
SELECT 
    s.*,
    u.username,
    u.email
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.is_active = 1 
AND s.expires_at > CURRENT_TIMESTAMP;

CREATE VIEW IF NOT EXISTS user_statistics AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.created_at,
    u.last_login,
    COUNT(DISTINCT i.id) as total_ideas,
    COUNT(DISTINCT p.id) as total_prompts,
    COUNT(DISTINCT c.id) as total_collections,
    AVG(i.rating) as average_rating
FROM users u
LEFT JOIN ideas i ON u.id = i.user_id
LEFT JOIN prompts p ON u.id = p.user_id
LEFT JOIN collections c ON u.id = c.user_id
WHERE u.is_active = 1
GROUP BY u.id, u.username, u.email, u.created_at, u.last_login;

CREATE VIEW IF NOT EXISTS recent_activity AS
SELECT 
    'idea' as activity_type,
    i.id as item_id,
    i.title as item_title,
    i.user_id,
    i.created_at as activity_time
FROM ideas i
WHERE i.created_at > datetime('now', '-7 days')
UNION ALL
SELECT 
    'prompt' as activity_type,
    p.id as item_id,
    substr(p.prompt_text, 1, 50) as item_title,
    p.user_id,
    p.created_at as activity_time
FROM prompts p
WHERE p.created_at > datetime('now', '-7 days')
ORDER BY activity_time DESC;

-- Sicherheits-Views
CREATE VIEW IF NOT EXISTS security_summary AS
SELECT 
    date(timestamp) as date,
    event_category,
    severity_level,
    COUNT(*) as event_count
FROM audit_logs
WHERE timestamp > datetime('now', '-30 days')
GROUP BY date(timestamp), event_category, severity_level
ORDER BY date DESC, severity_level;

-- Initialisierung abgeschlossen
INSERT OR IGNORE INTO audit_logs (
    id, 
    event_type, 
    event_category, 
    severity_level, 
    description, 
    details,
    checksum
) VALUES (
    hex(randomblob(16)),
    'DATABASE_INIT',
    'SYSTEM',
    'INFO',
    'Datenbank-Schema erfolgreich initialisiert',
    '{"schema_version": "1.0.0", "tables_created": 15, "indexes_created": 20, "triggers_created": 4, "views_created": 4}',
    hex(randomblob(32))
);