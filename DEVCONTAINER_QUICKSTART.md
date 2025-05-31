# 🚀 Creative Muse AI - DevContainer Schnellstart

## 🌐 Mit Traefik (Domain-basiert) - EMPFOHLEN

### 1. Hosts-Datei konfigurieren (EINMALIG, außerhalb DevContainer)
```bash
# Automatisch:
bash .devcontainer/setup-hosts.sh

# Oder manuell /etc/hosts erweitern:
# 127.0.0.1 creative-muse.local
# 127.0.0.1 api.creative-muse.local
# 127.0.0.1 traefik.creative-muse.local
```

### 2. DevContainer starten
```bash
# VS Code: Ctrl+Shift+P → "Dev Containers: Reopen in Container"
# Traefik startet automatisch
```

### 3. Services starten
```bash
# Terminal 1: Database (falls nötig)
init-database

# Terminal 2: Backend
start-backend

# Terminal 3: Frontend
start-frontend
```

### 4. System testen (Domain-basiert)
- **🌐 Frontend:** http://creative-muse.local
- **🔌 Backend:** http://api.creative-muse.local/health
- **📊 Traefik:** http://traefik.creative-muse.local

## 🔧 Klassisch (Port-basiert)

### Nach dem DevContainer-Start

### 1. Database initialisieren (falls nötig)
```bash
# Neues Terminal öffnen: Ctrl+Shift+`
# Falls Backend "database not_found" zeigt:
init-database
```

### 2. Backend starten (Terminal 1)
```bash
start-backend

# Warten bis Sie sehen:
# "Uvicorn running on http://0.0.0.0:8000"
```

### 3. Frontend starten (Terminal 2)
```bash
# Weiteres Terminal öffnen: Ctrl+Shift+`
start-frontend

# Warten bis Sie sehen:
# "Serving at http://localhost:3000"
```

### 4. System testen (Port-basiert)
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