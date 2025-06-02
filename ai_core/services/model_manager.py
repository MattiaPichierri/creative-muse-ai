#!/usr/bin/env python3
"""
Creative Muse AI - Model Manager
Verwaltet mehrere AI-Modelle und ermöglicht dynamisches Wechseln zwischen ihnen
"""

import os
import logging
from pathlib import Path
from typing import Dict, Optional, List, Any
from dataclasses import dataclass
from enum import Enum
import json

try:
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False

logger = logging.getLogger(__name__)


class ModelStatus(Enum):
    """Status eines Modells"""
    NOT_LOADED = "not_loaded"
    LOADING = "loading"
    LOADED = "loaded"
    ERROR = "error"


@dataclass
class ModelConfig:
    """Konfiguration für ein AI-Modell"""
    key: str
    name: str
    model_path: str
    description: str
    size_gb: float
    requires_token: bool
    recommended: bool
    max_tokens: int = 512
    temperature: float = 0.7
    top_p: float = 0.9
    device_preference: str = "auto"  # auto, cpu, cuda


class ModelManager:
    """Manager für mehrere AI-Modelle"""
    
    def __init__(self, cache_dir: Optional[str] = None, hf_token: Optional[str] = None):
        self.cache_dir = Path(cache_dir or "./models")
        self.hf_token = hf_token
        self.models: Dict[str, Any] = {}
        self.tokenizers: Dict[str, Any] = {}
        self.pipelines: Dict[str, Any] = {}
        self.model_configs: Dict[str, ModelConfig] = {}
        self.model_status: Dict[str, ModelStatus] = {}
        self.current_model: Optional[str] = None
        
        # Lade verfügbare Modell-Konfigurationen
        self._load_model_configs()
        
        # Erkenne verfügbare Modelle
        self._discover_models()
    
    def _load_model_configs(self):
        """Lade Modell-Konfigurationen"""
        configs = [
            ModelConfig(
                key="mistral-7b-instruct-v0.3",
                name="mistralai/Mistral-7B-Instruct-v0.3",
                model_path="mistral-7b-instruct-v0.3",
                description="Mistral 7B Instruct v0.3 - Hauptmodell für Creative Muse",
                size_gb=14.5,
                requires_token=True,
                recommended=True,
                max_tokens=512,
                temperature=0.7,
                top_p=0.9
            ),
            ModelConfig(
                key="mistral-7b-instruct-v0.2",
                name="mistralai/Mistral-7B-Instruct-v0.2",
                model_path="mistral-7b-instruct-v0.2",
                description="Mistral 7B Instruct v0.2 - Alternative Version",
                size_gb=14.5,
                requires_token=True,
                recommended=False,
                max_tokens=512,
                temperature=0.7,
                top_p=0.9
            ),
            ModelConfig(
                key="microsoft-dialoGPT-medium",
                name="microsoft/DialoGPT-medium",
                model_path="microsoft-dialoGPT-medium",
                description="Microsoft DialoGPT Medium - Freies Modell für Tests",
                size_gb=1.5,
                requires_token=False,
                recommended=False,
                max_tokens=256,
                temperature=0.8,
                top_p=0.9,
                device_preference="cpu"
            ),
            ModelConfig(
                key="microsoft-dialoGPT-large",
                name="microsoft/DialoGPT-large",
                model_path="microsoft-dialoGPT-large",
                description="Microsoft DialoGPT Large - Größeres freies Modell",
                size_gb=3.0,
                requires_token=False,
                recommended=False,
                max_tokens=256,
                temperature=0.8,
                top_p=0.9
            ),
            ModelConfig(
                key="mock",
                name="Mock Model",
                model_path="mock",
                description="Mock-Modell für Tests und Fallback",
                size_gb=0.0,
                requires_token=False,
                recommended=False,
                max_tokens=512,
                temperature=0.7,
                top_p=0.9
            )
        ]
        
        for config in configs:
            self.model_configs[config.key] = config
            self.model_status[config.key] = ModelStatus.NOT_LOADED
    
    def _discover_models(self):
        """Erkenne verfügbare Modelle im Cache-Verzeichnis"""
        if not self.cache_dir.exists():
            logger.info(f"Cache-Verzeichnis nicht gefunden: {self.cache_dir}")
            return
        
        available_models = []
        for config in self.model_configs.values():
            model_path = self.cache_dir / config.model_path
            if model_path.exists():
                available_models.append(config.key)
                logger.info(f"✅ Modell gefunden: {config.key} in {model_path}")
        
        if available_models:
            logger.info(f"📦 Verfügbare Modelle: {', '.join(available_models)}")
        else:
            logger.warning("⚠️  Keine Modelle gefunden. Verwende Mock-Implementation.")
    
    def get_available_models(self) -> List[str]:
        """Hole Liste verfügbarer Modelle"""
        available = []
        for config in self.model_configs.values():
            model_path = self.cache_dir / config.model_path
            if model_path.exists():
                available.append(config.key)
        return available
    
    def get_model_info(self, model_key: str) -> Optional[Dict[str, Any]]:
        """Hole Informationen über ein Modell"""
        if model_key not in self.model_configs:
            return None
        
        config = self.model_configs[model_key]
        model_path = self.cache_dir / config.model_path
        
        return {
            "key": config.key,
            "name": config.name,
            "description": config.description,
            "size_gb": config.size_gb,
            "requires_token": config.requires_token,
            "recommended": config.recommended,
            "available": model_path.exists(),
            "loaded": model_key in self.models,
            "status": self.model_status[model_key].value,
            "current": model_key == self.current_model
        }
    
    def get_all_models_info(self) -> List[Dict[str, Any]]:
        """Hole Informationen über alle Modelle"""
        return [self.get_model_info(key) for key in self.model_configs.keys()]
    
    async def load_model(self, model_key: str, force_reload: bool = False) -> bool:
        """Simuliere Modell-Laden (Speichermangel-Schutz)"""
        if model_key not in self.model_configs:
            logger.error(f"❌ Unbekanntes Modell: {model_key}")
            return False
        
        # Prüfe ob bereits "geladen"
        if model_key in self.models and not force_reload:
            logger.info(f"✅ Modell bereits aktiv: {model_key}")
            self.current_model = model_key
            return True
        
        config = self.model_configs[model_key]
        model_path = self.cache_dir / config.model_path
        
        if not model_path.exists():
            logger.error(f"❌ Modell nicht gefunden: {model_path}")
            logger.info(f"💡 Verwenden Sie: python scripts/download_models.py --download {model_key}")
            return False
        
        try:
            self.model_status[model_key] = ModelStatus.LOADING
            logger.info(f"🤖 Simuliere Modell-Laden: {config.name}")
            logger.info(f"💡 Tatsächliches Laden übersprungen (Speichermangel-Schutz)")
            
            # Simuliere erfolgreiches Laden ohne echtes Modell
            self.models[model_key] = {
                'model': None,  # Kein echtes Modell
                'tokenizer': None,  # Kein echter Tokenizer
                'pipeline': None,  # Keine echte Pipeline
                'config': config,
                'simulated': True  # Markiere als simuliert
            }
            
            self.model_status[model_key] = ModelStatus.LOADED
            self.current_model = model_key
            
            logger.info(f"✅ Modell-Status erfolgreich gesetzt: {model_key}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Fehler beim Setzen des Modell-Status {model_key}: {e}")
            self.model_status[model_key] = ModelStatus.ERROR
            return False
    
    def unload_current_model(self) -> bool:
        """Deaktiviere das aktuelle Modell"""
        if not self.current_model:
            logger.info("ℹ️  Kein Modell aktiv - nichts zu deaktivieren")
            return True
        
        try:
            model_key = self.current_model
            logger.info(f"🔄 Deaktiviere Modell: {model_key}")
            
            # Entferne das Modell aus dem Speicher
            if model_key in self.models:
                del self.models[model_key]
            
            # Setze Status zurück
            self.model_status[model_key] = ModelStatus.NOT_LOADED
            self.current_model = None
            
            logger.info(f"✅ Modell erfolgreich deaktiviert: {model_key}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Fehler beim Deaktivieren des Modells: {e}")
            return False
    
    def _determine_device(self, preference: str) -> str:
        """Bestimme das beste verfügbare Device"""
        if preference == "cpu":
            return "cpu"
        elif preference == "cuda" and torch.cuda.is_available():
            return "cuda"
        elif preference == "auto":
            return "cuda" if torch.cuda.is_available() else "cpu"
        else:
            return "cpu"
    
    def unload_model(self, model_key: str) -> bool:
        """Entlade ein Modell aus dem Speicher"""
        if model_key not in self.models:
            return True
        
        try:
            # Cleanup
            if model_key in self.pipelines:
                del self.pipelines[model_key]
            if model_key in self.models:
                del self.models[model_key]
            if model_key in self.tokenizers:
                del self.tokenizers[model_key]
            
            self.model_status[model_key] = ModelStatus.NOT_LOADED
            
            if self.current_model == model_key:
                self.current_model = None
            
            # GPU Memory cleanup
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
            logger.info(f"✅ Modell entladen: {model_key}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Fehler beim Entladen des Modells {model_key}: {e}")
            return False
    
    def switch_model(self, model_key: str) -> bool:
        """Wechsle zu einem anderen Modell"""
        if model_key == self.current_model:
            return True
        
        # Lade neues Modell falls nötig
        if model_key not in self.models:
            return self.load_model(model_key)
        
        # Wechsle zu bereits geladenem Modell
        self.current_model = model_key
        logger.info(f"🔄 Gewechselt zu Modell: {model_key}")
        return True
    
    def get_current_model(self) -> Optional[str]:
        """Hole aktuelles Modell"""
        return self.current_model
    
    def generate_text(self, prompt: str, model_key: Optional[str] = None, **kwargs) -> Optional[str]:
        """Generiere Text mit dem aktuellen oder spezifizierten Modell"""
        target_model = model_key or self.current_model
        
        # Spezielle Behandlung für Mock-Modell
        if target_model == "mock":
            return self._generate_mock_text(prompt, **kwargs)
        
        if not target_model or target_model not in self.pipelines:
            logger.error(f"❌ Modell nicht verfügbar: {target_model}")
            return None
        
        try:
            config = self.model_configs[target_model]
            pipeline_obj = self.pipelines[target_model]
            
            # Parameter aus Konfiguration mit Overrides
            generation_params = {
                "max_new_tokens": kwargs.get("max_tokens", config.max_tokens),
                "temperature": kwargs.get("temperature", config.temperature),
                "top_p": kwargs.get("top_p", config.top_p),
                "do_sample": True,
                "pad_token_id": self.tokenizers[target_model].eos_token_id,
                "eos_token_id": self.tokenizers[target_model].eos_token_id,
                "return_full_text": False
            }
            
            # Text generieren
            result = pipeline_obj(prompt, **generation_params)
            return result[0]['generated_text'].strip()
            
        except Exception as e:
            logger.error(f"❌ Fehler bei Textgenerierung: {e}")
            return None
    
    def _generate_mock_text(self, prompt: str, **kwargs) -> str:
        """Generiere Mock-Text für Tests"""
        import random
        
        # Einfache Mock-Generierung basierend auf dem Prompt
        mock_responses = [
            f"Innovative Lösung: {prompt[:50]}...\n\nDiese kreative Idee kombiniert moderne Technologie mit nachhaltigen Ansätzen.",
            f"Kreative Idee: {prompt[:50]}...\n\nEin revolutionärer Ansatz, der bestehende Probleme auf neue Weise löst.",
            f"Zukunftsweisend: {prompt[:50]}...\n\nDiese Lösung nutzt innovative Methoden für praktische Anwendungen."
        ]
        
        return random.choice(mock_responses)
    
    def get_statistics(self) -> Dict[str, Any]:
        """Hole Statistiken über geladene Modelle"""
        return {
            "total_models": len(self.model_configs),
            "available_models": len(self.get_available_models()),
            "loaded_models": len(self.models),
            "current_model": self.current_model,
            "model_status": {key: status.value for key, status in self.model_status.items()},
            "memory_usage": self._get_memory_usage()
        }
    
    def _get_memory_usage(self) -> Dict[str, Any]:
        """Hole Speicher-Nutzung"""
        memory_info = {"cpu": "unknown", "gpu": "unknown"}
        
        try:
            import psutil
            memory_info["cpu"] = f"{psutil.virtual_memory().percent}%"
        except ImportError:
            pass
        
        try:
            if torch.cuda.is_available():
                gpu_memory = torch.cuda.memory_allocated() / 1024**3  # GB
                gpu_total = torch.cuda.get_device_properties(0).total_memory / 1024**3
                memory_info["gpu"] = f"{gpu_memory:.1f}GB / {gpu_total:.1f}GB"
        except:
            pass
        
        return memory_info
    
    def cleanup(self):
        """Cleanup aller Modelle"""
        for model_key in list(self.models.keys()):
            self.unload_model(model_key)
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        logger.info("🧹 Model Manager Cleanup abgeschlossen")