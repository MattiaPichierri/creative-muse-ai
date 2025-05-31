# Creative Muse AI DevContainer

Dieser DevContainer bietet eine vollständig konfigurierte Entwicklungsumgebung für das Creative Muse AI Projekt.

## 🚀 Schnellstart

1. **Voraussetzungen:**
   - Visual Studio Code mit der "Dev Containers" Extension
   - Docker Desktop installiert und laufend

2. **Container starten:**
   - Öffne das Projekt in VS Code
   - Drücke `Ctrl+Shift+P` (oder `Cmd+Shift+P` auf Mac)
   - Wähle "Dev Containers: Reopen in Container"
   - Warte, bis der Container gebaut und gestartet ist

3. **Erste Schritte:**
   ```bash
   # Backend starten
   start-backend
   
   # In einem neuen Terminal: Frontend starten
   start-frontend
   
   # Tests ausführen
   run-tests
   ```

## 📦 Enthaltene Tools und Extensions

### Python Development
- Python 3.11
- FastAPI, SQLAlchemy, Pydantic
- Black (Code Formatter)
- Flake8 (Linter)
- Pylint (Code Analysis)
- MyPy (Type Checking)
- Pytest (Testing Framework)
- IPython (Interactive Shell)
- Jupyter (Notebooks)

### Frontend Development
- Node.js 18
- Live Server
- Prettier (Code Formatter)
- ESLint (JavaScript Linter)

### Database
- SQLite3
- Database Browser Tools

### Code Quality
- Pre-commit Hooks
- Bandit (Security Linter)
- Safety (Dependency Security Check)

### VS Code Extensions
- Python Extension Pack
- Pylance (Python Language Server)
- Black Formatter
- Flake8 Linter
- Live Server
- Prettier
- Makefile Tools
- Path Intellisense

## 🔧 Verfügbare Befehle

### Projekt-spezifische Aliases
```bash
start-backend     # FastAPI Backend starten (Port 8000)
start-frontend    # Frontend Development Server (Port 3000)
run-tests         # Test Suite ausführen
check-code        # Code-Qualität prüfen
format-code       # Code formatieren
db-shell          # SQLite Database Shell öffnen
```

### Navigation Aliases
```bash
backend           # cd /workspace/ai_core
frontend          # cd /workspace/ui_frontend
db                # cd /workspace/database
logs              # cd /workspace/logs
```

## 🌐 Port-Forwarding

Der DevContainer leitet automatisch folgende Ports weiter:

- **8000**: Creative Muse AI Backend (FastAPI)
- **3000**: Frontend Development Server
- **5000**: Zusätzliche Services

## 📁 Verzeichnisstruktur

```
/workspace/
├── ai_core/              # Backend Python Code
├── ui_frontend/          # Frontend HTML/CSS/JS
├── database/             # SQLite Database & Schema
├── security/             # Security Modules
├── scripts/              # Build & Deployment Scripts
├── logs/                 # Application Logs
└── .devcontainer/        # DevContainer Configuration
```

## 🔒 Umgebungsvariablen

Der Container erstellt automatisch eine `.env` Datei mit Entwicklungseinstellungen:

```env
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=sqlite:///database/creative_muse.db
SECRET_KEY=dev-secret-key-change-in-production
API_HOST=0.0.0.0
API_PORT=8000
```

## 🧪 Testing

```bash
# Alle Tests ausführen
run-tests

# Tests mit Coverage
pytest --cov=ai_core

# Spezifische Tests
pytest ai_core/tests/test_api.py
```

## 🔍 Code Quality

```bash
# Code-Qualität prüfen
check-code

# Code automatisch formatieren
format-code

# Sicherheitsprüfung
bandit -r ai_core/

# Dependency-Sicherheit
safety check
```

## 🗄️ Database Management

```bash
# Database Shell öffnen
db-shell

# Schema neu laden
sqlite3 database/creative_muse.db < database/schema.sql

# Database Backup
cp database/creative_muse.db database/backup_$(date +%Y%m%d_%H%M%S).db
```

## 🐛 Debugging

### VS Code Debugging
- Python Debugger ist vorkonfiguriert
- Breakpoints in Python Code setzen
- F5 zum Starten des Debuggers

### Logs anzeigen
```bash
# Application Logs
tail -f logs/app.log

# Error Logs
tail -f logs/error.log

# Alle Logs
ls -la logs/
```

## 🔄 Container neu starten

Falls Probleme auftreten:

1. **Container neu bauen:**
   - `Ctrl+Shift+P` → "Dev Containers: Rebuild Container"

2. **Container ohne Cache neu bauen:**
   - `Ctrl+Shift+P` → "Dev Containers: Rebuild Container Without Cache"

3. **Zurück zum lokalen Workspace:**
   - `Ctrl+Shift+P` → "Dev Containers: Reopen Folder Locally"

## 📝 Entwicklungsworkflow

1. **Code ändern** in VS Code
2. **Automatische Formatierung** beim Speichern
3. **Pre-commit Hooks** prüfen Code-Qualität
4. **Tests ausführen** mit `run-tests`
5. **Backend testen** auf http://localhost:8000
6. **Frontend testen** auf http://localhost:3000

## 🆘 Hilfe & Troubleshooting

### Häufige Probleme

**Port bereits belegt:**
```bash
# Prozess auf Port finden und beenden
lsof -ti:8000 | xargs kill -9
```

**Python Module nicht gefunden:**
```bash
# Requirements neu installieren
pip install -r ai_core/requirements.txt
```

**Database Probleme:**
```bash
# Database neu initialisieren
rm database/creative_muse.db
sqlite3 database/creative_muse.db < database/schema.sql
```

### Support
- Überprüfe die Container-Logs in VS Code
- Nutze das integrierte Terminal für Debugging
- Alle Tools sind über die Command Palette verfügbar

## 🎯 Nächste Schritte

Nach dem ersten Start:

1. Backend starten: `start-backend`
2. Frontend öffnen: http://localhost:3000
3. API testen: http://localhost:8000/health
4. Erste Idee generieren und System testen

Happy Coding! 🎨🤖