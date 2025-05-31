# 🚀 Backend Start Guide für DevContainer

## Problem: "Backend nicht erreichbar"

### Schritt-für-Schritt Anleitung

#### 1. DevContainer Terminal öffnen
```bash
# In VS Code:
# Ctrl+Shift+` (neues Terminal öffnen)
# Oder: Terminal → New Terminal
```

#### 2. Backend starten
```bash
# Einfacher Befehl:
start-backend

# Oder manuell:
cd /workspace
python ai_core/main_simple.py
```

#### 3. Erfolgreiche Ausgabe prüfen
Das Backend läuft korrekt wenn Sie sehen:
```
INFO:     Started server process [123]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

#### 4. Backend-Status testen
```bash
# In einem neuen Terminal (Ctrl+Shift+`):
curl http://localhost:8000/health

# Erwartete Antwort:
# {"message":"Creative Muse AI Backend","version":"1.0.0","status":"running"}
```

#### 5. Frontend starten
```bash
# In einem weiteren neuen Terminal:
start-frontend

# Oder manuell:
cd /workspace/ui_frontend
live-server --port=3000 --host=0.0.0.0
```

#### 6. System testen
- Backend: http://localhost:8000/health
- Frontend: http://localhost:3000
- API-Test: http://localhost:8000/api/v1/stats

### 🔧 Häufige Probleme

#### Problem: "start-backend" Befehl nicht gefunden
**Lösung:**
```bash
# Aliases neu laden:
source ~/.bashrc

# Oder manuell starten:
cd /workspace && python ai_core/main_simple.py
```

#### Problem: Port 8000 bereits belegt
**Lösung:**
```bash
# Prozess finden und beenden:
lsof -ti:8000 | xargs kill -9

# Dann Backend neu starten:
start-backend
```

#### Problem: Python-Module nicht gefunden
**Lösung:**
```bash
# Dependencies neu installieren:
cd /workspace
pip install -r ai_core/requirements.txt

# Dann Backend starten:
python ai_core/main_simple.py
```

#### Problem: Database-Fehler ("database not_found")
**Lösung:**
```bash
# Database initialisieren:
init-database

# Oder manuell:
bash /workspace/.devcontainer/init-database.sh

# Backend neu starten:
start-backend
```

### 🎯 Automatischer Start (Optional)

#### VS Code Task verwenden:
1. `Ctrl+Shift+P`
2. "Tasks: Run Task"
3. "Start Backend Server" wählen

#### Oder Launch-Konfiguration:
1. `F5` drücken
2. "Creative Muse AI Backend" wählen

### 📋 Debugging

#### Backend-Logs anzeigen:
```bash
# Backend mit Debug-Output starten:
cd /workspace
DEBUG=true python ai_core/main_simple.py
```

#### Netzwerk-Status prüfen:
```bash
# Alle offenen Ports anzeigen:
netstat -tlnp

# Spezifisch Port 8000:
netstat -tlnp | grep :8000

# Container-IP ermitteln:
hostname -I
```

#### Python-Umgebung prüfen:
```bash
# Python-Version:
python --version

# Installierte Pakete:
pip list

# PYTHONPATH prüfen:
echo $PYTHONPATH
```

### ✅ Erfolgreiche Konfiguration

**Backend läuft korrekt wenn:**
- Terminal zeigt: "Uvicorn running on http://0.0.0.0:8000"
- `curl http://localhost:8000/health` gibt JSON zurück
- Keine Fehlermeldungen im Terminal

**Frontend verbindet sich korrekt wenn:**
- http://localhost:3000 öffnet die Anwendung
- Browser-Console zeigt: "Using API Base: http://localhost:8000/api/v1"
- Ideengenerierung funktioniert ohne "Failed to fetch"

### 🆘 Wenn nichts hilft

#### Kompletter Neustart:
```bash
# Alle Terminals schließen (Ctrl+C in jedem Terminal)
# Container neu starten:
# Ctrl+Shift+P → "Dev Containers: Rebuild Container"
```

#### Manuelle Diagnose:
```bash
# Python-Pfad prüfen:
which python
python -c "import sys; print(sys.path)"

# FastAPI installiert?
python -c "import fastapi; print('FastAPI OK')"

# Arbeitsverzeichnis prüfen:
pwd
ls -la ai_core/
```

#### Fallback - Lokale Entwicklung:
```bash
# Außerhalb des DevContainers:
cd ai_core
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main_simple.py
```

Das Backend sollte jetzt erfolgreich starten! 🎉

### 📞 Weitere Hilfe

Falls das Backend immer noch nicht startet:
1. Überprüfen Sie die Terminal-Ausgabe auf Fehlermeldungen
2. Stellen Sie sicher, dass Sie im DevContainer sind (nicht lokal)
3. Prüfen Sie, ob alle Dependencies installiert sind
4. Kontrollieren Sie die Python-Version (sollte 3.11 sein)