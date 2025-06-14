# Creative Muse AI

Eine vollständig offline-fähige, modulare AI-Anwendung für kreative Ideengenerierung mit höchsten Sicherheits- und Datenschutzstandards.

## 🎯 Überblick

Creative Muse AI nutzt lokale LLM-Modelle (Mistral-7B-Instruct-v0.3) und gewährleistet vollständige Datensouveränität durch:

- **100% Offline-Funktionalität**: Keine Internetverbindung erforderlich
- **Modulare Architektur**: Klare Trennung der Verantwortlichkeiten
- **Privacy by Design**: Verschlüsselte lokale Datenspeicherung
- **Security First**: Umfassende Sicherheitsmaßnahmen und Audit-Logs

## 🚀 Schnellstart

### Voraussetzungen

- Python 3.11+
- Node.js 18+
- Git
- Mindestens 16GB RAM (für Mistral-7B)
- 20GB freier Speicherplatz

### Schnelle Installation (Next.js Frontend)

```bash
# Repository klonen
git clone https://github.com/MattiaPichierri/creative-muse-ai.git
cd creative_muse_ai

# Python Backend einrichten
cd ai_core
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Datenbank initialisieren und aktualisieren
cd ..
python database/init_db.py
python scripts/update_database.py

# Next.js Frontend einrichten
cd creative-muse-modern
npm install

# Backend starten (Terminal 1)
cd ../ai_core
export HF_TOKEN=$(cat ~/.cache/huggingface/token)  # Optional
python main_mistral_api.py

# Frontend starten (Terminal 2)
cd ../creative-muse-modern
npm run dev
```

### Vollständiges sicheres Setup

```bash
# Vollständiges sicheres Setup mit allen Sicherheitsfeatures
make setup-secure

# Entwicklungsumgebung starten
make start-modern   # Für Next.js Frontend
# oder
make start-react    # Für Legacy React Frontend
# oder
make start-electron # Für Electron Frontend
```

### Manuelle Installation

```bash
# 1. Python-Umgebung einrichten
cd ai_core
python -m venv venv
source venv/bin/activate  # Linux/Mac
# oder: venv\Scripts\activate  # Windows
pip install -r requirements.txt
pip install -r requirements-security.txt

# 2. Sicherheitsschlüssel generieren
python ../scripts/key_generation.py

# 3. Datenbank initialisieren
python ../database/init_db.py

# 4. Next.js Frontend-Abhängigkeiten installieren
cd ../creative-muse-modern
npm install

# 5. Backend starten (in separatem Terminal)
cd ../ai_core
export HF_TOKEN=$(cat ~/.cache/huggingface/token)  # Falls Hugging Face Token vorhanden
python main_mistral_api.py

# 6. Frontend starten (in separatem Terminal)
cd ../creative-muse-modern
npm run dev
```

## 🏗️ Architektur

```
creative_muse_ai/
├── ai_core/                # Python Backend (FastAPI + Mistral-7B)
├── creative-muse-modern/   # Next.js 15 Frontend (React 19 + TypeScript)
├── creative-muse-react/    # Legacy React Frontend (Vite + TypeScript)
├── ui_frontend/            # Legacy Electron Frontend
├── database/               # Verschlüsselte SQLite Datenbank
├── security/               # Sicherheits- und Verschlüsselungsmodule
├── logs/                   # Verschlüsselte Audit-Logs
├── scripts/                # Setup- und Utility-Skripte
├── data/                   # Datenverzeichnis
└── backups/                # Backup-Verzeichnis
```

## 🔒 Sicherheitsfeatures

- **AES-256 Verschlüsselung** für alle gespeicherten Daten
- **TLS 1.3** für lokale API-Kommunikation
- **Umfassende Audit-Logs** für alle Systemaktivitäten
- **Content Security Policy** für Frontend-Sicherheit
- **Process Isolation** zwischen Modulen
- **Automatische Schlüsselrotation**

## ✨ Frontend Features

### Next.js Modern Frontend (creative-muse-modern) 🚀
- **Next.js 15 + React 19**: Neueste Web-Technologien
- **Turbopack**: Ultraschnelle Entwicklung und Builds
- **App Router**: Moderne Next.js Routing-Architektur
- **Server Components**: Optimierte Performance
- **Tailwind CSS 4**: Modernste CSS-Framework-Version
- **Radix UI**: Barrierefreie UI-Komponenten
- **Framer Motion 12**: Flüssige Animationen und Übergänge
- **TypeScript 5**: Vollständige Typsicherheit
- **Mehrsprachigkeit**: Deutsch/Englisch/Italienisch Support
- **Dark/Light Mode**: Intelligenter Theme-Wechsel
- **Responsive Design**: Optimiert für alle Geräte
- **Export-Funktionen**: JSON/Markdown Export
- **LocalStorage**: Automatische Datenpersistierung

### Legacy React Frontend (creative-muse-react)
- **Vite + React**: Schnelle Entwicklungsumgebung
- **Glasmorphismus Design**: Moderne UI mit Tailwind CSS
- **PWA-Ready**: Progressive Web App Features
- **Real-time Updates**: Live-Aktualisierung der Ideen

### Legacy Electron Frontend (ui_frontend)
- **Desktop-App**: Native Desktop-Anwendung
- **Sicherheit**: Isolierte Prozesse
- **Cross-Platform**: Windows, macOS, Linux

## 📖 Dokumentation

- [Frontend Features Übersicht](FRONTEND_FEATURES.md)
- [Next.js Frontend Dokumentation](docs/REACT_FRONTEND.md)
- [Mehrsprachigkeits-Support](MULTILINGUAL_SUPPORT.md)
- [Sicherheitsdokumentation](SECURITY_SETUP.md)
- [API-Dokumentation](docs/API.md)
- [Entwicklungshandbuch](docs/DEVELOPMENT.md)
- [Deployment-Anleitung](docs/DEPLOYMENT.md)
- [DevContainer Setup](DEVCONTAINER.md)

## 🛠️ Entwicklung

### Next.js Frontend Entwicklung
```bash
# Entwicklungsserver mit Turbopack starten
cd creative-muse-modern
npm run dev

# Production Build erstellen
npm run build
npm run start

# Code-Qualität prüfen
npm run lint
```

### Backend Entwicklung
```bash
# Entwicklungsumgebung starten
make dev-secure

# Sicherheitstests ausführen
make test-security

# Compliance-Check durchführen
make compliance-check

# Backup erstellen
make backup
```

### DevContainer Setup
```bash
# DevContainer verwenden (empfohlen)
# Siehe DEVCONTAINER.md für Details
code .  # Öffnet automatisch DevContainer-Prompt
```

## 📊 Systemanforderungen

### Minimum
- CPU: 4 Kerne, 2.5 GHz
- RAM: 16GB
- Speicher: 20GB frei
- OS: Windows 10+, macOS 10.15+, Ubuntu 20.04+

### Empfohlen
- CPU: 8 Kerne, 3.0 GHz
- RAM: 32GB
- Speicher: 50GB frei (SSD)
- GPU: NVIDIA RTX 3060+ (optional, für bessere Performance)

## 🔧 Konfiguration

Die Anwendung kann über verschiedene Konfigurationsdateien angepasst werden:

- [`security-config.yaml`](security-config.yaml) - Globale Sicherheitseinstellungen
- [`ai_core/config.py`](ai_core/config.py) - Backend-Konfiguration
- [`creative-muse-modern/next.config.ts`](creative-muse-modern/next.config.ts) - Next.js Konfiguration
- [`creative-muse-modern/tailwind.config.js`](creative-muse-modern/tailwind.config.js) - Design-Konfiguration
- [`creative-muse-modern/tsconfig.json`](creative-muse-modern/tsconfig.json) - TypeScript-Konfiguration
- [`creative-muse-react/vite.config.ts`](creative-muse-react/vite.config.ts) - Legacy React Frontend

## 🆘 Support

Bei Problemen oder Fragen:

1. Überprüfen Sie die [Dokumentation](docs/)
2. Führen Sie einen Sicherheitsaudit durch: `make security-audit`
3. Überprüfen Sie die Logs in [`logs/`](logs/)
4. Erstellen Sie ein Issue mit detaillierten Informationen

## 📄 Lizenz

[Lizenz hier einfügen]

## 🙏 Mitwirkende

[Mitwirkende hier auflisten]