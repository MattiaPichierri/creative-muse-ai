# Creative Muse AI - Multi-Model Support

Das Creative Muse System unterstützt jetzt mehrere AI-Modelle gleichzeitig und ermöglicht dynamisches Wechseln zwischen verschiedenen Modellen.

## 🚀 Features

### ✅ Implementiert

- **Model Manager**: Zentrale Verwaltung aller AI-Modelle
- **Dynamisches Model-Switching**: Wechseln zwischen Modellen zur Laufzeit
- **Multi-Model Backend**: `main_multi_model.py` mit erweiterten APIs
- **Frontend Model-Selector**: UI-Komponente zur Modell-Auswahl
- **Model-spezifische Konfiguration**: Individuelle Parameter pro Modell
- **Speicher-Management**: Automatisches Laden/Entladen von Modellen
- **Model-Status-Tracking**: Überwachung des Modell-Status
- **Download-Script**: Automatisierter Model-Download

### 🔧 Architektur

```
ai_core/
├── model_manager.py          # Zentrale Model-Verwaltung
├── main_multi_model.py       # Multi-Model Backend
├── main_llm.py              # Single-Model Backend (Legacy)
└── requirements.txt         # Erweiterte Dependencies

creative-muse-modern/
├── src/lib/api.ts           # Erweiterte API-Schnittstelle
├── src/components/
│   └── ModelSelector.tsx    # Model-Auswahl UI
└── src/app/
    ├── page.tsx            # Hauptseite mit Model-Support
    └── stats/page.tsx      # Statistiken mit Model-Info

scripts/
├── download_models.py       # Model-Download Script
└── README_MODELS.md        # Model-Management Guide
```

## 🤖 Unterstützte Modelle

### Empfohlene Modelle

| Modell | Größe | Token | Beschreibung |
|--------|-------|-------|-------------|
| **Mistral-7B-Instruct-v0.3** | 14.5GB | ✅ | Hauptmodell für Creative Muse |
| Mistral-7B-Instruct-v0.2 | 14.5GB | ✅ | Alternative Mistral Version |

### Test-Modelle

| Modell | Größe | Token | Beschreibung |
|--------|-------|-------|-------------|
| Microsoft DialoGPT-Medium | 1.5GB | ❌ | Freies Modell für Tests |
| Microsoft DialoGPT-Large | 3GB | ❌ | Größeres freies Modell |

## 🔧 Setup & Verwendung

### 1. Backend starten

```bash
# Multi-Model Backend
cd ai_core
python main_multi_model.py

# Oder Legacy Single-Model
python main_llm.py
```

### 2. Modelle herunterladen

```bash
# Empfohlenes Modell
python scripts/download_models.py --download mistral-7b-instruct-v0.3

# Alle empfohlenen Modelle
python scripts/download_models.py --download-all

# Verfügbare Modelle anzeigen
python scripts/download_models.py --list
```

### 3. Frontend starten

```bash
cd creative-muse-modern
npm run dev
```

## 📡 API-Endpunkte

### Model-Management

```http
GET /api/v1/models
# Hole alle verfügbaren Modelle

POST /api/v1/models/switch
# Wechsle zu anderem Modell
{
  "model_key": "mistral-7b-instruct-v0.3"
}
```

### Idea-Generation

```http
POST /api/v1/generate
# Generiere Idee mit spezifischem Modell
{
  "prompt": "Innovative Startup-Idee",
  "category": "business",
  "creativity_level": 8,
  "language": "de",
  "model": "mistral-7b-instruct-v0.3",
  "max_tokens": 512,
  "temperature": 0.8
}

POST /api/v1/random
# Zufällige Idee mit Modell-Auswahl
{
  "category": "technology",
  "language": "en",
  "model": "mistral-7b-instruct-v0.3"
}
```

### Statistiken

```http
GET /api/v1/stats
# Erweiterte Statistiken mit Model-Info
{
  "total_ideas": 42,
  "categories": {...},
  "model_stats": {
    "total_models": 4,
    "available_models": 2,
    "loaded_models": 1,
    "current_model": "mistral-7b-instruct-v0.3",
    "model_status": {...},
    "memory_usage": {...}
  }
}
```

## 🎯 Frontend-Features

### Model-Selector Komponente

- **Modell-Übersicht**: Alle verfügbaren und nicht verfügbare Modelle
- **Status-Anzeige**: Aktueller Status jedes Modells
- **Ein-Klick-Wechsel**: Einfaches Wechseln zwischen Modellen
- **Download-Hinweise**: Anweisungen für fehlende Modelle
- **Empfehlungen**: Hervorhebung empfohlener Modelle

### Erweiterte Ideen-Anzeige

- **Model-Badge**: Zeigt verwendetes Modell pro Idee
- **Generation-Method**: Unterscheidung zwischen Modell-Typen
- **Performance-Tracking**: Modell-spezifische Statistiken

## ⚙️ Konfiguration

### Model-Konfiguration

```python
# model_manager.py
ModelConfig(
    key="mistral-7b-instruct-v0.3",
    name="mistralai/Mistral-7B-Instruct-v0.3",
    model_path="mistral-7b-instruct-v0.3",
    description="Mistral 7B Instruct v0.3 - Hauptmodell",
    size_gb=14.5,
    requires_token=True,
    recommended=True,
    max_tokens=512,
    temperature=0.7,
    top_p=0.9,
    device_preference="auto"
)
```

### Umgebungsvariablen

```bash
# .env
HF_TOKEN=your_huggingface_token
MODEL_CACHE_DIR=./models
API_HOST=localhost
API_PORT=8000
```

## 🔄 Model-Switching Workflow

1. **Frontend**: Benutzer wählt Modell im ModelSelector
2. **API-Call**: `POST /api/v1/models/switch`
3. **Backend**: ModelManager lädt neues Modell
4. **Memory-Management**: Altes Modell optional entladen
5. **Status-Update**: Frontend erhält neuen Status
6. **Idea-Generation**: Neue Ideen verwenden gewähltes Modell

## 📊 Performance & Memory

### Speicher-Optimierung

- **Lazy Loading**: Modelle werden nur bei Bedarf geladen
- **Memory Cleanup**: Automatisches Entladen nicht verwendeter Modelle
- **Device Management**: Intelligente CPU/GPU-Zuweisung
- **Cache Control**: Optimierte Speicher-Nutzung

### Monitoring

- **Model Status**: Echtzeit-Status aller Modelle
- **Memory Usage**: CPU/GPU-Speicher-Überwachung
- **Performance Metrics**: Generierungs-Geschwindigkeit
- **Error Tracking**: Modell-spezifische Fehlerbehandlung

## 🚨 Troubleshooting

### Häufige Probleme

**Modell lädt nicht**
```bash
# Prüfe HF_TOKEN
echo $HF_TOKEN

# Teste Model-Download
python scripts/download_models.py --test mistral-7b-instruct-v0.3
```

**Out of Memory**
```python
# Reduziere max_memory in model_manager.py
max_memory={"cpu": "4GB"}  # Statt 6GB

# Oder verwende kleineres Modell
python scripts/download_models.py --download microsoft-dialoGPT-medium
```

**Model Switch fehlgeschlagen**
```bash
# Prüfe Backend-Logs
tail -f logs/backend.log

# Restart Backend
pkill -f main_multi_model.py
python main_multi_model.py
```

## 🔮 Roadmap

### Geplante Features

- [ ] **Model-Ensembles**: Kombiniere mehrere Modelle
- [ ] **A/B Testing**: Vergleiche Modell-Performance
- [ ] **Custom Models**: Support für eigene Fine-tuned Modelle
- [ ] **Model Metrics**: Detaillierte Performance-Metriken
- [ ] **Auto-Scaling**: Automatisches Model-Management
- [ ] **Distributed Models**: Multi-Server Model-Hosting

### Verbesserungen

- [ ] **Streaming Generation**: Echtzeit-Text-Streaming
- [ ] **Batch Processing**: Mehrere Ideen gleichzeitig
- [ ] **Model Preloading**: Intelligentes Vorladen
- [ ] **Quality Scoring**: Automatische Ideen-Bewertung
- [ ] **Context Awareness**: Modell-spezifische Prompts

## 📚 Weitere Dokumentation

- [`scripts/README_MODELS.md`](../scripts/README_MODELS.md) - Model Download Guide
- [`docs/DEPLOYMENT.md`](DEPLOYMENT.md) - Deployment-Anleitung
- [`docs/NEXTJS_FRONTEND.md`](NEXTJS_FRONTEND.md) - Frontend-Dokumentation
- [`README.md`](../README.md) - Haupt-Dokumentation

## 🤝 Beitragen

Neue Modelle hinzufügen:

1. Erweitere `AVAILABLE_MODELS` in `download_models.py`
2. Füge `ModelConfig` in `model_manager.py` hinzu
3. Teste Download und Integration
4. Aktualisiere Dokumentation
5. Erstelle Pull Request

Das Multi-Model-System macht Creative Muse flexibler und leistungsfähiger! 🚀