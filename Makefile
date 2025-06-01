# Creative Muse AI - Secure Build Automation

.PHONY: help setup-secure dev-secure test-security backup clean

# Default target
help:
	@echo "Creative Muse AI - Verfügbare Targets:"
	@echo ""
	@echo "Setup:"
	@echo "  setup-secure     - Vollständiges sicheres Setup"
	@echo "  generate-keys    - Kryptographische Schlüssel generieren"
	@echo "  setup-encryption - Verschlüsselungsinfrastruktur einrichten"
	@echo "  install-deps     - Alle Abhängigkeiten installieren"
	@echo "  init-secure-db   - Sichere Datenbank initialisieren"
	@echo ""
	@echo "Entwicklung:"
	@echo "  dev-secure       - Sichere Entwicklungsumgebung starten"
	@echo "  start-backend    - Backend starten"
	@echo "  start-frontend   - Frontend starten"
	@echo "  start-monitoring - Sicherheitsmonitoring starten"
	@echo ""
	@echo "Tests:"
	@echo "  test-security    - Sicherheitstests ausführen"
	@echo "  test-backend     - Backend-Tests"
	@echo "  test-frontend    - Frontend-Tests"
	@echo "  compliance-check - Compliance-Überprüfung"
	@echo ""
	@echo "Wartung:"
	@echo "  backup           - Verschlüsseltes Backup erstellen"
	@echo "  rotate-keys      - Schlüsselrotation durchführen"
	@echo "  security-audit   - Sicherheitsaudit durchführen"
	@echo "  clean            - Temporäre Dateien löschen"
	@echo ""

# Vollständiges sicheres Setup
setup-secure: install-deps generate-keys setup-encryption init-secure-db update-db load-env
	@echo "✅ Sicheres Setup abgeschlossen"

# Kryptographische Schlüssel generieren
generate-keys:
	@echo "🔑 Generiere kryptographische Schlüssel..."
	@mkdir -p security/keys
	@chmod 700 security/keys
	@cd ai_core && source venv/bin/activate && python3 ../scripts/key_generation.py
	@echo "✅ Schlüssel generiert"

# Verschlüsselungsinfrastruktur einrichten
setup-encryption:
	@echo "🔒 Richte Verschlüsselungsinfrastruktur ein..."
	@mkdir -p security/certificates
	@chmod 700 security/certificates
	@python3 scripts/security_setup.py
	@echo "✅ Verschlüsselung eingerichtet"

# Alle Abhängigkeiten installieren
install-deps: install-python install-node
	@echo "✅ Alle Abhängigkeiten installiert"

install-python:
	@echo "🐍 Installiere Python-Abhängigkeiten..."
	@cd ai_core && python3 -m venv venv
	@cd ai_core && source venv/bin/activate && python3 -m pip install --upgrade pip
	@cd ai_core && source venv/bin/activate && pip install -r requirements.txt
	@cd ai_core && source venv/bin/activate && pip install -r requirements-security.txt
	@echo "✅ Python-Umgebung erstellt: ai_core/venv"

install-node:
	@echo "📦 Installiere Node.js-Abhängigkeiten..."
	@cd ui_frontend && npm install
	@cd creative-muse-modern && npm install
	@if [ -d "creative-muse-react" ]; then cd creative-muse-react && npm install; fi

# Sichere Datenbank initialisieren
init-secure-db:
	@echo "🗄️ Initialisiere sichere Datenbank..."
	@mkdir -p database
	@chmod 700 database
	@cd ai_core && source venv/bin/activate && python3 ../database/init_db.py
	@echo "✅ Datenbank initialisiert"

# Datenbank aktualisieren
update-db:
	@echo "🔄 Aktualisiere Datenbank-Schema..."
	@python3 scripts/update_database.py
	@echo "✅ Datenbank aktualisiert"

# Environment-Variablen laden
load-env:
	@echo "🔧 Lade Environment-Variablen..."
	@python3 scripts/load_env.py bash
	@echo "✅ Environment-Script erstellt: load_env.sh"
	@echo "💡 Verwende: source load_env.sh"

# Sichere Entwicklungsumgebung starten
dev-secure: start-monitoring start-backend start-frontend
	@echo "🚀 Sichere Entwicklungsumgebung gestartet"

# Backend starten
start-backend:
	@echo "🔧 Starte Backend..."
	@cd ai_core && source venv/bin/activate && python3 main.py &

# Frontend starten
start-frontend:
	@echo "🖥️ Starte Frontend..."
	@echo "Wähle Frontend:"
	@echo "1. Next.js Frontend (empfohlen): make start-modern"
	@echo "2. Legacy React Frontend: make start-react"
	@echo "3. Legacy Electron Frontend: make start-electron"

# Next.js Frontend starten
start-modern:
	@echo "🖥️ Starte Next.js Frontend..."
	@cd creative-muse-modern && npm run dev &

# Legacy React Frontend starten
start-react:
	@echo "🖥️ Starte Legacy React Frontend..."
	@if [ -d "creative-muse-react" ]; then cd creative-muse-react && npm run dev &; else echo "❌ Legacy React Frontend nicht gefunden"; fi

# Electron Frontend starten
start-electron:
	@echo "🖥️ Starte Electron Frontend..."
	@cd ui_frontend && npm run dev &

# Sicherheitsmonitoring starten
start-monitoring:
	@echo "👁️ Starte Sicherheitsmonitoring..."
	@mkdir -p logs/audit logs/security logs/performance
	@chmod 700 logs
	@python3 ai_core/monitoring/security_monitor.py &

# Sicherheitstests ausführen
test-security: test-encryption test-authentication test-authorization test-audit
	@echo "✅ Alle Sicherheitstests bestanden"

test-encryption:
	@echo "🔐 Teste Verschlüsselung..."
	@cd ai_core && python3 -m pytest tests/security/test_encryption.py -v

test-authentication:
	@echo "🔑 Teste Authentifizierung..."
	@cd ai_core && python3 -m pytest tests/security/test_authentication.py -v

test-authorization:
	@echo "🛡️ Teste Autorisierung..."
	@cd ai_core && python3 -m pytest tests/security/test_authorization.py -v

test-audit:
	@echo "📋 Teste Audit-System..."
	@cd ai_core && python3 -m pytest tests/security/test_audit.py -v

# Backend-Tests
test-backend:
	@echo "🧪 Führe Backend-Tests aus..."
	@cd ai_core && python3 -m pytest tests/ -v

# Frontend-Tests
test-frontend:
	@echo "🧪 Führe Frontend-Tests aus..."
	@cd ui_frontend && npm test
	@cd creative-muse-modern && npm test
	@if [ -d "creative-muse-react" ]; then cd creative-muse-react && npm test; fi

# Compliance-Überprüfung
compliance-check:
	@echo "📊 Führe Compliance-Check durch..."
	@python3 scripts/compliance_checker.py
	@echo "✅ Compliance-Check abgeschlossen"

# Verschlüsseltes Backup erstellen
backup:
	@echo "💾 Erstelle verschlüsseltes Backup..."
	@python3 scripts/backup_script.py
	@echo "✅ Backup erstellt"

# Schlüsselrotation durchführen
rotate-keys:
	@echo "🔄 Führe Schlüsselrotation durch..."
	@python3 scripts/key_rotation.py
	@echo "✅ Schlüsselrotation abgeschlossen"

# Sicherheitsaudit durchführen
security-audit:
	@echo "🔍 Führe Sicherheitsaudit durch..."
	@python3 scripts/security_audit.py
	@echo "✅ Sicherheitsaudit abgeschlossen"

# Modell herunterladen
download-model:
	@echo "📥 Lade Mistral-7B Modell herunter..."
	@python3 scripts/download_model.py
	@echo "✅ Modell heruntergeladen"

# Temporäre Dateien löschen
clean:
	@echo "🧹 Lösche temporäre Dateien..."
	@find . -type f -name "*.pyc" -delete
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.log" -delete
	@rm -rf ai_core/.pytest_cache
	@rm -rf ui_frontend/node_modules/.cache
	@rm -rf creative-muse-modern/node_modules/.cache
	@rm -rf creative-muse-modern/.next
	@if [ -d "creative-muse-react" ]; then rm -rf creative-muse-react/node_modules/.cache creative-muse-react/dist; fi
	@echo "✅ Cleanup abgeschlossen"

# Notfall-Prozeduren
emergency-lockdown:
	@echo "🚨 Notfall-Lockdown aktiviert..."
	@pkill -f "python3.*main.py" || true
	@pkill -f "npm.*dev" || true
	@python3 scripts/emergency_procedures.py
	@echo "🔒 System gesichert"

# Alle Prozesse stoppen
stop-all:
	@echo "⏹️ Stoppe alle Prozesse..."
	@pkill -f "python3.*main.py" || true
	@pkill -f "npm.*dev" || true
	@pkill -f "security_monitor.py" || true
	@echo "✅ Alle Prozesse gestoppt"

# Logs anzeigen
show-logs:
	@echo "📋 Aktuelle Logs:"
	@tail -n 50 logs/audit/*.log 2>/dev/null || echo "Keine Audit-Logs gefunden"
	@tail -n 50 logs/security/*.log 2>/dev/null || echo "Keine Security-Logs gefunden"

# System-Status anzeigen
status:
	@echo "📊 System-Status:"
	@echo "Backend: $(shell pgrep -f 'python3.*main.py' > /dev/null && echo '✅ Läuft' || echo '❌ Gestoppt')"
	@echo "Frontend: $(shell pgrep -f 'npm.*dev' > /dev/null && echo '✅ Läuft' || echo '❌ Gestoppt')"
	@echo "Monitoring: $(shell pgrep -f 'security_monitor.py' > /dev/null && echo '✅ Läuft' || echo '❌ Gestoppt')"
# =============================================================================
# DEPLOYMENT
# =============================================================================

.PHONY: deploy
deploy: ## 🚀 Deployment durchführen
	@echo "🚀 Starte Deployment..."
	python scripts/deploy.py

.PHONY: deploy-production
deploy-production: ## 🏭 Production Deployment
	@echo "🏭 Starte Production Deployment..."
	python scripts/deploy.py --production

.PHONY: deploy-quick
deploy-quick: ## ⚡ Schnelles Deployment (ohne Backup/Build)
	@echo "⚡ Starte schnelles Deployment..."
	python scripts/deploy.py --skip-backup --skip-build

.PHONY: docker-build
docker-build: ## 🔨 Docker Images bauen
	@echo "🔨 Baue Docker Images..."
	@cd ai_core && docker build -t creative-muse-api .
	@cd creative-muse-modern && docker build -t creative-muse-frontend .

.PHONY: docker-up
docker-up: ## 🐳 Docker Container starten
	@echo "🐳 Starte Docker Container..."
	docker-compose up -d

.PHONY: docker-down
docker-down: ## 🛑 Docker Container stoppen
	@echo "🛑 Stoppe Docker Container..."
	docker-compose down

.PHONY: docker-logs
docker-logs: ## 📋 Docker Logs anzeigen
	@echo "📋 Docker Logs:"
	docker-compose logs --tail=50

.PHONY: docker-clean
docker-clean: ## 🧹 Docker aufräumen
	@echo "🧹 Räume Docker auf..."
	docker system prune -f
	docker volume prune -f

# =============================================================================
# MONITORING UND WARTUNG
# =============================================================================

.PHONY: monitor
monitor: ## 📊 System-Monitoring starten
	@echo "📊 Starte System-Monitoring..."
	python scripts/system_monitor.py

.PHONY: optimize
optimize: ## 🚀 Performance-Optimierung durchführen
	@echo "🚀 Führe Performance-Optimierung durch..."
	python scripts/performance_optimizer.py

.PHONY: optimize-full
optimize-full: ## 🚀 Vollständige Performance-Optimierung
	@echo "🚀 Führe vollständige Performance-Optimierung durch..."
	python scripts/performance_optimizer.py --full

.PHONY: logs
logs: ## 📋 Logs anzeigen
	@echo "📋 Zeige aktuelle Logs..."
	@if [ -d "logs" ]; then \
		find logs -name "*.log" -type f -exec tail -n 20 {} + 2>/dev/null || echo "Keine Logs gefunden"; \
	else \
		echo "Log-Verzeichnis nicht gefunden"; \
	fi

.PHONY: health-check
health-check: ## 🏥 Gesundheitsprüfung durchführen
	@echo "🏥 Führe Gesundheitsprüfung durch..."
	@echo "🔧 Backend API:"
	@curl -s http://localhost:8000/health 2>/dev/null && echo " ✅ Online" || echo " ❌ Offline"
	@echo "🖥️  Frontend:"
	@curl -s http://localhost:3000 2>/dev/null >/dev/null && echo " ✅ Online" || echo " ❌ Offline"
	@echo "🗄️  Database:"
	@if [ -f "database/creative_muse.db" ]; then echo " ✅ Verfügbar"; else echo " ❌ Nicht gefunden"; fi
	@echo "Datenbank: $(shell test -f database/creative_muse.db && echo '✅ Vorhanden' || echo '❌ Nicht gefunden')"