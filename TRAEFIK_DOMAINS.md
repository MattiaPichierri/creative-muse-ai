# 🌐 Creative Muse AI - Traefik Domain Setup

## Übersicht

Das Creative Muse AI DevContainer unterstützt jetzt professionelle Domain-basierte Entwicklung mit Traefik als Reverse Proxy.

## 🎯 Verfügbare Domains

| Service | Domain | Beschreibung |
|---------|--------|--------------|
| 🌐 **Frontend** | http://creative-muse.local | Hauptanwendung |
| 🔌 **Backend API** | http://api.creative-muse.local | REST API |
| ⚙️ **Services** | http://services.creative-muse.local | Zusätzliche Services |
| 📊 **Traefik Dashboard** | http://traefik.creative-muse.local | Proxy-Verwaltung |

## 🚀 Schnellstart

### 1. Hosts konfigurieren (EINMALIG)
```bash
# Außerhalb des DevContainers:
bash .devcontainer/setup-hosts.sh
```

### 2. DevContainer starten
```bash
# VS Code: Ctrl+Shift+P → "Dev Containers: Reopen in Container"
```

### 3. Services starten
```bash
# Im DevContainer:
init-database    # Falls nötig
start-backend    # Terminal 1
start-frontend   # Terminal 2
```

### 4. Zugriff über Domains
- **Anwendung:** http://creative-muse.local
- **API-Test:** http://api.creative-muse.local/health
- **Dashboard:** http://traefik.creative-muse.local

## 🔧 Verfügbare Befehle

```bash
# Traefik-spezifische Befehle
setup-hosts      # Hosts-Datei konfigurieren
traefik-status   # Traefik-Container Status

# Standard-Befehle
init-database    # Database initialisieren
start-backend    # Backend starten
start-frontend   # Frontend starten
db-shell         # Database Shell
run-tests        # Tests ausführen
check-code       # Code-Qualität prüfen
```

## 🏗️ Architektur

```
┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │   Traefik       │
│                 │────│   Reverse       │
│ creative-muse   │    │   Proxy         │
│ .local          │    │   :80, :443     │
└─────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐
        │  Frontend    │ │   Backend   │ │ Services  │
        │   :3000      │ │    :8000    │ │   :5000   │
        └──────────────┘ └─────────────┘ └───────────┘
```

## 🔍 Debugging

### Traefik-Status prüfen:
```bash
traefik-status
docker logs creative-muse-traefik
```

### Service-Discovery:
- Dashboard: http://traefik.creative-muse.local
- Alle Services sollten unter "HTTP Routers" sichtbar sein

### DNS-Test:
```bash
# Auf Host-System:
ping creative-muse.local
nslookup api.creative-muse.local
```

## 📚 Dokumentation

- **Detailliertes Setup:** [.devcontainer/TRAEFIK_SETUP.md](.devcontainer/TRAEFIK_SETUP.md)
- **Schnellstart:** [DEVCONTAINER_QUICKSTART.md](DEVCONTAINER_QUICKSTART.md)
- **Troubleshooting:** [.devcontainer/TROUBLESHOOTING.md](.devcontainer/TROUBLESHOOTING.md)

## ✅ Vorteile

- **🎯 Professionelle URLs:** Keine Port-Nummern mehr
- **🔄 Automatisches Routing:** Services werden automatisch erkannt
- **📊 Monitoring:** Traefik Dashboard für Übersicht
- **🚀 Skalierbar:** Einfach neue Services hinzufügen
- **🔒 HTTPS-Ready:** SSL-Zertifikate können einfach hinzugefügt werden

## 🧹 Cleanup

```bash
# Hosts-Einträge entfernen:
sudo sed -i '/# Creative Muse AI DevContainer/,/# End Creative Muse AI DevContainer/d' /etc/hosts

# Container stoppen:
docker compose -f .devcontainer/docker-compose.yml down
```

Happy Domain-based Development! 🎉