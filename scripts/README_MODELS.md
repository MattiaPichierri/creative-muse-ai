# Creative Muse AI - Model Download Guide

Dieses Verzeichnis enthält Scripts zum Download und Management von AI-Modellen für Creative Muse.

## 🚀 Schnellstart

### 1. Verfügbare Modelle anzeigen
```bash
python scripts/download_models.py --list
```

### 2. Empfohlenes Modell herunterladen
```bash
python scripts/download_models.py --download mistral-7b-instruct-v0.3
```

### 3. Alle empfohlenen Modelle herunterladen
```bash
python scripts/download_models.py --download-all
```

### 4. Heruntergeladene Modelle anzeigen
```bash
python scripts/download_models.py --downloaded
```

## 📋 Verfügbare Kommandos

| Kommando | Beschreibung |
|----------|-------------|
| `--list` | Zeigt alle verfügbaren Modelle |
| `--downloaded` | Zeigt heruntergeladene Modelle |
| `--download <model>` | Lädt spezifisches Modell herunter |
| `--download-all` | Lädt alle empfohlenen Modelle |
| `--force` | Erzwingt erneuten Download |
| `--test <model>` | Testet ein heruntergeladenes Modell |

## 🔑 Hugging Face Token Setup

Für Mistral-Modelle benötigen Sie einen Hugging Face Token:

1. Erstellen Sie einen Account auf [Hugging Face](https://huggingface.co)
2. Gehen Sie zu [Settings > Access Tokens](https://huggingface.co/settings/tokens)
3. Erstellen Sie einen neuen Token mit "Read" Berechtigung
4. Fügen Sie den Token zur `.env` Datei hinzu:
   ```
   HF_TOKEN=your_token_here
   ```

## 📦 Verfügbare Modelle

### ⭐ Empfohlen: Mistral-7B-Instruct-v0.3
- **Größe:** ~14.5GB
- **Beschreibung:** Hauptmodell für Creative Muse
- **Voraussetzungen:** HF_TOKEN erforderlich
- **Download:** `python scripts/download_models.py --download mistral-7b-instruct-v0.3`

### Alternative Modelle

#### Mistral-7B-Instruct-v0.2
- **Größe:** ~14.5GB
- **Beschreibung:** Alternative Mistral Version
- **Voraussetzungen:** HF_TOKEN erforderlich

#### Microsoft DialoGPT-Medium
- **Größe:** ~1.5GB
- **Beschreibung:** Freies Modell für Tests
- **Voraussetzungen:** Keine

#### Microsoft DialoGPT-Large
- **Größe:** ~3GB
- **Beschreibung:** Größeres freies Modell
- **Voraussetzungen:** Keine

## 📁 Model Cache Verzeichnis

Modelle werden standardmäßig in `./models/` gespeichert. Sie können das Verzeichnis über die Umgebungsvariable `MODEL_CACHE_DIR` ändern:

```bash
export MODEL_CACHE_DIR=/path/to/your/models
```

## 🧪 Modell testen

Nach dem Download können Sie ein Modell testen:

```bash
python scripts/download_models.py --test mistral-7b-instruct-v0.3
```

## 🔄 Modell erneut herunterladen

Falls ein Download unterbrochen wurde oder Sie das Modell aktualisieren möchten:

```bash
python scripts/download_models.py --download mistral-7b-instruct-v0.3 --force
```

## 📊 Speicherplatz-Anforderungen

| Modell | Speicherplatz | RAM (Minimum) | RAM (Empfohlen) |
|--------|---------------|---------------|-----------------|
| Mistral-7B-Instruct-v0.3 | 14.5GB | 8GB | 16GB+ |
| Mistral-7B-Instruct-v0.2 | 14.5GB | 8GB | 16GB+ |
| DialoGPT-Medium | 1.5GB | 4GB | 8GB |
| DialoGPT-Large | 3GB | 6GB | 12GB |

## 🚨 Troubleshooting

### Fehler: "HF_TOKEN nicht gefunden"
- Stellen Sie sicher, dass die `.env` Datei existiert
- Überprüfen Sie, dass `HF_TOKEN=your_token_here` in der `.env` Datei steht
- Verwenden Sie einen gültigen Hugging Face Token

### Fehler: "Cannot instantiate tokenizer"
- Installieren Sie fehlende Abhängigkeiten:
  ```bash
  pip install sentencepiece protobuf
  ```

### Fehler: "Out of memory"
- Schließen Sie andere Anwendungen
- Verwenden Sie ein kleineres Modell für Tests
- Erhöhen Sie den verfügbaren Speicher

### Download unterbrochen
- Verwenden Sie `--force` um den Download fortzusetzen
- Überprüfen Sie Ihre Internetverbindung

## 🔧 Integration mit Creative Muse

Nach dem Download wird das Modell automatisch von Creative Muse erkannt. Starten Sie das Backend:

```bash
cd ai_core
python main_llm.py
```

Das System erkennt automatisch verfügbare Modelle und verwendet das beste verfügbare Modell.

## 📝 Logs und Debugging

Das Script verwendet Python Logging. Für detaillierte Ausgaben:

```bash
export LOG_LEVEL=DEBUG
python scripts/download_models.py --download mistral-7b-instruct-v0.3
```

## 🤝 Support

Bei Problemen:
1. Überprüfen Sie die Logs
2. Stellen Sie sicher, dass alle Abhängigkeiten installiert sind
3. Überprüfen Sie Ihren HF_TOKEN
4. Testen Sie mit einem kleineren Modell zuerst