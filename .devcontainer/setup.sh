#!/bin/bash

# Creative Muse AI DevContainer Setup Script
# Enhanced version with robust error handling and validation

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}" >&2
}

log_step() {
    echo -e "${PURPLE}🔧 $1${NC}"
}

# Error handling
cleanup_on_error() {
    log_error "Setup failed! Cleaning up..."
    exit 1
}

trap cleanup_on_error ERR

# Validation functions
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "Required command '$1' not found"
        return 1
    fi
    return 0
}

check_file() {
    if [[ ! -f "$1" ]]; then
        log_warning "File '$1' not found"
        return 1
    fi
    return 0
}

check_directory() {
    if [[ ! -d "$1" ]]; then
        log_warning "Directory '$1' not found"
        return 1
    fi
    return 0
}

# Version checking
check_python_version() {
    local required_version="3.11"
    local current_version
    current_version=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)

    if [[ "$(printf '%s\n' "$required_version" "$current_version" | sort -V | head -n1)" != "$required_version" ]]; then
        log_error "Python $required_version or higher required, found $current_version"
        return 1
    fi
    log_success "Python version $current_version is compatible"
    return 0
}

check_node_version() {
    local required_version="18"
    local current_version
    current_version=$(node --version 2>&1 | cut -d'v' -f2 | cut -d'.' -f1)

    if [[ "$current_version" -lt "$required_version" ]]; then
        log_error "Node.js $required_version or higher required, found $current_version"
        return 1
    fi
    log_success "Node.js version $current_version is compatible"
    return 0
}

# Generate secure keys
generate_secure_key() {
    local length=${1:-32}
    openssl rand -hex "$length" 2>/dev/null || python3 -c "import secrets; print(secrets.token_hex($length))"
}

# Backup existing files
backup_file() {
    local file="$1"
    if [[ -f "$file" ]]; then
        local backup
        backup="${file}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$file" "$backup"
        log_info "Backed up $file to $backup"
    fi
}

# Main setup function
main() {
    echo -e "${CYAN}"
    echo "🎨 =============================================="
    echo "   Creative Muse AI Development Environment"
    echo "   Enhanced Setup Script v2.0"
    echo "===============================================${NC}"
    echo

    # Change to workspace directory
    cd /workspace || {
        log_error "Cannot change to /workspace directory"
        exit 1
    }

    # Step 1: Validate environment
    log_step "Validating development environment..."

    local validation_failed=false

    if ! check_command "python3"; then validation_failed=true; fi
    if ! check_command "node"; then validation_failed=true; fi
    if ! check_command "npm"; then validation_failed=true; fi
    if ! check_command "git"; then validation_failed=true; fi
    if ! check_command "sqlite3"; then validation_failed=true; fi

    if [[ "$validation_failed" == "true" ]]; then
        log_error "Environment validation failed. Please check the devcontainer configuration."
        exit 1
    fi

    if ! check_python_version; then validation_failed=true; fi
    if ! check_node_version; then validation_failed=true; fi

    if [[ "$validation_failed" == "true" ]]; then
        log_error "Version validation failed."
        exit 1
    fi

    log_success "Environment validation completed"

    # Step 2: Set proper permissions
    log_step "Setting up file permissions..."
    find /workspace/scripts -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
    chmod +x /workspace/Makefile 2>/dev/null || true
    chmod +x /workspace/.devcontainer/*.sh 2>/dev/null || true
    log_success "File permissions configured"

    # Step 3: Create necessary directories
    log_step "Creating project directories..."
    local directories=(
        "/workspace/logs"
        "/workspace/data"
        "/workspace/temp"
        "/workspace/database"
        "/workspace/backups"
        "/workspace/uploads"
        "/workspace/cache"
    )

    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        log_info "Created directory: $dir"
    done
    log_success "Project directories created"

    # Step 4: Set up Python environment
    log_step "Setting up Python environment..."

    # Upgrade pip first
    python3 -m pip install --upgrade pip --quiet

    # Install Python dependencies
    if check_file "ai_core/requirements.txt"; then
        log_info "Installing Python dependencies from requirements.txt..."
        python3 -m pip install --user -r ai_core/requirements.txt --quiet
        log_success "Python dependencies installed"
    else
        log_warning "ai_core/requirements.txt not found, skipping Python dependencies"
    fi

    # Install additional development tools
    log_info "Installing Python development tools..."
    local dev_tools=(
        "black>=23.11.0"
        "flake8>=6.1.0"
        "pylint>=3.0.0"
        "mypy>=1.7.0"
        "pytest>=7.4.0"
        "pytest-cov>=4.1.0"
        "pytest-asyncio>=0.21.0"
        "ipython>=8.17.0"
        "pre-commit>=3.5.0"
        "bandit>=1.7.5"
        "safety>=2.3.0"
        "isort>=5.12.0"
        "aiohttp>=3.12.0"
    )

    for tool in "${dev_tools[@]}"; do
        python3 -m pip install --user "$tool" --quiet
    done
    log_success "Python development tools installed"

    # Step 5: Set up pre-commit hooks
    if check_file ".pre-commit-config.yaml"; then
        log_step "Setting up pre-commit hooks..."
        /home/vscode/.local/bin/pre-commit install
        log_success "Pre-commit hooks installed"
    fi

    # Step 6: Initialize database
    log_step "Setting up database..."

    if check_file "database/schema.sql"; then
        log_info "Initializing database with schema..."
        cd /workspace/database
        if [[ ! -f "creative_muse.db" ]]; then
            sqlite3 creative_muse.db < schema.sql
            log_success "Database initialized with schema"
        else
            log_info "Database already exists, skipping initialization"
        fi
        cd /workspace
    else
        log_info "Creating minimal database structure..."
        cd /workspace/database
        sqlite3 creative_muse.db "
        CREATE TABLE IF NOT EXISTS ideas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            category TEXT,
            rating INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        );
        "
        log_success "Minimal database structure created"
        cd /workspace
    fi

    # Step 7: Create or update .env file
    log_step "Configuring environment variables..."

    if [[ -f ".env" ]]; then
        backup_file ".env"
        log_info "Existing .env file backed up"
    fi

    # Generate secure keys
    local secret_key
    local encryption_key
    secret_key=$(generate_secure_key 32)
    encryption_key=$(generate_secure_key 32)

    cat > .env << EOF
# Creative Muse AI Environment Configuration
# Generated on $(date)

# Environment
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO

# Database
DATABASE_URL=sqlite:///database/creative_muse.db

# Security
SECRET_KEY=${secret_key}
ENCRYPTION_KEY=${encryption_key}

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=1

# CORS Configuration
CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080", "http://localhost:8001"]

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Creative Muse AI

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# File Upload
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=/workspace/uploads

# Cache Configuration
CACHE_TTL=3600
CACHE_DIR=/workspace/cache

# Development Tools
ENABLE_PROFILING=true
ENABLE_DEBUG_TOOLBAR=true
EOF

    log_success "Environment configuration created with secure keys"

    # Step 8: Configure Git
    log_step "Configuring Git..."
    git config --global --add safe.directory /workspace
    git config --global init.defaultBranch main
    git config --global pull.rebase false
    log_success "Git configuration completed"

    # Step 9: Install Node.js dependencies
    log_step "Installing Node.js dependencies..."

    # Install Next.js app dependencies
    if check_directory "creative-muse-modern"; then
        log_info "Installing Next.js app dependencies..."
        cd /workspace/creative-muse-modern

        # Check if package-lock.json exists and is valid
        if [[ -f "package-lock.json" ]]; then
            npm ci --silent
        else
            npm install --silent
        fi

        log_success "Next.js dependencies installed"
        cd /workspace
    fi

    # Install root package.json dependencies (if exists)
    if check_file "package.json"; then
        log_info "Installing root Node.js dependencies..."
        npm install --silent
        log_success "Root Node.js dependencies installed"
    fi

    # Step 10: Final validation
    log_step "Performing final validation..."

    local validation_errors=0

    # Check if critical files exist
    if ! check_file ".env"; then
        log_error ".env file was not created properly"
        ((validation_errors++))
    fi

    if ! check_directory "database"; then
        log_error "Database directory was not created"
        ((validation_errors++))
    fi

    # Check if Python packages are installed
    if ! python3 -c "import fastapi" 2>/dev/null; then
        log_error "FastAPI not properly installed"
        ((validation_errors++))
    fi

    # Check if Node.js dependencies are installed (if Next.js app exists)
    if check_directory "creative-muse-modern"; then
        if [[ ! -d "creative-muse-modern/node_modules" ]]; then
            log_error "Next.js dependencies not properly installed"
            ((validation_errors++))
        fi
    fi

    if [[ $validation_errors -eq 0 ]]; then
        log_success "Final validation completed successfully"
    else
        log_error "Final validation found $validation_errors error(s)"
        exit 1
    fi

    # Step 11: Setup development scripts and bash functions
    log_step "Setting up development scripts..."

    # Make development scripts executable
    chmod +x .devcontainer/dev-scripts.sh
    chmod +x .devcontainer/bashrc_functions.sh

    # Add bash functions to user's bashrc
    local bashrc_file="/home/vscode/.bashrc"
    local functions_source="source /workspace/.devcontainer/bashrc_functions.sh"

    if ! grep -q "bashrc_functions.sh" "$bashrc_file" 2>/dev/null; then
        {
            echo ""
            echo "# Creative Muse AI Development Functions"
            echo "$functions_source"
        } >> "$bashrc_file"
        log_success "Development functions added to bashrc"
    else
        log_info "Development functions already configured in bashrc"
    fi

    # Source the functions for current session
    source .devcontainer/bashrc_functions.sh

    log_success "Development scripts configured"

    # Step 12: Display completion message
    echo
    echo -e "${GREEN}🎉 =============================================="
    echo "   Setup Complete! Creative Muse AI Ready!"
    echo "===============================================${NC}"
    echo
    echo -e "${CYAN}📋 Quick Start Guide:${NC}"
    echo "1. Start full stack: ${YELLOW}start-fullstack${NC}"
    echo "2. Start backend:    ${YELLOW}start-backend${NC}"
    echo "3. Start frontend:   ${YELLOW}start-frontend${NC}"
    echo "4. Open browser:     ${YELLOW}http://localhost:3000${NC}"
    echo
    echo -e "${CYAN}🛠️  Development Tools:${NC}"
    echo "• Code quality:      ${YELLOW}check-code${NC}"
    echo "• Run tests:         ${YELLOW}run-tests${NC}"
    echo "• Database shell:    ${YELLOW}db-shell${NC}"
    echo "• DB admin tools:    ${YELLOW}start-db-admin${NC}"
    echo "• Show status:       ${YELLOW}show-status${NC}"
    echo "• Project info:      ${YELLOW}project-info${NC}"
    echo "• Help:              ${YELLOW}dev-help${NC}"
    echo
    echo -e "${CYAN}🌐 Available URLs:${NC}"
    echo "• Next.js App:       http://localhost:3000"
    echo "• Backend API:       http://localhost:8000"
    echo "• API Docs:          http://localhost:8000/docs"
    echo "• Health Check:      http://localhost:8000/health"
    echo "• SQLite Web:        http://localhost:8081"
    echo
    echo -e "${CYAN}🚀 Architecture:${NC}"
    echo "• Backend:           ai_core/main.py (unified)"
    echo "• Frontend:          creative-muse-modern/ (Next.js)"
    echo "• Database:          database/creative_muse.db (SQLite)"
    echo
    echo -e "${GREEN}🚀 Happy coding! 🎨🤖${NC}"
    echo -e "${YELLOW}💡 Tip: Run 'project-info' for detailed information${NC}"
}

# Run main function
main "$@"
