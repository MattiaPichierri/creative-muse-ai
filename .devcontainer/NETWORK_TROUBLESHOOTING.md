# 🌐 DevContainer Netzwerk-Troubleshooting

## Problem: "Failed to fetch" beim API-Aufruf

### Ursachen und Lösungen

#### 1. Backend nicht gestartet
**Symptom:** Frontend lädt, aber API-Aufrufe schlagen fehl
**Lösung:**
```bash
# Im DevContainer Terminal:
start-backend

# Oder manuell:
cd /workspace
python ai_core/main_simple.py
```

#### 2. Falsche API-URL
**Symptom:** "Failed to fetch" oder CORS-Fehler
**Lösung:** ✅ Bereits behoben - automatische URL-Erkennung implementiert

#### 3. Port-Forwarding Probleme
**Überprüfung:**
```bash
# Ports prüfen
curl http://localhost:8000/health

# Erwartete Antwort:
# {"message":"Creative Muse AI Backend","version":"1.0.0","status":"running"}
```

**Falls Port nicht erreichbar:**
- VS Code: Ports-Tab überprüfen (Port 8000 sollte weitergeleitet sein)
- Oder: `Ctrl+Shift+P` → "Ports: Focus on Ports View"

#### 4. CORS-Probleme
**Symptom:** Browser-Console zeigt CORS-Fehler
**Lösung:** Backend bereits mit CORS konfiguriert für:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:8080`

#### 5. Container-Netzwerk-Probleme
**Diagnose:**
```bash
# Im DevContainer:
# Backend-Status prüfen
curl http://localhost:8000/health

# Netzwerk-Konfiguration prüfen
ip addr show

# DNS-Auflösung testen
nslookup localhost
```

### 🔧 Schritt-für-Schritt Debugging

#### Schritt 1: Backend-Status prüfen
```bash
# Terminal 1: Backend starten
start-backend

# Terminal 2: Health-Check
curl http://localhost:8000/health
```

#### Schritt 2: Frontend-Verbindung testen
```bash
# Frontend starten
start-frontend

# Browser öffnen: http://localhost:3000
# Browser-Console öffnen (F12)
# API-URL prüfen: sollte "Using API Base: http://localhost:8000/api/v1" zeigen
```

#### Schritt 3: Netzwerk-Debugging
```bash
# Port-Status prüfen
netstat -tlnp | grep :8000

# Prozesse auf Port 8000
lsof -i :8000

# Container-IP ermitteln
hostname -I
```

### 🚀 Schnelle Lösungen

#### Kompletter Neustart:
```bash
# Backend stoppen (Ctrl+C)
# Frontend stoppen (Ctrl+C)

# Neu starten:
start-backend
# Warten bis "Uvicorn running on http://0.0.0.0:8000"

# Neues Terminal:
start-frontend
```

#### Port-Forwarding neu konfigurieren:
1. VS Code: `Ctrl+Shift+P`
2. "Ports: Focus on Ports View"
3. Port 8000 hinzufügen falls nicht vorhanden
4. Port 3000 hinzufügen falls nicht vorhanden

#### Browser-Cache leeren:
- `Ctrl+Shift+R` (Hard Reload)
- Oder: Browser-Entwicklertools → Network → "Disable cache"

### 📋 Erfolgreiche Konfiguration prüfen

**Backend läuft korrekt wenn:**
```bash
curl http://localhost:8000/health
# Antwort: {"message":"Creative Muse AI Backend",...}

curl http://localhost:8000/api/v1/stats
# Antwort: {"total_ideas":0,"today_generated":0,...}
```

**Frontend läuft korrekt wenn:**
- http://localhost:3000 öffnet die Anwendung
- Browser-Console zeigt: "Using API Base: http://localhost:8000/api/v1"
- Keine CORS-Fehler in der Console

**API-Verbindung funktioniert wenn:**
- Idee-Generierung funktioniert ohne "Failed to fetch"
- Statistiken werden geladen
- Keine Netzwerk-Fehler in Browser-Console

### 🆘 Wenn nichts hilft

#### Container komplett neu starten:
```bash
# VS Code: Ctrl+Shift+P
# "Dev Containers: Rebuild Container Without Cache"
```

#### Manuelle Container-Diagnose:
```bash
# Außerhalb des Containers:
docker ps
docker logs <container-id>
docker exec -it <container-id> bash
```

#### Fallback: Lokale Entwicklung
```bash
# Außerhalb des DevContainers:
cd ai_core
python -m venv venv
source venv/bin/activate  # oder venv\Scripts\activate auf Windows
pip install -r requirements.txt
python main_simple.py

# Neues Terminal:
cd ui_frontend
npx live-server --port=3000
```

Das Netzwerk-Problem sollte jetzt behoben sein! 🎉