#!/bin/bash

# Creative Muse AI Database Initialization Script

echo "🗄️ Initializing Creative Muse AI Database..."

# Create database directory if it doesn't exist
mkdir -p /workspace/database

cd /workspace/database

# Check if schema file exists
if [ -f "schema.sql" ]; then
    echo "📋 Using existing schema.sql..."
    sqlite3 creative_muse.db < schema.sql
    echo "✅ Database initialized with full schema"
else
    echo "📋 Creating minimal schema..."
    sqlite3 creative_muse.db << 'EOF'
-- Creative Muse AI Minimal Database Schema
CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    rating INTEGER DEFAULT 0,
    creativity_level INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total_ideas INTEGER DEFAULT 0,
    today_generated INTEGER DEFAULT 0,
    avg_rating REAL DEFAULT 0.0,
    categories_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial stats (clean database - no sample ideas)
INSERT OR REPLACE INTO stats (id, total_ideas, today_generated, avg_rating, categories_count)
VALUES (1, 0, 0, 0.0, 0);

-- Note: This database starts completely clean with no sample ideas
-- Users will start with an empty ideas table

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_ideas_rating ON ideas(rating);
EOF
    echo "✅ Minimal database schema created"
fi

# Verify database
echo "🔍 Verifying database..."
if sqlite3 creative_muse.db "SELECT name FROM sqlite_master WHERE type='table';" | grep -q "ideas"; then
    echo "✅ Database verification successful"
    echo "📊 Tables created:"
    sqlite3 creative_muse.db "SELECT name FROM sqlite_master WHERE type='table';"
else
    echo "❌ Database verification failed"
    exit 1
fi

echo ""
echo "🎉 Database initialization complete!"
echo "📍 Database location: /workspace/database/creative_muse.db"
echo ""
echo "🔧 You can now:"
echo "  - Start the backend: start-backend"
echo "  - Test the API: curl http://localhost:8000/health"
echo "  - Access database: db-shell"