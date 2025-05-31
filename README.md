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

### Installation

```bash
# Repository klonen
git clone <repository-url>
cd creative_muse_ai

# Vollständiges sicheres Setup
make setup-secure

# Entwicklungsumgebung starten
make dev-secure
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
python scripts/key_generation.py

# 3. Datenbank initialisieren
python database/init_db.py

# 4. Frontend-Abhängigkeiten installieren
cd ../ui_frontend
npm install

# 5. Modell herunterladen
cd ../
python scripts/download_model.py
```

## 🏗️ Architektur

```
creative_muse_ai/
├── ai_core/          # Python Backend (FastAPI + Mistral-7B)
├── ui_frontend/      # Electron Frontend (React)
├── database/         # Verschlüsselte SQLite Datenbank
├── security/         # Sicherheits- und Verschlüsselungsmodule
├── logs/             # Verschlüsselte Audit-Logs
└── scripts/          # Setup- und Utility-Skripte
```

## 🔒 Sicherheitsfeatures

- **AES-256 Verschlüsselung** für alle gespeicherten Daten
- **TLS 1.3** für lokale API-Kommunikation
- **Umfassende Audit-Logs** für alle Systemaktivitäten
- **Content Security Policy** für Frontend-Sicherheit
- **Process Isolation** zwischen Modulen
- **Automatische Schlüsselrotation**

## 📖 Dokumentation

- [Sicherheitsdokumentation](docs/SECURITY.md)
- [Datenschutz-Richtlinien](docs/PRIVACY.md)
- [API-Dokumentation](docs/API.md)
- [Entwicklungshandbuch](docs/DEVELOPMENT.md)
- [Deployment-Anleitung](docs/DEPLOYMENT.md)

## 🛠️ Entwicklung

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
- [`ui_frontend/security-config.json`](ui_frontend/security-config.json) - Frontend-Sicherheit

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