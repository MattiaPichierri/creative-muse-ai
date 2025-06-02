#!/bin/bash
# Creative Muse AI - Bash Functions and Aliases
# Funzioni di sviluppo per l'architettura unificata

# Percorso agli script di sviluppo
DEV_SCRIPTS_PATH="/workspace/.devcontainer/dev-scripts.sh"

# Verifica che gli script esistano
if [[ ! -f "$DEV_SCRIPTS_PATH" ]]; then
    echo "⚠️  Development scripts not found at $DEV_SCRIPTS_PATH"
    return 1
fi

# Rendi eseguibile lo script
chmod +x "$DEV_SCRIPTS_PATH"

# Funzioni di sviluppo principali
start-backend() {
    "$DEV_SCRIPTS_PATH" start-backend
}

start-frontend() {
    "$DEV_SCRIPTS_PATH" start-frontend
}

start-fullstack() {
    "$DEV_SCRIPTS_PATH" start-fullstack
}

stop-all() {
    "$DEV_SCRIPTS_PATH" stop-all
}

check-code() {
    "$DEV_SCRIPTS_PATH" check-code
}

run-tests() {
    "$DEV_SCRIPTS_PATH" run-tests
}

db-shell() {
    "$DEV_SCRIPTS_PATH" db-shell
}

start-db-admin() {
    "$DEV_SCRIPTS_PATH" start-db-admin
}

show-status() {
    "$DEV_SCRIPTS_PATH" show-status
}

dev-help() {
    "$DEV_SCRIPTS_PATH" help
}

# Alias utili per lo sviluppo
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'

# Alias specifici per Creative Muse AI
alias cmai='cd /workspace'
alias backend='cd /workspace/ai_core'
alias frontend='cd /workspace/creative-muse-modern'
alias logs='tail -f /workspace/logs/*.log 2>/dev/null || echo "No log files found"'

# Git aliases
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git log --oneline -10'
alias gd='git diff'

# Python development aliases
alias py='python3'
alias pip='python3 -m pip'
alias venv='python3 -m venv'
alias pytest='python3 -m pytest'
alias black='python3 -m black'
alias flake8='python3 -m flake8'

# Node.js development aliases
alias ni='npm install'
alias nr='npm run'
alias nd='npm run dev'
alias nb='npm run build'
alias nt='npm test'

# Docker aliases (se necessario)
alias dc='docker-compose'
alias dcu='docker-compose up'
alias dcd='docker-compose down'
alias dcb='docker-compose build'

# Funzioni di utilità
mkcd() {
    mkdir -p "$1" && cd "$1" || return
}

# Funzione per trovare file rapidamente
ff() {
    find . -type f -name "*$1*" 2>/dev/null
}

# Funzione per cercare nel codice
search() {
    if [[ $# -eq 0 ]]; then
        echo "Usage: search <pattern> [directory]"
        return 1
    fi

    local pattern="$1"
    local dir="${2:-.}"

    grep -r --include="*.py" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" "$pattern" "$dir"
}

# Funzione per backup rapido
backup() {
    local file="$1"
    if [[ -f "$file" ]]; then
        cp "$file" "${file}.backup.$(date +%Y%m%d_%H%M%S)"
        echo "✅ Backup created: ${file}.backup.$(date +%Y%m%d_%H%M%S)"
    else
        echo "❌ File not found: $file"
    fi
}

# Funzione per mostrare informazioni del progetto
project-info() {
    echo "🎨 Creative Muse AI - Project Information"
    echo "========================================"
    echo
    echo "📁 Project Structure:"
    echo "• Root:     $(pwd)"
    echo "• Backend:  ai_core/ (Unified FastAPI)"
    echo "• Frontend: creative-muse-modern/ (Next.js)"
    echo "• Database: database/ (SQLite)"
    echo
    echo "🔧 Available Commands:"
    echo "• start-fullstack  - Start complete development environment"
    echo "• start-backend    - Start FastAPI backend only"
    echo "• start-frontend   - Start Next.js frontend only"
    echo "• stop-all         - Stop all services"
    echo "• check-code       - Run code quality checks"
    echo "• run-tests        - Run test suite"
    echo "• show-status      - Show services status"
    echo "• dev-help         - Show detailed help"
    echo
    echo "🌐 Development URLs:"
    echo "• Frontend:    http://localhost:3000"
    echo "• Backend API: http://localhost:8000"
    echo "• API Docs:    http://localhost:8000/docs"
    echo
    echo "📋 Quick Navigation:"
    echo "• cmai      - Go to project root"
    echo "• backend   - Go to backend directory"
    echo "• frontend  - Go to frontend directory"
}

# Funzione per setup rapido ambiente di sviluppo
dev-setup() {
    echo "🚀 Setting up Creative Muse AI development environment..."

    # Vai alla root del progetto
    cd /workspace || return

    # Verifica che il setup sia stato eseguito
    if [[ ! -f ".env" ]]; then
        echo "⚠️  Environment not configured. Running setup..."
        ./.devcontainer/setup.sh
    fi

    # Mostra lo status
    show-status

    echo
    echo "✅ Development environment ready!"
    echo "💡 Run 'start-fullstack' to start all services"
}

# Funzione per cleanup ambiente
dev-cleanup() {
    echo "🧹 Cleaning up development environment..."

    # Stop tutti i servizi
    stop-all

    # Cleanup file temporanei
    find /workspace -name "*.pyc" -delete 2>/dev/null || true
    find /workspace -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    find /workspace -name ".pytest_cache" -type d -exec rm -rf {} + 2>/dev/null || true
    find /workspace -name "node_modules/.cache" -type d -exec rm -rf {} + 2>/dev/null || true

    echo "✅ Cleanup completed"
}

# Funzione per aggiornare dipendenze
update-deps() {
    echo "📦 Updating project dependencies..."

    # Aggiorna dipendenze Python
    if [[ -f "/workspace/ai_core/requirements.txt" ]]; then
        echo "🐍 Updating Python dependencies..."
        cd /workspace/ai_core || return
        python3 -m pip install --upgrade -r requirements.txt
    fi

    # Aggiorna dipendenze Node.js
    if [[ -f "/workspace/creative-muse-modern/package.json" ]]; then
        echo "📦 Updating Node.js dependencies..."
        cd /workspace/creative-muse-modern || return
        npm update
    fi

    cd /workspace || return
    echo "✅ Dependencies updated"
}

# Messaggio di benvenuto
welcome-message() {
    echo
    echo "🎨 Welcome to Creative Muse AI Development Environment!"
    echo "======================================================"
    echo
    echo "💡 Quick Start:"
    echo "• project-info     - Show project information"
    echo "• dev-setup        - Setup development environment"
    echo "• start-fullstack  - Start all services"
    echo "• dev-help         - Show all available commands"
    echo
}

# Esporta le funzioni
export -f start-backend start-frontend start-fullstack stop-all
export -f check-code run-tests db-shell start-db-admin show-status dev-help
export -f mkcd ff search backup project-info dev-setup dev-cleanup update-deps
export -f welcome-message

# Mostra messaggio di benvenuto se è una sessione interattiva
if [[ $- == *i* ]]; then
    welcome-message
fi
