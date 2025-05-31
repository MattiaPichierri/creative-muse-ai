# 🚀 Creative Muse AI - DevContainer Schnellstart

## Nach dem DevContainer-Start

### 1. Backend starten (Terminal 1)
```bash
# Neues Terminal öffnen: Ctrl+Shift+`
start-backend

# Warten bis Sie sehen:
# "Uvicorn running on http://0.0.0.0:8000"
```

### 2. Frontend starten (Terminal 2)
```bash
# Weiteres Terminal öffnen: Ctrl+Shift+`
start-frontend

# Warten bis Sie sehen:
# "Serving at http://localhost:3000"
```

### 3. System testen
- **Frontend öffnen:** http://localhost:3000
- **Backend testen:** http://localhost:8000/health
- **Idee generieren:** Prompt eingeben und "Idee generieren" klicken

## ⚡ Schnelle Befehle

```bash
# Backend starten
start-backend

# Frontend starten  
start-frontend

# Tests ausführen
run-tests

# Code formatieren
format-code

# Database Shell
db-shell
```

## 🔧 Bei Problemen

### Backend startet nicht:
```bash
# Dependencies installieren:
pip install -r ai_core/requirements.txt

# Manuell starten:
cd /workspace && python ai_core/main_simple.py
```

### Frontend verbindet nicht:
- Backend läuft? → `curl http://localhost:8000/health`
- Browser-Console prüfen (F12)
- Port-Forwarding prüfen (VS Code Ports-Tab)

### Port-Konflikte:
```bash
# Port 8000 freigeben:
lsof -ti:8000 | xargs kill -9

# Port 3000 freigeben:
lsof -ti:3000 | xargs kill -9
```

## 📚 Weitere Hilfe

- **Detaillierte Anleitung:** [.devcontainer/BACKEND_START_GUIDE.md](.devcontainer/BACKEND_START_GUIDE.md)
- **Netzwerk-Probleme:** [.devcontainer/NETWORK_TROUBLESHOOTING.md](.devcontainer/NETWORK_TROUBLESHOOTING.md)
- **Allgemeine Probleme:** [.devcontainer/TROUBLESHOOTING.md](.devcontainer/TROUBLESHOOTING.md)

## ✅ Erfolg!

Wenn alles funktioniert:
- ✅ Backend: http://localhost:8000/health zeigt JSON
- ✅ Frontend: http://localhost:3000 zeigt die Anwendung
- ✅ Ideengenerierung funktioniert ohne Fehler

Happy Coding! 🎨🤖