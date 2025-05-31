# Creative Muse AI DevContainer Setup

## 🚀 React + DevContainer Integration

Dieses DevContainer Setup ist speziell für die neue **React + Vite** Version von Creative Muse AI konfiguriert.

### 🏗️ Architektur

```
Creative Muse AI DevContainer
├── 🐍 Python Backend (FastAPI + LLM)     → Port 8001
├── ⚛️ React Frontend (Vite)              → Port 3000
├── 🌐 Traefik Reverse Proxy              → Port 80/443
└── 📊 Traefik Dashboard                   → Port 8080
```

### 🔧 Schnellstart

#### 1. DevContainer Starten
```bash
# In VS Code: Cmd/Ctrl + Shift + P
# "Dev Containers: Reopen in Container"
```

#### 2. Entwicklungsserver Starten
```bash
# Automatischer Start (empfohlen)
bash .devcontainer/start-react-dev.sh

# Oder manuell:
# Terminal 1: Backend
start-backend

# Terminal 2: Frontend
start-frontend
```

#### 3. URLs Aufrufen
- **React App**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs
- **Traefik Dashboard**: http://localhost:8080

### 📦 Verfügbare Befehle

#### Backend (Python)
```bash
start-backend          # FastAPI Server starten
check-code            # Code-Qualität prüfen
format-code           # Code formatieren
run-tests             # Tests ausführen
db-shell              # SQLite Shell öffnen
```

#### Frontend (React)
```bash
start-frontend         # React Dev Server
start-frontend-build   # Build + Preview
run-frontend-tests     # React Tests
format-frontend        # Prettier formatieren
lint-frontend          # ESLint prüfen
```

#### Navigation
```bash
backend               # cd ai_core/
frontend              # cd creative-muse-react/
db                    # cd database/
logs                  # cd logs/
```

### 🛠️ Technologie Stack

#### DevContainer Features
- ✅ **Python 3.11** mit allen AI/ML Bibliotheken
- ✅ **Node.js 18** für React Development
- ✅ **Git** + **GitHub CLI** für Versionskontrolle
- ✅ **VS Code Extensions** für Python + React
- ✅ **Traefik** für professionelles Routing

#### React Frontend
- ✅ **React 18** + **TypeScript**
- ✅ **Vite** für ultra-schnelle Entwicklung
- ✅ **Tailwind CSS** + **Framer Motion**
- ✅ **PWA Support** (installierbar)
- ✅ **Hot Module Replacement**

#### Python Backend
- ✅ **FastAPI** mit automatischer API-Dokumentation
- ✅ **LLM Integration** für echte AI-Generierung
- ✅ **SQLite** Datenbank mit Migrations
- ✅ **CORS** konfiguriert für React

### 🔄 Port Mapping

| Service | Container Port | Host Port | Beschreibung |
|---------|---------------|-----------|--------------|
| React Dev Server | 3000 | 3000 | Vite Development Server |
| Vite Alternative | 5173 | 5173 | Fallback Vite Port |
| Python Backend | 8001 | 8001 | FastAPI + LLM Server |
| Traefik HTTP | 80 | 80 | Reverse Proxy |
| Traefik HTTPS | 443 | 443 | SSL Termination |
| Traefik Dashboard | 8080 | 8080 | Management Interface |

### 🎯 Entwicklungsworkflow

#### 1. Code Änderungen
```bash
# Frontend (React)
cd creative-muse-react/
# Änderungen werden automatisch hot-reloaded

# Backend (Python)
cd ai_core/
# Server automatisch neu starten bei Änderungen
```

#### 2. Testing
```bash
# Frontend Tests
run-frontend-tests

# Backend Tests
run-tests

# Code Quality
check-code
lint-frontend
```

#### 3. Build & Deploy
```bash
# Production Build
cd creative-muse-react/
npm run build

# Preview Build
npm run preview
```

### 🐛 Troubleshooting

#### Port bereits belegt
```bash
# Prozesse auf Port prüfen
lsof -i :3000
lsof -i :8001

# Prozess beenden
kill -9 <PID>
```

#### Dependencies fehlen
```bash
# React Dependencies
cd creative-muse-react/
npm install

# Python Dependencies
cd ai_core/
pip install -r requirements.txt
```

#### Container neu bauen
```bash
# In VS Code: Cmd/Ctrl + Shift + P
# "Dev Containers: Rebuild Container"
```

### 🎨 Features

#### ✅ Vollständig Funktional
- **React Hot Reload**: Sofortige UI-Updates
- **API Proxy**: Automatische Backend-Verbindung
- **TypeScript**: Vollständige Typisierung
- **PWA**: Installierbar als Desktop/Mobile App
- **Dark Mode**: Persistente Theme-Umschaltung
- **Multilingual**: Deutsch/Englisch/Italienisch
- **LLM Integration**: Echte AI-Ideengenerierung
- **Streaming**: Character-by-character Typing Animation

#### 🚀 Performance Optimiert
- **Code Splitting**: Automatische Bundle-Optimierung
- **Tree Shaking**: Entfernung ungenutzten Codes
- **Caching**: Service Worker für Offline-Support
- **Lazy Loading**: Komponenten bei Bedarf laden

### 📝 Nächste Schritte

1. **DevContainer starten**: `Dev Containers: Reopen in Container`
2. **Setup ausführen**: Automatisch via `postCreateCommand`
3. **Server starten**: `bash .devcontainer/start-react-dev.sh`
4. **Entwickeln**: http://localhost:3000 öffnen
5. **Testen**: `run-frontend-tests` und `run-tests`

🎉 **Happy Coding!** 🎨🤖