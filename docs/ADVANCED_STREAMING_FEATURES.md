# Creative Muse AI - Erweiterte Streaming Features

Dokumentation für die neuen erweiterten Features: Echtzeit-Text-Streaming, Batch-Processing, intelligentes Vorladen und modell-spezifische Prompts.

## 🚀 Neue Features

### ✅ Implementiert

- **Echtzeit-Text-Streaming**: Server-Sent Events für Live-Updates
- **Batch-Processing**: Mehrere Ideen gleichzeitig generieren
- **Intelligentes Vorladen**: Predictive Model Loading basierend auf Nutzungsstatistiken
- **Modell-spezifische Prompts**: Optimierte Prompts für verschiedene AI-Modelle
- **Parallele Verarbeitung**: Asynchrone Generierung für bessere Performance
- **Erweiterte Statistiken**: Streaming- und Batch-Metriken

## 🔧 Architektur

```
ai_core/
├── main_multi_model.py       # Erweiterte Multi-Model Backend
│   ├── StreamChunk           # Streaming-Datenmodell
│   ├── BatchIdeaRequest      # Batch-Request Modell
│   ├── ModelPreloadRequest   # Vorladen-Request Modell
│   └── erweiterte APIs       # Neue Endpunkte
├── model_manager.py          # Model-Management (unverändert)
└── requirements.txt          # Erweiterte Dependencies (sse-starlette)
```

## 📡 Neue API-Endpunkte

### 1. Echtzeit-Streaming

```http
POST /api/v1/generate/stream
Content-Type: application/json

{
  "prompt": "Innovative Startup-Idee",
  "category": "business",
  "creativity_level": 8,
  "language": "de",
  "model": "mistral-7b-instruct-v0.3"
}
```

**Response**: Server-Sent Events Stream
```
data: {"type": "start", "idea_id": "uuid", "progress": 0.0}

data: {"type": "chunk", "content": "Innovative", "idea_id": "uuid", "progress": 0.2}

data: {"type": "chunk", "content": " Lösung für", "idea_id": "uuid", "progress": 0.4}

data: {"type": "complete", "idea_id": "uuid", "progress": 1.0}
```

### 2. Batch-Processing

```http
POST /api/v1/generate/batch
Content-Type: application/json

{
  "prompts": [
    "KI-gestützte Bildung",
    "Nachhaltige Mobilität",
    "Digitale Gesundheit"
  ],
  "category": "technology",
  "creativity_level": 7,
  "language": "de",
  "models": ["mistral-7b-instruct-v0.3", "microsoft-dialoGPT-medium"],
  "parallel": true
}
```

**Response**:
```json
{
  "ideas": [
    {
      "id": "uuid1",
      "title": "KI-Tutor System",
      "content": "Personalisierte Lernplattform...",
      "category": "technology",
      "model_used": "mistral-7b-instruct-v0.3",
      "generation_time": 2.3
    }
  ],
  "total_count": 3,
  "success_count": 2,
  "failed_count": 1,
  "total_time": 5.7,
  "average_time": 2.85
}
```

### 3. Intelligentes Vorladen

```http
POST /api/v1/models/preload
Content-Type: application/json

{
  "model_keys": [
    "mistral-7b-instruct-v0.3",
    "microsoft-dialoGPT-medium"
  ],
  "priority": "high"
}
```

**Response**:
```json
{
  "message": "Vorladen abgeschlossen",
  "results": [
    {
      "model": "mistral-7b-instruct-v0.3",
      "success": true,
      "status": "loaded"
    }
  ],
  "priority": "high"
}
```

### 4. Modell-Nutzungsstatistiken

```http
GET /api/v1/models/usage-stats
```

**Response**:
```json
{
  "usage_stats": {
    "mistral-7b-instruct-v0.3": {
      "usage_count": 42,
      "total_time": 120.5,
      "average_time": 2.87,
      "last_used": "2025-06-02T12:30:00",
      "priority_score": 8.5
    }
  },
  "intelligent_preload_enabled": true,
  "preload_recommendations": [
    ["mistral-7b-instruct-v0.3", {"priority_score": 8.5}]
  ]
}
```

## 🎯 Modell-spezifische Prompts

Das System verwendet jetzt optimierte Prompts für verschiedene Modelle:

### Mistral-Modelle
```
[INST] Du bist ein kreativer KI-Assistent...

Generiere eine kreative Idee für 'business' basierend auf: 'Startup-Idee'. [/INST]
```

### DialoGPT-Modelle
```
Human: Du bist ein kreativer KI-Assistent...

Generiere eine kreative Idee für 'business' basierend auf: 'Startup-Idee'.
Assistant:
```

### Konfiguration

```python
# Modell-spezifische Anpassungen
model_adaptations = {
    "mistral-7b-instruct-v0.3": {
        "prefix": "[INST] ",
        "suffix": " [/INST]",
        "style": "structured"
    },
    "microsoft-dialoGPT-medium": {
        "prefix": "",
        "suffix": "",
        "style": "conversational"
    }
}
```

## 📊 Erweiterte Statistiken

Die `/api/v1/stats` Endpunkt wurde erweitert:

```json
{
  "total_ideas": 156,
  "categories": {"business": 45, "technology": 67},
  "average_rating": 4.2,
  "recent_activity": 23,
  "model_stats": {
    "total_models": 4,
    "available_models": 2,
    "loaded_models": 1,
    "current_model": "mistral-7b-instruct-v0.3"
  },
  "streaming_stats": {
    "active_sessions": 3,
    "total_streaming_requests": 89,
    "average_streaming_time": 2.1
  },
  "batch_stats": {
    "total_batch_requests": 12,
    "batch_methods": {"model_batch": 8, "parallel_batch": 4},
    "parallel_processing_enabled": true
  }
}
```

## 🔄 Intelligentes Vorladen

### Funktionsweise

1. **Nutzungsstatistiken**: Tracking von Modell-Nutzung und Performance
2. **Prioritätsscore**: Berechnung basierend auf Häufigkeit und Aktualität
3. **Automatisches Vorladen**: Top 2 Modelle werden proaktiv geladen
4. **Speicher-Management**: Intelligente Ressourcen-Optimierung

### Prioritätsscore-Berechnung

```python
time_factor = max(0.1, 1.0 - (now - last_used).total_seconds() / 3600)
priority_score = usage_count * time_factor
```

## 🚀 Performance-Optimierungen

### Parallele Verarbeitung
- **ThreadPoolExecutor**: Bis zu 4 parallele Worker
- **Asyncio**: Asynchrone Batch-Verarbeitung
- **Memory Management**: Intelligente Speicher-Nutzung

### Streaming-Optimierungen
- **Chunk-basiert**: 50-Zeichen Chunks für flüssiges Streaming
- **Delay-Simulation**: 0.1s zwischen Chunks für realistische UX
- **Error Handling**: Robuste Fehlerbehandlung mit Fallbacks

## 🛠️ Setup & Installation

### 1. Dependencies installieren

```bash
cd ai_core
pip install -r requirements.txt
```

### 2. Backend starten

```bash
python main_multi_model.py
```

### 3. Features testen

```bash
# Streaming testen
curl -N -H "Accept: text/event-stream" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test","category":"general"}' \
  http://localhost:8000/api/v1/generate/stream

# Batch-Processing testen
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"prompts":["Idee 1","Idee 2"],"parallel":true}' \
  http://localhost:8000/api/v1/generate/batch
```

## 🔧 Konfiguration

### Umgebungsvariablen

```bash
# .env
HF_TOKEN=your_huggingface_token
MODEL_CACHE_DIR=./models
API_HOST=localhost
API_PORT=8000

# Neue Streaming-Konfiguration
STREAMING_CHUNK_SIZE=50
STREAMING_DELAY=0.1
MAX_PARALLEL_WORKERS=4
PRELOAD_TOP_MODELS=2
```

### Performance-Tuning

```python
# Globale Konfiguration
executor = ThreadPoolExecutor(max_workers=4)
preload_queue = asyncio.Queue()
streaming_sessions = {}
model_usage_stats = {}
```

## 🚨 Troubleshooting

### Streaming-Probleme

```bash
# Prüfe SSE-Support
curl -H "Accept: text/event-stream" http://localhost:8000/api/v1/generate/stream

# Browser-Kompatibilität
# EventSource API wird benötigt
```

### Batch-Processing Fehler

```bash
# Memory-Überwachung
htop

# Reduziere parallele Worker
MAX_PARALLEL_WORKERS=2
```

### Vorladen-Probleme

```bash
# Prüfe Modell-Verfügbarkeit
curl http://localhost:8000/api/v1/models

# Speicher-Status
curl http://localhost:8000/api/v1/models/usage-stats
```

## 🔮 Roadmap

### Geplante Verbesserungen

- [ ] **WebSocket-Streaming**: Bidirektionale Kommunikation
- [ ] **Adaptive Chunk-Größe**: Dynamische Anpassung basierend auf Netzwerk
- [ ] **Model-Ensembles**: Kombinierte Batch-Generierung mit mehreren Modellen
- [ ] **Caching-Layer**: Redis für Prompt-Caching
- [ ] **Load Balancing**: Verteilte Model-Instanzen
- [ ] **Real-time Metrics**: Live-Dashboard für Performance-Monitoring

### Frontend-Integration

- [ ] **React Streaming-Komponente**: Live-Updates in der UI
- [ ] **Batch-Progress-Bar**: Fortschrittsanzeige für Batch-Jobs
- [ ] **Model-Selector**: Erweiterte UI für Modell-Auswahl
- [ ] **Performance-Dashboard**: Echtzeit-Statistiken

## 📚 Weitere Dokumentation

- [`docs/MULTI_MODEL_SUPPORT.md`](MULTI_MODEL_SUPPORT.md) - Multi-Model Basis-Features
- [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) - Deployment-Anleitung
- [`docs/NEXTJS_FRONTEND.md`](NEXTJS_FRONTEND.md) - Frontend-Integration
- [`README.md`](../README.md) - Haupt-Dokumentation

Die erweiterten Streaming-Features machen Creative Muse noch leistungsfähiger und benutzerfreundlicher! 🚀