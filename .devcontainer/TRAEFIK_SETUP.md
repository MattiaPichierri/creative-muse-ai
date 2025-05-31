# 🌐 Traefik Setup für Creative Muse AI DevContainer

## Übersicht

Traefik fungiert als Reverse Proxy und ermöglicht den Zugriff auf die Creative Muse AI Services über benutzerfreundliche Domains anstatt Ports.

## 🎯 Verfügbare Domains

Nach dem Setup sind folgende Domains verfügbar:

- **🌐 Frontend:** http://creative-muse.local
- **🔌 Backend API:** http://api.creative-muse.local
- **⚙️ Services:** http://services.creative-muse.local
- **📊 Traefik Dashboard:** http://traefik.creative-muse.local

## 🚀 Setup-Anleitung

### Schritt 1: Hosts-Datei konfigurieren (EINMALIG)

**Automatisch (empfohlen):**
```bash
# Außerhalb des DevContainers ausführen:
bash .devcontainer/setup-hosts.sh
```

**Manuell:**
Fügen Sie folgende Zeilen zu Ihrer `/etc/hosts` Datei hinzu:
```
127.0.0.1 creative-muse.local
127.0.0.1 api.creative-muse.local
127.0.0.1 services.creative-muse.local
127.0.0.1 traefik.creative-muse.local
```

### Schritt 2: DevContainer starten

```bash
# VS Code:
# Ctrl+Shift+P → "Dev Containers: Reopen in Container"
```

### Schritt 3: Services starten

```bash
# Im DevContainer:
# Terminal 1: Database initialisieren (falls nötig)
init-database

# Terminal 2: Backend starten
start-backend

# Terminal 3: Frontend starten
start-frontend
```

### Schritt 4: Traefik-Status prüfen

```bash
# Traefik-Container Status
traefik-status

# Alle Container anzeigen
docker ps
```

## 🔧 Traefik-Konfiguration

### Automatische Service-Erkennung

Traefik erkennt Services automatisch über Docker-Labels:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.frontend.rule=Host(`creative-muse.local`)"
  - "traefik.http.routers.frontend.service=frontend"
  - "traefik.http.services.frontend.loadbalancer.server.port=3000"
```

### Port-Mapping

| Service | Container Port | Traefik Domain |
|---------|---------------|----------------|
| Frontend | 3000 | creative-muse.local |
| Backend | 8000 | api.creative-muse.local |
| Services | 5000 | services.creative-muse.local |
| Traefik Dashboard | 8080 | traefik.creative-muse.local |

## 🧪 Testing

### Frontend testen:
```bash
curl http://creative-muse.local
# Sollte HTML-Inhalt zurückgeben
```

### Backend API testen:
```bash
curl http://api.creative-muse.local/health
# Sollte JSON-Response zurückgeben
```

### Traefik Dashboard:
```bash
open http://traefik.creative-muse.local
# Öffnet das Traefik Dashboard im Browser
```

## 🔍 Debugging

### Traefik-Logs anzeigen:
```bash
docker logs creative-muse-traefik
```

### Service-Discovery prüfen:
```bash
# Traefik Dashboard öffnen
open http://traefik.creative-muse.local

# Unter "HTTP Routers" sollten alle Services sichtbar sein
```

### Container-Netzwerk prüfen:
```bash
docker network ls
docker network inspect devcontainer_creative-muse-network
```

### DNS-Auflösung testen:
```bash
# Auf dem Host-System:
nslookup creative-muse.local
ping creative-muse.local
```

## 🔧 Häufige Probleme

### Problem: Domain nicht erreichbar
**Lösung:**
1. Hosts-Datei prüfen: `cat /etc/hosts | grep creative-muse`
2. Traefik-Container läuft: `docker ps | grep traefik`
3. DNS-Cache leeren: `sudo dscacheutil -flushcache` (macOS)

### Problem: Traefik startet nicht
**Lösung:**
```bash
# Port 80/443 prüfen
lsof -i :80
lsof -i :443

# Andere Services stoppen die diese Ports verwenden
sudo nginx -s stop  # Falls Nginx läuft
```

### Problem: Services nicht im Dashboard sichtbar
**Lösung:**
1. Container-Labels prüfen: `docker inspect <container-name>`
2. Netzwerk-Verbindung prüfen: `docker network inspect creativemuseai_devcontainer_creative-muse-network`
3. Traefik neu starten: `restart-traefik`

### Problem: Netzwerk-Warnungen in Traefik-Logs
**Symptom:**
```
Could not find network named "creative-muse-network"
```
**Lösung:** ✅ Bereits behoben - Netzwerk-Name in traefik.yml korrigiert
```bash
# Traefik mit korrigierter Konfiguration neu starten:
restart-traefik
```

## 🎨 Erweiterte Konfiguration

### HTTPS aktivieren (Optional):
```yaml
# In traefik.yml:
certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@domain.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
```

### Load Balancing (für mehrere Instanzen):
```yaml
labels:
  - "traefik.http.services.backend.loadbalancer.server.port=8000"
  - "traefik.http.services.backend.loadbalancer.healthcheck.path=/health"
```

### Middleware hinzufügen:
```yaml
labels:
  - "traefik.http.middlewares.auth.basicauth.users=admin:$$2y$$10$$..."
  - "traefik.http.routers.backend.middlewares=auth"
```

## 🧹 Cleanup

### Hosts-Einträge entfernen:
```bash
sudo sed -i '/# Creative Muse AI DevContainer/,/# End Creative Muse AI DevContainer/d' /etc/hosts
```

### Traefik-Container stoppen:
```bash
docker compose -f .devcontainer/docker-compose.yml down
```

### Volumes löschen:
```bash
docker volume rm devcontainer_traefik-certificates
```

## 📚 Weitere Ressourcen

- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Docker Labels Reference](https://doc.traefik.io/traefik/routing/providers/docker/)
- [Traefik Dashboard](https://doc.traefik.io/traefik/operations/dashboard/)

## ✅ Erfolgreiche Konfiguration

Wenn alles korrekt funktioniert:
- ✅ http://creative-muse.local zeigt die Frontend-Anwendung
- ✅ http://api.creative-muse.local/health gibt JSON zurück
- ✅ http://traefik.creative-muse.local zeigt das Dashboard
- ✅ Alle Services sind im Traefik Dashboard sichtbar
- ✅ Ideengenerierung funktioniert über die Domain

Happy Domain-based Development! 🎉