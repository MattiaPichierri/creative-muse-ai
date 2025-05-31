# DevContainer Troubleshooting

## Häufige Probleme und Lösungen

### ❌ Problem: "requirements.txt not found"
**Fehlermeldung:**
```
failed to compute cache key: "/ai_core/requirements.txt": not found
```

**Ursache:** 
Der Docker Build-Context war falsch konfiguriert.

**Lösung:**
- Build-Context in `docker-compose.yml` auf `..` (Parent-Directory) gesetzt
- Dockerfile-Pfad auf `.devcontainer/Dockerfile` angepasst
- COPY-Pfad von `../ai_core/requirements.txt` zu `ai_core/requirements.txt` korrigiert

### ✅ Korrekte Konfiguration:

**docker-compose.yml:**
```yaml
creative-muse-ai:
  build:
    context: ..              # Build von Parent-Directory
    dockerfile: .devcontainer/Dockerfile
```

**Dockerfile:**
```dockerfile
COPY ai_core/requirements.txt /tmp/requirements.txt
```

### 🔧 Weitere häufige Probleme:

**Port bereits belegt:**
```
Error: Ports are not available: exposing port TCP 0.0.0.0:5000 -> 127.0.0.1:0: listen tcp 0.0.0.0:5000: bind: address already in use
```

**Lösung:**
- Port 5000 auf 5001 geändert (macOS AirPlay verwendet Port 5000)
- Alternativ: Prozess auf Port finden und beenden:
```bash
lsof -ti:5000 | xargs kill -9  # Für Port 5000
lsof -ti:8000 | xargs kill -9  # Für Port 8000
```

**Container neu bauen:**
- `Ctrl+Shift+P` → "Dev Containers: Rebuild Container"
- Oder: "Rebuild Container Without Cache" für kompletten Neuaufbau

**Docker Desktop Probleme:**
- Docker Desktop neu starten
- Genügend Speicherplatz sicherstellen (min. 4GB frei)
- Docker Desktop auf neueste Version aktualisieren

**VS Code Extension Probleme:**
- Dev Containers Extension neu installieren
- VS Code neu starten
- Extension-Cache löschen

### 📋 Debugging-Schritte:

1. **Docker Desktop Status prüfen:**
   ```bash
   docker --version
   docker ps
   ```

2. **Build-Logs anzeigen:**
   ```bash
   docker compose -f .devcontainer/docker-compose.yml build --no-cache
   ```

3. **Container manuell starten:**
   ```bash
   docker compose -f .devcontainer/docker-compose.yml up
   ```

4. **Container-Shell öffnen:**
   ```bash
   docker compose -f .devcontainer/docker-compose.yml exec creative-muse-ai bash
   ```

### 🆘 Support:

Bei weiteren Problemen:
1. VS Code Developer Tools öffnen (`Help` → `Toggle Developer Tools`)
2. Console-Logs überprüfen
3. DevContainer-Logs in VS Code Output-Panel anzeigen
4. GitHub Issues für spezifische Probleme erstellen

### 📚 Nützliche Links:

- [VS Code DevContainers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [DevContainer Features](https://containers.dev/features)