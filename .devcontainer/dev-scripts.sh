#!/bin/bash
# Creative Muse AI - Development Scripts
# Script di utilità per lo sviluppo con architettura unificata

set -euo pipefail

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
# BLUE='\033[0;34m'  # Unused variable
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funzioni di logging
log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Funzione per verificare se un processo è in esecuzione
is_running() {
    local port=$1
    lsof -i :"$port" >/dev/null 2>&1
}

# Funzione per attendere che un servizio sia pronto
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1

    log_info "Waiting for $name to be ready..."

    while [[ $attempt -le $max_attempts ]]; do
        if curl -s "$url" >/dev/null 2>&1; then
            log_success "$name is ready!"
            return 0
        fi

        echo -n "."
        sleep 1
        ((attempt++))
    done

    log_error "$name failed to start within $max_attempts seconds"
    return 1
}

# Start Backend (Unified main.py)
start-backend() {
    log_info "Starting Creative Muse AI Backend (Unified)..."

    if is_running 8000; then
        log_warning "Backend already running on port 8000"
        return 0
    fi

    cd /workspace/ai_core

    # Verifica che il file main.py unificato esista
    if [[ ! -f "main.py" ]]; then
        log_error "Unified main.py not found in ai_core/"
        return 1
    fi

    # Avvia il backend con uvicorn
    log_info "Starting FastAPI server with uvicorn..."
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level info &

    # Attendi che il backend sia pronto
    wait_for_service "http://localhost:8000/health" "Backend API"

    log_success "Backend started successfully!"
    log_info "API Documentation: http://localhost:8000/docs"
    log_info "Health Check: http://localhost:8000/health"
}

# Start Frontend (Next.js)
start-frontend() {
    log_info "Starting Creative Muse AI Frontend..."

    if is_running 3000; then
        log_warning "Frontend already running on port 3000"
        return 0
    fi

    cd /workspace/creative-muse-modern

    # Verifica che le dipendenze siano installate
    if [[ ! -d "node_modules" ]]; then
        log_info "Installing Node.js dependencies..."
        npm install
    fi

    # Avvia il frontend
    log_info "Starting Next.js development server..."
    npm run dev &

    # Attendi che il frontend sia pronto
    wait_for_service "http://localhost:3000" "Frontend App"

    log_success "Frontend started successfully!"
    log_info "Application: http://localhost:3000"
}

# Start Full Stack
start-fullstack() {
    log_info "Starting Full Creative Muse AI Stack..."

    # Avvia backend
    start-backend

    # Avvia frontend
    start-frontend

    echo
    log_success "🚀 Full stack started successfully!"
    echo -e "${CYAN}📋 Available Services:${NC}"
    echo "• Frontend App:    http://localhost:3000"
    echo "• Backend API:     http://localhost:8000"
    echo "• API Docs:        http://localhost:8000/docs"
    echo "• Health Check:    http://localhost:8000/health"
}

# Stop All Services
stop-all() {
    log_info "Stopping all Creative Muse AI services..."

    # Stop processi su porte specifiche
    local ports=(3000 8000 8080 8081 8082)

    for port in "${ports[@]}"; do
        if is_running "$port"; then
            log_info "Stopping service on port $port..."
            lsof -ti :"$port" | xargs kill -9 2>/dev/null || true
        fi
    done

    log_success "All services stopped"
}

# Check Code Quality
check-code() {
    log_info "Running code quality checks..."

    local errors=0

    # Python code checks
    if [[ -d "ai_core" ]]; then
        log_info "Checking Python code in ai_core/..."
        cd /workspace/ai_core

        # Black formatting check
        if ! python3 -m black --check . 2>/dev/null; then
            log_warning "Python code formatting issues found (run: black .)"
            ((errors++))
        else
            log_success "Python formatting OK"
        fi

        # Flake8 linting
        if ! python3 -m flake8 . 2>/dev/null; then
            log_warning "Python linting issues found"
            ((errors++))
        else
            log_success "Python linting OK"
        fi

        cd /workspace
    fi

    # TypeScript/React checks
    if [[ -d "creative-muse-modern" ]]; then
        log_info "Checking TypeScript/React code..."
        cd /workspace/creative-muse-modern

        # ESLint check
        if [[ -f "package.json" ]] && npm list eslint >/dev/null 2>&1; then
            if ! npm run lint 2>/dev/null; then
                log_warning "TypeScript/React linting issues found"
                ((errors++))
            else
                log_success "TypeScript/React linting OK"
            fi
        fi

        # TypeScript check
        if [[ -f "tsconfig.json" ]]; then
            if ! npx tsc --noEmit 2>/dev/null; then
                log_warning "TypeScript compilation issues found"
                ((errors++))
            else
                log_success "TypeScript compilation OK"
            fi
        fi

        cd /workspace
    fi

    if [[ $errors -eq 0 ]]; then
        log_success "All code quality checks passed! 🎉"
    else
        log_error "Found $errors code quality issue(s)"
        return 1
    fi
}

# Run Tests
run-tests() {
    log_info "Running test suite..."

    local test_errors=0

    # Python tests
    if [[ -d "ai_core" ]]; then
        log_info "Running Python tests..."
        cd /workspace/ai_core

        if [[ -f "test_unified.py" ]] || [[ -f "test_simple.py" ]]; then
            if ! python3 -m pytest -v 2>/dev/null; then
                log_error "Python tests failed"
                ((test_errors++))
            else
                log_success "Python tests passed"
            fi
        else
            log_warning "No Python test files found"
        fi

        cd /workspace
    fi

    # Frontend tests
    if [[ -d "creative-muse-modern" ]]; then
        log_info "Running frontend tests..."
        cd /workspace/creative-muse-modern

        if [[ -f "jest.config.js" ]]; then
            if ! npm test 2>/dev/null; then
                log_error "Frontend tests failed"
                ((test_errors++))
            else
                log_success "Frontend tests passed"
            fi
        else
            log_warning "No frontend test configuration found"
        fi

        cd /workspace
    fi

    if [[ $test_errors -eq 0 ]]; then
        log_success "All tests passed! 🎉"
    else
        log_error "$test_errors test suite(s) failed"
        return 1
    fi
}

# Database Shell
db-shell() {
    log_info "Opening database shell..."

    local db_path="/workspace/database/creative_muse.db"

    if [[ ! -f "$db_path" ]]; then
        log_error "Database not found at $db_path"
        log_info "Run setup.sh first to initialize the database"
        return 1
    fi

    log_info "Opening SQLite shell for Creative Muse AI database"
    log_info "Type .help for SQLite commands, .quit to exit"

    sqlite3 "$db_path"
}

# Start Database Admin Tools
start-db-admin() {
    log_info "Starting database admin tools..."

    local db_path="/workspace/database/creative_muse.db"

    if [[ ! -f "$db_path" ]]; then
        log_error "Database not found at $db_path"
        return 1
    fi

    # Avvia sqlite-web se disponibile
    if command -v sqlite-web >/dev/null 2>&1; then
        if ! is_running 8081; then
            log_info "Starting sqlite-web on port 8081..."
            sqlite-web "$db_path" --host 0.0.0.0 --port 8081 &
            sleep 2
            log_success "SQLite Web UI: http://localhost:8081"
        else
            log_warning "SQLite Web already running on port 8081"
        fi
    else
        log_warning "sqlite-web not installed"
    fi

    log_info "Database admin tools started"
}

# Show Status
show-status() {
    echo -e "${CYAN}🔍 Creative Muse AI Status${NC}"
    echo "================================"

    # Check services
    local services=(
        "3000:Frontend (Next.js)"
        "8000:Backend API (FastAPI)"
        "8081:SQLite Web UI"
    )

    for service in "${services[@]}"; do
        local port="${service%%:*}"
        local name="${service#*:}"

        if is_running "$port"; then
            echo -e "✅ $name - ${GREEN}Running${NC} (port $port)"
        else
            echo -e "❌ $name - ${RED}Stopped${NC} (port $port)"
        fi
    done

    echo
    echo -e "${CYAN}📁 Project Structure:${NC}"
    echo "• Backend:  ai_core/main.py (unified)"
    echo "• Frontend: creative-muse-modern/"
    echo "• Database: database/creative_muse.db"

    # Check database
    if [[ -f "/workspace/database/creative_muse.db" ]]; then
        echo -e "• Database: ${GREEN}Ready${NC}"
    else
        echo -e "• Database: ${RED}Not initialized${NC}"
    fi
}

# Help
show-help() {
    echo -e "${CYAN}🛠️  Creative Muse AI Development Scripts${NC}"
    echo "=========================================="
    echo
    echo -e "${YELLOW}Available Commands:${NC}"
    echo "  start-backend      Start the unified FastAPI backend"
    echo "  start-frontend     Start the Next.js frontend"
    echo "  start-fullstack    Start both backend and frontend"
    echo "  stop-all          Stop all running services"
    echo "  check-code        Run code quality checks"
    echo "  run-tests         Run test suite"
    echo "  db-shell          Open database shell"
    echo "  start-db-admin    Start database admin tools"
    echo "  show-status       Show services status"
    echo "  show-help         Show this help message"
    echo
    echo -e "${CYAN}Examples:${NC}"
    echo "  start-fullstack   # Start complete development environment"
    echo "  check-code        # Check code quality before commit"
    echo "  run-tests         # Run all tests"
    echo "  show-status       # Check what's running"
}

# Main function dispatcher
case "${1:-help}" in
    "start-backend")
        start-backend
        ;;
    "start-frontend")
        start-frontend
        ;;
    "start-fullstack")
        start-fullstack
        ;;
    "stop-all")
        stop-all
        ;;
    "check-code")
        check-code
        ;;
    "run-tests")
        run-tests
        ;;
    "db-shell")
        db-shell
        ;;
    "start-db-admin")
        start-db-admin
        ;;
    "show-status")
        show-status
        ;;
    "help"|"--help"|"-h")
        show-help
        ;;
    *)
        log_error "Unknown command: $1"
        echo
        show-help
        exit 1
        ;;
esac
