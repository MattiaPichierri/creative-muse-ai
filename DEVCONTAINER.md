# 🐳 Creative Muse AI DevContainer

## Schnellstart

1. **Voraussetzungen installieren:**
   - [Visual Studio Code](https://code.visualstudio.com/)
   - [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/)

2. **Projekt öffnen:**
   ```bash
   git clone <repository-url>
   cd creative-muse-ai
   code .
   ```

3. **DevContainer starten:**
   - VS Code öffnet automatisch eine Benachrichtigung
   - Klicke auf "Reopen in Container"
   - Oder: `Ctrl+Shift+P` → "Dev Containers: Reopen in Container"

4. **Warten bis Setup abgeschlossen ist** (beim ersten Mal ca. 5-10 Minuten)

5. **System starten:**
   ```bash
   # Backend starten
   start-backend
   
   # In neuem Terminal: Frontend starten  
   start-frontend
   ```

6. **Testen:**
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000

## 🎯 Was ist enthalten?

### Entwicklungsumgebung
- ✅ Python 3.11 mit allen Dependencies
- ✅ Node.js 18 für Frontend-Tools
- ✅ SQLite Database
- ✅ VS Code Extensions (Python, Prettier, etc.)
- ✅ Code-Formatierung (Black, Prettier)
- ✅ Linting (Flake8, ESLint)
- ✅ Testing (Pytest)
- ✅ Debugging-Konfiguration

### Automatisierte Tools
- ✅ Pre-commit Hooks für Code-Qualität
- ✅ Automatische Formatierung beim Speichern
- ✅ Live-Reload für Frontend und Backend
- ✅ Database-Setup
- ✅ Environment-Konfiguration

### Verfügbare Befehle
```bash
start-backend     # FastAPI Server starten
start-frontend    # Frontend Development Server
run-tests         # Tests ausführen
check-code        # Code-Qualität prüfen
format-code       # Code formatieren
db-shell          # Database Shell
```

## 🔧 Troubleshooting

**Container startet nicht:**
- Docker Desktop läuft?
- Genug Speicherplatz verfügbar?
- Ports 8000/3000 frei?

**Rebuild Container:**
- `Ctrl+Shift+P` → "Dev Containers: Rebuild Container"

**Zurück zu lokalem Workspace:**
- `Ctrl+Shift+P` → "Dev Containers: Reopen Folder Locally"

## 📚 Weitere Informationen

Detaillierte Dokumentation: [.devcontainer/README.md](.devcontainer/README.md)

Happy Coding! 🎨🤖