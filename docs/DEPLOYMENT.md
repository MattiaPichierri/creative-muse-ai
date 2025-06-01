# Creative Muse AI - Deployment Guide

## 🚀 Deployment Optionen

### 1. Lokale Entwicklung

```bash
# Schnellstart
make setup
make dev-secure

# Oder manuell
make install-deps
make init-secure-db
make start-backend
make start-react
```

### 2. Docker Deployment

#### Voraussetzungen
- Docker & Docker Compose installiert
- `.env` Datei konfiguriert
- HF_TOKEN gesetzt

#### Schnelles Deployment
```bash
# Automatisches Deployment
make deploy

# Oder manuell
make docker-build
make docker-up
```

#### Production Deployment
```bash
# Production Environment laden
make deploy-production

# Oder manuell
cp .env.production .env
make docker-build
make docker-up
```

### 3. Manuelle Installation

#### Backend Setup
```bash
cd ai_core
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-security.txt

# Environment konfigurieren
cp .env.example .env
# HF_TOKEN und andere Variablen setzen

# Datenbank initialisieren
python ../database/init_db.py

# Server starten
python main_mistral_api.py
```

#### Frontend Setup
```bash
cd creative-muse-react
npm install

# Environment konfigurieren
cp .env.example .env

# Development Server
npm run dev

# Production Build
npm run build
npm run preview
```

## 🔧 Konfiguration

### Environment Variablen

#### Backend (.env)
```bash
# Erforderlich
HF_TOKEN=your_huggingface_token_here
MASTER_KEY_PASSWORD=your_secure_password

# Optional
DEBUG=false
API_HOST=127.0.0.1
API_PORT=8000
DATABASE_URL=sqlite:///./database/creative_muse.db
```

#### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Creative Muse AI
VITE_PWA_ENABLED=true
```

### SSL/TLS Konfiguration

```bash
# Zertifikate generieren
make generate-keys

# Oder manuell
openssl req -x509 -newkey rsa:4096 -keyout security/certificates/server.key \
  -out security/certificates/server.crt -days 365 -nodes
```

## 🐳 Docker Konfiguration

### docker-compose.yml
Das Projekt enthält eine vollständige Docker Compose Konfiguration mit:
- Backend API Container
- Frontend Container  
- Nginx Reverse Proxy
- Automatische SSL/TLS Terminierung
- Health Checks
- Volume Mounts für Persistenz

### Container Images
- **Backend**: `creative-muse-api`
- **Frontend**: `creative-muse-frontend`
- **Proxy**: `nginx:alpine`

## 🔒 Sicherheit

### Produktions-Checkliste
- [ ] HF_TOKEN gesetzt und sicher
- [ ] MASTER_KEY_PASSWORD geändert
- [ ] SSL/TLS Zertifikate installiert
- [ ] Firewall konfiguriert
- [ ] Backup-System aktiviert
- [ ] Monitoring eingerichtet
- [ ] Log-Rotation konfiguriert

### Sicherheitsfeatures
- Verschlüsselte Datenbank
- TLS 1.3 Verschlüsselung
- Rate Limiting
- Security Headers
- Audit Logging
- Content Security Policy

## 📊 Monitoring

### System Monitoring
```bash
# System Status prüfen
make health-check

# Kontinuierliches Monitoring
make monitor

# Performance Optimierung
make optimize-full
```

### Logs
```bash
# Alle Logs anzeigen
make logs

# Docker Logs
make docker-logs

# Spezifische Logs
tail -f logs/audit/audit.log
tail -f logs/security/security.log
```

## 🔄 Wartung

### Backup & Restore
```bash
# Backup erstellen
make backup

# Automatisches Backup (täglich)
# Konfiguriert in .env: AUTO_BACKUP=true
```

### Updates
```bash
# Dependencies aktualisieren
cd ai_core && pip install -r requirements.txt --upgrade
cd creative-muse-react && npm update

# Docker Images aktualisieren
make docker-build
make docker-up
```

### Performance Optimierung
```bash
# Cache leeren
make optimize

# Vollständige Optimierung
make optimize-full

# Database Optimierung
make update-db
```

## 🚨 Troubleshooting

### Häufige Probleme

#### Backend startet nicht
```bash
# Logs prüfen
tail -f logs/security/app.log

# Dependencies prüfen
cd ai_core && pip check

# Port prüfen
netstat -tulpn | grep 8000
```

#### Frontend Build Fehler
```bash
# Node Modules neu installieren
cd creative-muse-react
rm -rf node_modules package-lock.json
npm install

# TypeScript Fehler prüfen
npm run build
```

#### Docker Probleme
```bash
# Container Status prüfen
docker-compose ps

# Logs anzeigen
docker-compose logs

# Container neu starten
docker-compose restart

# Volumes prüfen
docker volume ls
```

### Performance Probleme
```bash
# System Ressourcen prüfen
make monitor

# Cache leeren
make optimize

# Database optimieren
sqlite3 database/creative_muse.db "VACUUM;"
```

## 📈 Skalierung

### Horizontale Skalierung
- Load Balancer vor Nginx
- Mehrere Backend Instanzen
- Shared Database/Storage
- Container Orchestrierung (Kubernetes)

### Vertikale Skalierung
- Mehr CPU/RAM für Container
- SSD Storage für Database
- Optimierte Docker Images
- Resource Limits anpassen

## 🔗 Nützliche Links

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [HuggingFace Inference API](https://huggingface.co/docs/api-inference/)

## 📞 Support

Bei Problemen:
1. Logs prüfen (`make logs`)
2. Health Check ausführen (`make health-check`)
3. Security Audit durchführen (`make security-audit`)
4. GitHub Issues erstellen