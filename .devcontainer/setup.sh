#!/bin/bash

# Creative Muse AI DevContainer Setup Script
echo "🎨 Setting up Creative Muse AI Development Environment..."

# Set proper permissions
chmod +x /workspace/scripts/*.sh 2>/dev/null || true
chmod +x /workspace/Makefile 2>/dev/null || true

# Create necessary directories
mkdir -p /workspace/logs
mkdir -p /workspace/data
mkdir -p /workspace/temp
mkdir -p /workspace/database

# Set up Python virtual environment (optional, but good practice)
echo "🐍 Setting up Python environment..."
cd /workspace

# Install Python dependencies if requirements.txt exists
if [ -f "ai_core/requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip install --user -r ai_core/requirements.txt
fi

# Install additional development dependencies
echo "🔧 Installing development tools..."
pip install --user \
    black \
    flake8 \
    pylint \
    mypy \
    pytest \
    pytest-cov \
    ipython \
    pre-commit \
    bandit \
    safety

# Set up pre-commit hooks if .pre-commit-config.yaml exists
if [ -f ".pre-commit-config.yaml" ]; then
    echo "🪝 Setting up pre-commit hooks..."
    pre-commit install
fi

# Initialize database if schema exists
if [ -f "database/schema.sql" ]; then
    echo "🗄️ Initializing database..."
    cd /workspace/database
    if [ ! -f "creative_muse.db" ]; then
        sqlite3 creative_muse.db < schema.sql
        echo "✅ Database initialized with schema"
    else
        echo "ℹ️ Database already exists"
    fi
    cd /workspace
else
    echo "⚠️ Database schema not found, creating minimal database..."
    mkdir -p /workspace/database
    cd /workspace/database
    sqlite3 creative_muse.db "CREATE TABLE IF NOT EXISTS ideas (id INTEGER PRIMARY KEY, content TEXT, category TEXT, rating INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"
    echo "✅ Minimal database created"
    cd /workspace
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    cat > .env << EOF
# Creative Muse AI Environment Configuration
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=sqlite:///database/creative_muse.db
SECRET_KEY=dev-secret-key-change-in-production
ENCRYPTION_KEY=dev-encryption-key-32-chars-long
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080"]
LOG_LEVEL=INFO
EOF
    echo "✅ .env file created"
fi

# Set up git configuration for the container
echo "🔧 Configuring git..."
git config --global --add safe.directory /workspace
git config --global init.defaultBranch main

# Install Node.js dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Make scripts executable
echo "🔧 Setting up executable permissions..."
find /workspace/scripts -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true

# Create useful aliases
echo "🔗 Setting up aliases..."
cat >> ~/.bashrc << 'EOF'

# Creative Muse AI Aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'

# Project specific aliases
alias start-backend='cd /workspace && python ai_core/main_simple.py'
alias start-frontend='cd /workspace/ui_frontend && live-server --port=3000 --host=0.0.0.0'
alias run-tests='cd /workspace && python -m pytest'
alias check-code='cd /workspace && flake8 ai_core/ && black --check ai_core/'
alias format-code='cd /workspace && black ai_core/'
alias db-shell='sqlite3 /workspace/database/creative_muse.db'
alias init-database='bash /workspace/.devcontainer/init-database.sh'
alias setup-hosts='bash /workspace/.devcontainer/setup-hosts.sh'
alias traefik-status='docker ps | grep traefik'
alias restart-traefik='bash /workspace/.devcontainer/restart-traefik.sh'

# Quick navigation
alias backend='cd /workspace/ai_core'
alias frontend='cd /workspace/ui_frontend'
alias db='cd /workspace/database'
alias logs='cd /workspace/logs'

echo "🎨 Creative Muse AI DevContainer ready!"
echo "💡 Use 'start-backend' to run the API server"
echo "🌐 Use 'start-frontend' to run the frontend server"
echo "🧪 Use 'run-tests' to run tests"
echo "🔍 Use 'check-code' to check code quality"
EOF

# Source the new aliases
source ~/.bashrc

echo ""
echo "🎉 Creative Muse AI Development Environment Setup Complete!"
echo ""
echo "📋 Quick Start Commands:"
echo "  start-backend  - Start the FastAPI backend server"
echo "  start-frontend - Start the frontend development server"
echo "  run-tests      - Run the test suite"
echo "  check-code     - Check code quality with flake8 and black"
echo "  format-code    - Format code with black"
echo "  db-shell       - Open SQLite database shell"
echo ""
echo "🚀 Ready to develop! Happy coding! 🎨🤖"
echo ""
echo "💡 WICHTIG: Um das System zu starten:"
echo "1. Öffne ein neues Terminal: Ctrl+Shift+\`"
echo "2. Starte das Backend: start-backend"
echo "3. Öffne ein weiteres Terminal: Ctrl+Shift+\`"
echo "4. Starte das Frontend: start-frontend"
echo "5. Öffne http://localhost:3000 im Browser"