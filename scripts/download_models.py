#!/usr/bin/env python3
"""
Creative Muse AI - Model Download Script
Lädt AI-Modelle herunter und bereitet sie für die lokale Verwendung vor
"""

import os
import sys
import logging
from pathlib import Path
from typing import Optional, List
import argparse
from dotenv import load_dotenv

# Transformers für Model Download
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM
    from huggingface_hub import login, snapshot_download
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False
    print("❌ Transformers nicht installiert. Bitte installieren Sie: pip install torch transformers")
    sys.exit(1)

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Verfügbare Modelle
AVAILABLE_MODELS = {
    "mistral-7b-instruct-v0.3": {
        "model_name": "mistralai/Mistral-7B-Instruct-v0.3",
        "description": "Mistral 7B Instruct v0.3 - Hauptmodell für Creative Muse",
        "size": "~14.5GB",
        "requires_token": True,
        "recommended": True
    },
    "mistral-7b-instruct-v0.2": {
        "model_name": "mistralai/Mistral-7B-Instruct-v0.2",
        "description": "Mistral 7B Instruct v0.2 - Alternative Version",
        "size": "~14.5GB",
        "requires_token": True,
        "recommended": False
    },
    "microsoft-dialoGPT-medium": {
        "model_name": "microsoft/DialoGPT-medium",
        "description": "Microsoft DialoGPT Medium - Freies Modell für Tests",
        "size": "~1.5GB",
        "requires_token": False,
        "recommended": False
    },
    "microsoft-dialoGPT-large": {
        "model_name": "microsoft/DialoGPT-large",
        "description": "Microsoft DialoGPT Large - Größeres freies Modell",
        "size": "~3GB",
        "requires_token": False,
        "recommended": False
    }
}


def load_environment():
    """Lade Umgebungsvariablen"""
    # Versuche .env aus verschiedenen Verzeichnissen zu laden
    env_paths = [
        Path(__file__).parent.parent / ".env",  # Hauptverzeichnis
        Path(__file__).parent / ".env",        # scripts Verzeichnis
        Path.cwd() / ".env"                    # Aktuelles Verzeichnis
    ]
    
    for env_path in env_paths:
        if env_path.exists():
            load_dotenv(env_path)
            logger.info(f"✅ Umgebungsvariablen geladen aus: {env_path}")
            return True
    
    logger.warning("⚠️  Keine .env Datei gefunden")
    return False


def setup_huggingface_token() -> Optional[str]:
    """Setup Hugging Face Token"""
    hf_token = os.getenv("HF_TOKEN")
    
    if not hf_token:
        logger.error("❌ HF_TOKEN nicht in Umgebungsvariablen gefunden")
        logger.info("💡 Bitte fügen Sie Ihren Hugging Face Token zur .env Datei hinzu:")
        logger.info("   HF_TOKEN=your_token_here")
        logger.info("🔗 Token erhalten Sie hier: https://huggingface.co/settings/tokens")
        return None
    
    try:
        login(token=hf_token)
        logger.info("✅ Hugging Face Token erfolgreich authentifiziert")
        return hf_token
    except Exception as e:
        logger.error(f"❌ Fehler bei Hugging Face Authentifizierung: {e}")
        return None


def get_model_cache_dir() -> Path:
    """Bestimme Model Cache Verzeichnis"""
    cache_dir = os.getenv("MODEL_CACHE_DIR", "./models")
    cache_path = Path(cache_dir)
    
    # Absoluter Pfad vom Hauptverzeichnis aus
    if not cache_path.is_absolute():
        cache_path = Path(__file__).parent.parent / cache_path
    
    # Stelle sicher, dass das Verzeichnis existiert
    cache_path.mkdir(parents=True, exist_ok=True)
    
    # Erstelle auch das relative Verzeichnis für ai_core
    ai_core_models = Path(__file__).parent.parent / "ai_core" / "models"
    if not ai_core_models.exists():
        ai_core_models.symlink_to(cache_path.resolve(), target_is_directory=True)
    
    logger.info(f"📁 Model Cache Verzeichnis: {cache_path}")
    return cache_path


def download_model(model_key: str, force_download: bool = False) -> bool:
    """Lade ein spezifisches Modell herunter"""
    if model_key not in AVAILABLE_MODELS:
        logger.error(f"❌ Unbekanntes Modell: {model_key}")
        logger.info(f"Verfügbare Modelle: {list(AVAILABLE_MODELS.keys())}")
        return False
    
    model_info = AVAILABLE_MODELS[model_key]
    model_name = model_info["model_name"]
    
    logger.info(f"🤖 Lade Modell: {model_name}")
    logger.info(f"📝 Beschreibung: {model_info['description']}")
    logger.info(f"💾 Größe: {model_info['size']}")
    
    # Token prüfen falls erforderlich
    hf_token = None
    if model_info["requires_token"]:
        hf_token = setup_huggingface_token()
        if not hf_token:
            return False
    
    try:
        cache_dir = get_model_cache_dir()
        model_cache_path = cache_dir / model_key
        
        # Prüfe ob Modell bereits existiert
        if model_cache_path.exists() and not force_download:
            logger.info(f"✅ Modell bereits vorhanden: {model_cache_path}")
            logger.info("💡 Verwenden Sie --force um erneut herunterzuladen")
            return True
        
        logger.info("📥 Starte Download...")
        
        # Download mit snapshot_download für bessere Kontrolle
        try:
            downloaded_path = snapshot_download(
                repo_id=model_name,
                cache_dir=str(cache_dir),
                local_dir=str(model_cache_path),
                token=hf_token,
                resume_download=True,
                local_dir_use_symlinks=False
            )
        except KeyboardInterrupt:
            logger.info("⏸️  Download unterbrochen - kann später fortgesetzt werden")
            return False
        except Exception as download_error:
            logger.error(f"❌ Download-Fehler: {download_error}")
            return False
        
        logger.info(f"✅ Modell erfolgreich heruntergeladen: {downloaded_path}")
        
        # Teste das Modell
        logger.info("🧪 Teste Modell...")
        test_model(model_cache_path, hf_token)
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Download: {e}")
        return False


def test_model(model_path: Path, hf_token: Optional[str] = None) -> bool:
    """Teste ein heruntergeladenes Modell"""
    try:
        logger.info("🔍 Lade Tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(
            str(model_path),
            token=hf_token,
            local_files_only=True
        )
        
        logger.info("🔍 Lade Modell (nur Konfiguration)...")
        model = AutoModelForCausalLM.from_pretrained(
            str(model_path),
            token=hf_token,
            local_files_only=True,
            torch_dtype=torch.float16,
            device_map="cpu",
            low_cpu_mem_usage=True
        )
        
        logger.info("✅ Modell erfolgreich getestet")
        return True
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Testen: {e}")
        return False


def list_models():
    """Liste alle verfügbaren Modelle auf"""
    print("\n🤖 Verfügbare Modelle:")
    print("=" * 80)
    
    for key, info in AVAILABLE_MODELS.items():
        status = "⭐ EMPFOHLEN" if info["recommended"] else ""
        token_req = "🔑 Token erforderlich" if info["requires_token"] else "🆓 Frei verfügbar"
        
        print(f"\n📦 {key} {status}")
        print(f"   Modell: {info['model_name']}")
        print(f"   Größe: {info['size']}")
        print(f"   Status: {token_req}")
        print(f"   Beschreibung: {info['description']}")
    
    print("\n" + "=" * 80)


def list_downloaded_models():
    """Liste heruntergeladene Modelle auf"""
    cache_dir = get_model_cache_dir()
    
    print(f"\n📁 Heruntergeladene Modelle in: {cache_dir}")
    print("=" * 80)
    
    found_models = []
    for model_key in AVAILABLE_MODELS.keys():
        model_path = cache_dir / model_key
        if model_path.exists():
            # Berechne Größe
            total_size = sum(f.stat().st_size for f in model_path.rglob('*') if f.is_file())
            size_gb = total_size / (1024**3)
            
            found_models.append((model_key, model_path, size_gb))
            print(f"✅ {model_key}")
            print(f"   Pfad: {model_path}")
            print(f"   Größe: {size_gb:.2f} GB")
            print()
    
    if not found_models:
        print("❌ Keine Modelle gefunden")
    
    print("=" * 80)


def main():
    """Hauptfunktion"""
    parser = argparse.ArgumentParser(
        description="Creative Muse AI - Model Download Script",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Beispiele:
  python download_models.py --list                    # Liste verfügbare Modelle
  python download_models.py --downloaded              # Liste heruntergeladene Modelle
  python download_models.py --download mistral-7b-instruct-v0.3  # Lade Mistral Modell
  python download_models.py --download-all            # Lade alle empfohlenen Modelle
  python download_models.py --force mistral-7b-instruct-v0.3     # Erzwinge erneuten Download
        """
    )
    
    parser.add_argument("--list", action="store_true",
                       help="Liste alle verfügbaren Modelle")
    parser.add_argument("--downloaded", action="store_true",
                       help="Liste heruntergeladene Modelle")
    parser.add_argument("--download", type=str,
                       help="Lade spezifisches Modell herunter")
    parser.add_argument("--download-all", action="store_true",
                       help="Lade alle empfohlenen Modelle herunter")
    parser.add_argument("--force", action="store_true",
                       help="Erzwinge erneuten Download")
    parser.add_argument("--test", type=str,
                       help="Teste ein heruntergeladenes Modell")
    
    args = parser.parse_args()
    
    # Lade Umgebungsvariablen
    load_environment()
    
    if args.list:
        list_models()
        return
    
    if args.downloaded:
        list_downloaded_models()
        return
    
    if args.download:
        success = download_model(args.download, args.force)
        sys.exit(0 if success else 1)
    
    if args.download_all:
        logger.info("📦 Lade alle empfohlenen Modelle herunter...")
        success_count = 0
        total_count = 0
        
        for key, info in AVAILABLE_MODELS.items():
            if info["recommended"]:
                total_count += 1
                if download_model(key, args.force):
                    success_count += 1
        
        logger.info(f"✅ {success_count}/{total_count} Modelle erfolgreich heruntergeladen")
        sys.exit(0 if success_count == total_count else 1)
    
    if args.test:
        cache_dir = get_model_cache_dir()
        model_path = cache_dir / args.test
        
        if not model_path.exists():
            logger.error(f"❌ Modell nicht gefunden: {model_path}")
            sys.exit(1)
        
        hf_token = setup_huggingface_token()
        success = test_model(model_path, hf_token)
        sys.exit(0 if success else 1)
    
    # Keine Argumente - zeige Hilfe
    parser.print_help()


if __name__ == "__main__":
    main()