#!/usr/bin/env python3
"""
Creative Muse AI - Multi-Model Backend
FastAPI-basiertes Backend mit Multi-Model-Support
Erweitert mit: Echtzeit-Streaming, Batch-Processing, Intelligentes Vorladen
"""

import os
import logging
import asyncio
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional, List, AsyncGenerator
from datetime import datetime
import uuid
import sqlite3
import json
from concurrent.futures import ThreadPoolExecutor

import uvicorn
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from sse_starlette.sse import EventSourceResponse

# Lokale Imports
from model_manager import ModelManager

# Lade Umgebungsvariablen
load_dotenv("../.env")
# Fallback: Lade auch lokale .env falls vorhanden
load_dotenv(".env")

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Globale Komponenten
model_manager: Optional[ModelManager] = None


# Datenmodelle
class IdeaRequest(BaseModel):
    prompt: str
    category: Optional[str] = "general"
    creativity_level: Optional[int] = 5
    language: Optional[str] = "de"
    model: Optional[str] = None  # Spezifisches Modell wählen
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None
    stream: Optional[bool] = False  # Echtzeit-Streaming


class BatchIdeaRequest(BaseModel):
    """Request für mehrere Ideen gleichzeitig"""
    prompts: List[str]
    category: Optional[str] = "general"
    creativity_level: Optional[int] = 5
    language: Optional[str] = "de"
    models: Optional[List[str]] = None  # Verschiedene Modelle pro Idee
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None
    parallel: Optional[bool] = True  # Parallele Verarbeitung


class ModelSwitchRequest(BaseModel):
    model_key: str


class ModelPreloadRequest(BaseModel):
    """Request für intelligentes Vorladen"""
    model_keys: List[str]
    priority: Optional[str] = "balanced"  # high, balanced, low


class RandomIdeaRequest(BaseModel):
    category: Optional[str] = "general"
    language: Optional[str] = "de"
    model: Optional[str] = None


class IdeaResponse(BaseModel):
    id: str
    title: str
    content: str
    category: str
    rating: Optional[int] = None
    created_at: str
    generation_method: str
    model_used: str
    generation_time: Optional[float] = None  # Generierungszeit in Sekunden


class BatchIdeaResponse(BaseModel):
    """Response für Batch-Generierung"""
    ideas: List[IdeaResponse]
    total_count: int
    success_count: int
    failed_count: int
    total_time: float
    average_time: float


class StreamChunk(BaseModel):
    """Chunk für Streaming-Response"""
    type: str  # "start", "chunk", "complete", "error"
    content: Optional[str] = None
    idea_id: Optional[str] = None
    progress: Optional[float] = None
    error: Optional[str] = None


class ModelInfo(BaseModel):
    key: str
    name: str
    description: str
    size_gb: float
    requires_token: bool
    recommended: bool
    available: bool
    loaded: bool
    status: str
    current: bool
    preload_priority: Optional[int] = 0  # Vorladen-Priorität


class Stats(BaseModel):
    total_ideas: int
    categories: Dict[str, int]
    average_rating: float
    recent_activity: int
    model_stats: Dict[str, Any]
    streaming_stats: Optional[Dict[str, Any]] = None
    batch_stats: Optional[Dict[str, Any]] = None


# Globale Variablen
# Verwende absoluten Pfad basierend auf dem aktuellen Skript-Verzeichnis
script_dir = Path(__file__).parent
db_path = script_dir.parent / "database" / "creative_muse.db"

# Erweiterte globale Variablen für neue Features
executor = ThreadPoolExecutor(max_workers=4)  # Für parallele Verarbeitung
preload_queue = asyncio.Queue()  # Queue für intelligentes Vorladen
streaming_sessions = {}  # Aktive Streaming-Sessions
model_usage_stats = {}  # Modell-Nutzungsstatistiken für Vorladen


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup und Shutdown Events"""
    global model_manager
    
    # Startup
    logger.info("🚀 Starte Creative Muse AI Multi-Model Backend...")
    
    # Datenbank initialisieren
    init_simple_db()
    
    # Model Manager initialisieren
    hf_token = os.getenv("HF_TOKEN")
    cache_dir = os.getenv("MODEL_CACHE_DIR", "../models")
    
    model_manager = ModelManager(cache_dir=cache_dir, hf_token=hf_token)
    
    # Lazy Loading - Modelle werden bei Bedarf geladen (Speicher sparen)
    available_models = model_manager.get_available_models()
    if available_models:
        logger.info(f"💡 Lazy Loading aktiviert - Modelle werden bei Bedarf geladen")
        logger.info(f"📋 Verfügbare Modelle: {', '.join(available_models)}")
        logger.info(f"✅ Multi-Model Backend bereit (kein Modell geladen)")
    else:
        logger.warning("⚠️  Keine Modelle gefunden - verwende Mock-Implementation")
    
    yield
    
    # Shutdown
    logger.info("🛑 Backend wird beendet...")
    if model_manager:
        model_manager.cleanup()


# FastAPI App
app = FastAPI(
    title="Creative Muse AI - Multi-Model",
    description="AI-powered Creative Idea Generation with Multi-Model Support",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def init_simple_db():
    """Initialisiere vereinfachte Datenbank"""
    try:
        db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Erweiterte Ideen-Tabelle mit Modell-Info
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS simple_ideas (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                rating INTEGER,
                generation_method TEXT DEFAULT 'mock',
                model_used TEXT DEFAULT 'unknown',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )
        
        # Prüfe und füge fehlende Spalten hinzu
        try:
            cursor.execute("ALTER TABLE simple_ideas ADD COLUMN model_used TEXT DEFAULT 'unknown'")
            logger.info("✅ Spalte model_used hinzugefügt")
        except sqlite3.OperationalError:
            # Spalte existiert bereits
            pass
            
        try:
            cursor.execute("ALTER TABLE simple_ideas ADD COLUMN generation_method TEXT DEFAULT 'mock'")
            logger.info("✅ Spalte generation_method hinzugefügt")
        except sqlite3.OperationalError:
            # Spalte existiert bereits
            pass

        conn.commit()
        conn.close()
        logger.info("✅ Datenbank initialisiert")
        return True
    except Exception as e:
        logger.error(f"❌ Fehler bei DB-Initialisierung: {e}")
        return False


def create_model_specific_prompt(prompt: str, category: str, language: str,
                                creativity_level: int, model_key: str) -> str:
    """Erstelle modell-spezifische optimierte Prompts"""
    
    # Basis-Prompts pro Sprache
    base_prompts = {
        "de": {
            "system": "Du bist ein kreativer KI-Assistent für innovative Ideengenerierung.",
            "instruction": f"Generiere eine kreative Idee für '{category}' basierend auf: '{prompt}'. "
                          f"Kreativitätslevel: {creativity_level}/10. "
                          f"Antworte mit Titel und detaillierter Beschreibung."
        },
        "en": {
            "system": "You are a creative AI assistant for innovative idea generation.",
            "instruction": f"Generate a creative idea for '{category}' based on: '{prompt}'. "
                          f"Creativity level: {creativity_level}/10. "
                          f"Respond with title and detailed description."
        },
        "it": {
            "system": "Sei un assistente IA creativo per la generazione di idee innovative.",
            "instruction": f"Genera un'idea creativa per '{category}' basata su: '{prompt}'. "
                          f"Livello di creatività: {creativity_level}/10. "
                          f"Rispondi con titolo e descrizione dettagliata."
        }
    }
    
    # Modell-spezifische Anpassungen
    model_adaptations = {
        "mistral-7b-instruct-v0.3": {
            "prefix": "[INST] ",
            "suffix": " [/INST]",
            "style": "structured"
        },
        "mistral-7b-instruct-v0.2": {
            "prefix": "[INST] ",
            "suffix": " [/INST]",
            "style": "structured"
        },
        "microsoft-dialoGPT-medium": {
            "prefix": "",
            "suffix": "",
            "style": "conversational"
        },
        "microsoft-dialoGPT-large": {
            "prefix": "",
            "suffix": "",
            "style": "conversational"
        }
    }
    
    lang_config = base_prompts.get(language, base_prompts["de"])
    model_config = model_adaptations.get(model_key, {"prefix": "", "suffix": "", "style": "default"})
    
    # Erstelle modell-spezifischen Prompt
    base_prompt = f"{lang_config['system']}\n\n{lang_config['instruction']}"
    
    if model_config["style"] == "structured":
        # Für Mistral-Modelle: Strukturierter Ansatz
        formatted_prompt = f"{model_config['prefix']}{base_prompt}{model_config['suffix']}"
    elif model_config["style"] == "conversational":
        # Für DialoGPT: Konversationeller Ansatz
        formatted_prompt = f"Human: {base_prompt}\nAssistant:"
    else:
        # Standard-Format
        formatted_prompt = base_prompt
    
    return formatted_prompt


def create_optimized_prompt(prompt: str, category: str, language: str, creativity_level: int) -> str:
    """Erstelle optimierten Prompt für verschiedene Modelle (Legacy-Kompatibilität)"""
    return create_model_specific_prompt(prompt, category, language, creativity_level, "default")


async def update_model_usage_stats(model_key: str, generation_time: float):
    """Aktualisiere Modell-Nutzungsstatistiken für intelligentes Vorladen"""
    if model_key not in model_usage_stats:
        model_usage_stats[model_key] = {
            "usage_count": 0,
            "total_time": 0.0,
            "average_time": 0.0,
            "last_used": datetime.now(),
            "priority_score": 0.0
        }
    
    stats = model_usage_stats[model_key]
    stats["usage_count"] += 1
    stats["total_time"] += generation_time
    stats["average_time"] = stats["total_time"] / stats["usage_count"]
    stats["last_used"] = datetime.now()
    
    # Berechne Prioritätsscore für intelligentes Vorladen
    # Basiert auf Nutzungshäufigkeit und Aktualität
    time_factor = max(0.1, 1.0 - (datetime.now() - stats["last_used"]).total_seconds() / 3600)
    stats["priority_score"] = stats["usage_count"] * time_factor


async def intelligent_preload_models():
    """Intelligentes Vorladen von Modellen basierend auf Nutzungsstatistiken"""
    if not model_manager:
        return
    
    # Sortiere Modelle nach Prioritätsscore
    sorted_models = sorted(
        model_usage_stats.items(),
        key=lambda x: x[1]["priority_score"],
        reverse=True
    )
    
    # Lade die Top 2 Modelle vor (falls nicht bereits geladen)
    for model_key, stats in sorted_models[:2]:
        if model_key not in model_manager.models:
            logger.info(f"🔮 Intelligentes Vorladen: {model_key} (Score: {stats['priority_score']:.2f})")
            await model_manager.load_model(model_key)


async def generate_streaming_idea(prompt: str, category: str, language: str,
                                creativity_level: int, model_key: Optional[str] = None) -> AsyncGenerator[StreamChunk, None]:
    """Generiere Idee mit Echtzeit-Streaming"""
    idea_id = str(uuid.uuid4())
    start_time = datetime.now()
    
    try:
        # Start-Event senden
        yield StreamChunk(
            type="start",
            idea_id=idea_id,
            progress=0.0
        )
        
        # Simuliere Streaming-Generierung (in echter Implementierung würde hier das Modell streamen)
        target_model = model_key or (model_manager.get_current_model() if model_manager else "mock")
        
        if target_model and target_model != "mock" and model_manager:
            # Echte Modell-Generierung
            formatted_prompt = create_model_specific_prompt(prompt, category, language, creativity_level, target_model)
            
            # Simuliere Streaming durch Chunk-weise Ausgabe
            full_text = model_manager.generate_text(formatted_prompt, model_key=target_model)
            
            if full_text:
                # Teile Text in Chunks auf
                chunks = [full_text[i:i+50] for i in range(0, len(full_text), 50)]
                
                for i, chunk in enumerate(chunks):
                    progress = (i + 1) / len(chunks)
                    yield StreamChunk(
                        type="chunk",
                        content=chunk,
                        idea_id=idea_id,
                        progress=progress
                    )
                    await asyncio.sleep(0.1)  # Simuliere Streaming-Delay
            else:
                raise Exception("Keine Textgenerierung erhalten")
        else:
            # Mock-Streaming
            mock_text = f"Innovative Idee für {category}: {prompt}. Eine kreative Lösung mit Niveau {creativity_level}."
            chunks = [mock_text[i:i+20] for i in range(0, len(mock_text), 20)]
            
            for i, chunk in enumerate(chunks):
                progress = (i + 1) / len(chunks)
                yield StreamChunk(
                    type="chunk",
                    content=chunk,
                    idea_id=idea_id,
                    progress=progress
                )
                await asyncio.sleep(0.1)
        
        # Complete-Event senden
        generation_time = (datetime.now() - start_time).total_seconds()
        yield StreamChunk(
            type="complete",
            idea_id=idea_id,
            progress=1.0
        )
        
        # Statistiken aktualisieren
        if target_model and target_model != "mock":
            await update_model_usage_stats(target_model, generation_time)
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Streaming: {e}")
        yield StreamChunk(
            type="error",
            idea_id=idea_id,
            error=str(e)
        )


async def generate_batch_ideas(requests: List[Dict[str, Any]], parallel: bool = True) -> BatchIdeaResponse:
    """Generiere mehrere Ideen gleichzeitig"""
    start_time = datetime.now()
    ideas = []
    failed_count = 0
    
    if parallel and len(requests) > 1:
        # Parallele Verarbeitung
        tasks = []
        for req in requests:
            task = asyncio.create_task(
                generate_with_model(
                    req["prompt"],
                    req["category"],
                    req["language"],
                    req["creativity_level"],
                    req.get("model"),
                    **req.get("kwargs", {})
                )
            )
            tasks.append(task)
        
        # Warte auf alle Tasks
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"❌ Fehler bei Batch-Idee {i}: {result}")
                failed_count += 1
            else:
                idea_id = str(uuid.uuid4())
                created_at = datetime.now().isoformat()
                
                ideas.append(IdeaResponse(
                    id=idea_id,
                    title=result["title"],
                    content=result["content"],
                    category=requests[i]["category"],
                    created_at=created_at,
                    generation_method=result["generation_method"],
                    model_used=result["model_used"]
                ))
    else:
        # Sequenzielle Verarbeitung
        for req in requests:
            try:
                result = await generate_with_model(
                    req["prompt"],
                    req["category"],
                    req["language"],
                    req["creativity_level"],
                    req.get("model"),
                    **req.get("kwargs", {})
                )
                
                idea_id = str(uuid.uuid4())
                created_at = datetime.now().isoformat()
                
                ideas.append(IdeaResponse(
                    id=idea_id,
                    title=result["title"],
                    content=result["content"],
                    category=req["category"],
                    created_at=created_at,
                    generation_method=result["generation_method"],
                    model_used=result["model_used"]
                ))
            except Exception as e:
                logger.error(f"❌ Fehler bei Batch-Idee: {e}")
                failed_count += 1
    
    total_time = (datetime.now() - start_time).total_seconds()
    success_count = len(ideas)
    average_time = total_time / max(1, success_count)
    
    return BatchIdeaResponse(
        ideas=ideas,
        total_count=len(requests),
        success_count=success_count,
        failed_count=failed_count,
        total_time=total_time,
        average_time=average_time
    )


async def generate_with_model(prompt: str, category: str, language: str, 
                             creativity_level: int, model_key: Optional[str] = None,
                             **kwargs) -> dict:
    """Generiere Idee mit spezifischem oder aktuellem Modell"""
    
    if not model_manager:
        return generate_mock_idea(prompt, category, language, creativity_level)
    
    # Bestimme Zielmodell
    target_model = model_key or model_manager.get_current_model()
    
    if not target_model:
        available = model_manager.get_available_models()
        if available:
            target_model = available[0]
            await model_manager.load_model(target_model)
        else:
            return generate_mock_idea(prompt, category, language, creativity_level)
    
    # Wechsle zu Modell falls nötig
    if target_model != model_manager.get_current_model():
        success = await model_manager.load_model(target_model)
        if not success:
            return generate_mock_idea(prompt, category, language, creativity_level)
    
    try:
        # Prompt erstellen
        formatted_prompt = create_optimized_prompt(prompt, category, language, creativity_level)
        
        # Generierungs-Parameter
        generation_params = {
            "temperature": kwargs.get("temperature", 0.3 + (creativity_level / 10) * 0.7),
            "max_tokens": kwargs.get("max_tokens", 512)
        }
        
        # Text generieren
        generated_text = model_manager.generate_text(
            formatted_prompt,
            model_key=target_model,
            **generation_params
        )
        
        if not generated_text:
            raise Exception("Keine Textgenerierung erhalten")
        
        # Parse Titel und Inhalt
        lines = generated_text.split('\n', 1)
        title = lines[0].strip()
        content = lines[1].strip() if len(lines) > 1 else generated_text
        
        # Bereinige Titel
        if title.startswith(('Titel:', 'Title:', 'Titolo:')):
            title = title.split(':', 1)[1].strip()
        
        return {
            "title": title[:200],
            "content": content[:2000],
            "generation_method": f"model_{target_model}",
            "model_used": target_model
        }
        
    except Exception as e:
        logger.error(f"❌ Fehler bei Modell-Generierung: {e}")
        return generate_mock_idea(prompt, category, language, creativity_level)


def generate_mock_idea(prompt: str, category: str, language: str, creativity_level: int) -> dict:
    """Fallback Mock-Implementation"""
    import random
    
    mock_titles = {
        "de": [
            "Innovative Lösung für moderne Herausforderungen",
            "Kreative Fusion von Technologie und Nachhaltigkeit",
            "Revolutionärer Ansatz für den Alltag"
        ],
        "en": [
            "Innovative Solution for Modern Challenges",
            "Creative Fusion of Technology and Sustainability",
            "Revolutionary Approach for Daily Life"
        ],
        "it": [
            "Soluzione Innovativa per Sfide Moderne",
            "Fusione Creativa di Tecnologia e Sostenibilità",
            "Approccio Rivoluzionario per la Vita Quotidiana"
        ]
    }
    
    title = random.choice(mock_titles.get(language, mock_titles["de"]))
    
    content_template = {
        "de": f"Diese innovative Idee basiert auf '{prompt}' und kombiniert {category} "
              f"mit modernen Technologien. Kreativitätslevel: {creativity_level}.",
        "en": f"This innovative idea is based on '{prompt}' and combines {category} "
              f"with modern technologies. Creativity level: {creativity_level}.",
        "it": f"Questa idea innovativa si basa su '{prompt}' e combina {category} "
              f"con tecnologie moderne. Livello di creatività: {creativity_level}."
    }
    
    return {
        "title": title,
        "content": content_template.get(language, content_template["de"]),
        "generation_method": "mock",
        "model_used": "mock"
    }


# API Endpunkte
@app.get("/")
async def root():
    """Root endpoint"""
    current_model = model_manager.get_current_model() if model_manager else None
    available_models = model_manager.get_available_models() if model_manager else []
    
    return {
        "message": "Creative Muse AI Multi-Model Backend",
        "version": "2.0.0",
        "status": "running",
        "current_model": current_model,
        "available_models": available_models,
        "endpoints": {
            "generate": "/api/v1/generate",
            "generate_stream": "/api/v1/generate/stream",
            "generate_batch": "/api/v1/generate/batch",
            "random": "/api/v1/random",
            "models": "/api/v1/models",
            "switch_model": "/api/v1/models/switch",
            "preload_models": "/api/v1/models/preload",
            "model_usage_stats": "/api/v1/models/usage-stats",
            "ideas": "/api/v1/ideas",
            "stats": "/api/v1/stats",
            "health": "/health"
        },
        "features": {
            "streaming": True,
            "batch_processing": True,
            "intelligent_preloading": True,
            "model_specific_prompts": True
        }
    }


@app.get("/api/v1/models", response_model=List[ModelInfo])
async def get_models():
    """Hole alle verfügbaren Modelle"""
    if not model_manager:
        return []
    
    models_info = model_manager.get_all_models_info()
    return [ModelInfo(**info) for info in models_info]


@app.post("/api/v1/models/switch")
async def switch_model(request: ModelSwitchRequest):
    """Wechsle zu einem anderen Modell"""
    if not model_manager:
        raise HTTPException(status_code=503, detail="Model Manager nicht verfügbar")
    
    success = await model_manager.load_model(request.model_key)
    if success:
        return {
            "message": f"Erfolgreich zu Modell gewechselt: {request.model_key}",
            "current_model": model_manager.get_current_model()
        }
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Fehler beim Wechseln zu Modell: {request.model_key}"
        )


@app.post("/api/v1/models/deactivate")
async def deactivate_model():
    """Deaktiviere das aktuelle Modell"""
    if not model_manager:
        raise HTTPException(status_code=503, detail="Model Manager nicht verfügbar")
    
    success = model_manager.unload_current_model()
    if success:
        return {
            "message": "Modell erfolgreich deaktiviert",
            "current_model": None
        }
    else:
        raise HTTPException(
            status_code=400,
            detail="Fehler beim Deaktivieren des Modells"
        )


@app.post("/api/v1/models/preload")
async def preload_models(request: ModelPreloadRequest):
    """Intelligentes Vorladen von Modellen"""
    if not model_manager:
        raise HTTPException(status_code=503, detail="Model Manager nicht verfügbar")
    
    results = []
    for model_key in request.model_keys:
        try:
            success = await model_manager.load_model(model_key)
            results.append({
                "model": model_key,
                "success": success,
                "status": "loaded" if success else "failed"
            })
        except Exception as e:
            results.append({
                "model": model_key,
                "success": False,
                "status": "error",
                "error": str(e)
            })
    
    return {
        "message": "Vorladen abgeschlossen",
        "results": results,
        "priority": request.priority
    }


@app.get("/api/v1/models/usage-stats")
async def get_model_usage_stats():
    """Hole Modell-Nutzungsstatistiken"""
    return {
        "usage_stats": model_usage_stats,
        "intelligent_preload_enabled": True,
        "preload_recommendations": sorted(
            model_usage_stats.items(),
            key=lambda x: x[1]["priority_score"],
            reverse=True
        )[:3]
    }


@app.post("/api/v1/generate/stream")
async def generate_idea_stream(request: IdeaRequest):
    """Generiere Idee mit Echtzeit-Streaming"""
    
    async def event_generator():
        async for chunk in generate_streaming_idea(
            request.prompt,
            request.category,
            request.language,
            request.creativity_level,
            request.model
        ):
            yield f"data: {json.dumps(chunk.dict())}\n\n"
    
    return EventSourceResponse(event_generator())


@app.post("/api/v1/generate/batch", response_model=BatchIdeaResponse)
async def generate_batch_ideas_endpoint(request: BatchIdeaRequest):
    """Generiere mehrere Ideen gleichzeitig"""
    
    # Konvertiere Request zu internem Format
    batch_requests = []
    for i, prompt in enumerate(request.prompts):
        model_key = None
        if request.models and i < len(request.models):
            model_key = request.models[i]
        
        batch_requests.append({
            "prompt": prompt,
            "category": request.category,
            "language": request.language,
            "creativity_level": request.creativity_level,
            "model": model_key,
            "kwargs": {
                "max_tokens": request.max_tokens,
                "temperature": request.temperature
            }
        })
    
    # Generiere Batch
    result = await generate_batch_ideas(batch_requests, request.parallel)
    
    # Speichere erfolgreiche Ideen in Datenbank
    if result.ideas:
        try:
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()
            
            for idea in result.ideas:
                cursor.execute(
                    """
                    INSERT INTO simple_ideas
                    (id, title, content, category, generation_method, model_used, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (idea.id, idea.title, idea.content, idea.category,
                     idea.generation_method, idea.model_used, idea.created_at)
                )
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"❌ Fehler beim Speichern der Batch-Ideen: {e}")
    
    return result


@app.post("/api/v1/generate", response_model=IdeaResponse)
async def generate_idea(request: IdeaRequest):
    """Generiere neue Idee"""
    try:
        idea_data = await generate_with_model(
            request.prompt,
            request.category,
            request.language,
            request.creativity_level,
            request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        # Speichere in Datenbank
        idea_id = str(uuid.uuid4())
        created_at = datetime.now().isoformat()
        
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO simple_ideas 
            (id, title, content, category, generation_method, model_used, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (idea_id, idea_data["title"], idea_data["content"], 
             request.category, idea_data["generation_method"], 
             idea_data["model_used"], created_at)
        )
        conn.commit()
        conn.close()
        
        return IdeaResponse(
            id=idea_id,
            title=idea_data["title"],
            content=idea_data["content"],
            category=request.category,
            created_at=created_at,
            generation_method=idea_data["generation_method"],
            model_used=idea_data["model_used"]
        )
        
    except Exception as e:
        logger.error(f"❌ Fehler bei Ideengenerierung: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/random", response_model=IdeaResponse)
async def generate_random_idea(request: RandomIdeaRequest):
    """Generiere zufällige Idee"""
    random_prompts = [
        "Zukunft der Arbeit", "Nachhaltigkeit", "Künstliche Intelligenz",
        "Gemeinschaft", "Innovation", "Kreativität", "Technologie"
    ]
    
    import random
    random_prompt = random.choice(random_prompts)
    
    idea_request = IdeaRequest(
        prompt=random_prompt,
        category=request.category,
        language=request.language,
        creativity_level=random.randint(6, 9),
        model=request.model
    )
    
    return await generate_idea(idea_request)


@app.get("/api/v1/ideas", response_model=List[IdeaResponse])
async def get_all_ideas():
    """Hole alle gespeicherten Ideen"""
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, title, content, category, rating, generation_method,
                   model_used, created_at
            FROM simple_ideas
            ORDER BY created_at DESC
        """)
        
        ideas = []
        for row in cursor.fetchall():
            ideas.append(IdeaResponse(
                id=row[0],
                title=row[1],
                content=row[2],
                category=row[3],
                rating=row[4],
                generation_method=row[5],
                model_used=row[6],
                created_at=row[7]
            ))
        
        conn.close()
        return ideas
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Laden der Ideen: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/stats", response_model=Stats)
async def get_stats():
    """Hole erweiterte Statistiken"""
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Basis-Statistiken
        cursor.execute("SELECT COUNT(*) FROM simple_ideas")
        total_ideas = cursor.fetchone()[0]
        
        cursor.execute("SELECT category, COUNT(*) FROM simple_ideas GROUP BY category")
        categories = dict(cursor.fetchall())
        
        cursor.execute("SELECT AVG(rating) FROM simple_ideas WHERE rating IS NOT NULL")
        avg_rating = cursor.fetchone()[0] or 0.0
        
        cursor.execute(
            "SELECT COUNT(*) FROM simple_ideas WHERE created_at > datetime('now', '-1 day')"
        )
        recent_activity = cursor.fetchone()[0]
        
        # Model-Statistiken
        model_stats = model_manager.get_statistics() if model_manager else {}
        
        # Streaming-Statistiken
        streaming_stats = {
            "active_sessions": len(streaming_sessions),
            "total_streaming_requests": sum(
                stats.get("usage_count", 0) for stats in model_usage_stats.values()
            ),
            "average_streaming_time": sum(
                stats.get("average_time", 0) for stats in model_usage_stats.values()
            ) / max(1, len(model_usage_stats))
        }
        
        # Batch-Statistiken
        cursor.execute(
            "SELECT generation_method, COUNT(*) FROM simple_ideas WHERE generation_method LIKE '%batch%' GROUP BY generation_method"
        )
        batch_methods = dict(cursor.fetchall())
        
        batch_stats = {
            "total_batch_requests": sum(batch_methods.values()),
            "batch_methods": batch_methods,
            "parallel_processing_enabled": True
        }
        
        conn.close()
        
        return Stats(
            total_ideas=total_ideas,
            categories=categories,
            average_rating=round(avg_rating, 2),
            recent_activity=recent_activity,
            model_stats=model_stats,
            streaming_stats=streaming_stats,
            batch_stats=batch_stats
        )
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Laden der Statistiken: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ideas/{idea_id}/rate")
async def rate_idea(idea_id: str, rating_data: dict):
    """Bewerte eine Idee"""
    try:
        rating = rating_data.get("rating")
        if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating muss zwischen 1 und 5 liegen")
        
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Überprüfe, ob die Idee existiert
        cursor.execute("SELECT id FROM simple_ideas WHERE id = ?", (idea_id,))
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=404, detail="Idee nicht gefunden")
        
        # Update das Rating
        cursor.execute(
            "UPDATE simple_ideas SET rating = ? WHERE id = ?",
            (rating, idea_id)
        )
        conn.commit()
        
        # Lade die aktualisierte Idee
        cursor.execute("""
            SELECT id, title, content, category, rating, generation_method,
                   model_used, created_at
            FROM simple_ideas WHERE id = ?
        """, (idea_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return IdeaResponse(
                id=row[0],
                title=row[1],
                content=row[2],
                category=row[3],
                rating=row[4],
                generation_method=row[5],
                model_used=row[6],
                created_at=row[7]
            )
        else:
            raise HTTPException(status_code=404, detail="Idee nicht gefunden")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Fehler beim Rating der Idee: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Gesundheitsprüfung"""
    model_status = "unknown"
    if model_manager:
        current_model = model_manager.get_current_model()
        model_status = f"loaded: {current_model}" if current_model else "no model loaded"
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_manager": model_manager is not None,
        "model_status": model_status,
        "available_models": model_manager.get_available_models() if model_manager else []
    }


def main():
    """Hauptfunktion"""
    try:
        logger.info("🚀 Starte Creative Muse AI Multi-Model Backend...")
        
        # Server-Konfiguration - auf allen Interfaces
        host = os.getenv("API_HOST", "0.0.0.0")
        port = int(os.getenv("API_PORT", 8000))
        
        uvicorn.run(
            app,
            host=host,
            port=port,
            log_level="info",
            access_log=True
        )
        
    except KeyboardInterrupt:
        logger.info("👋 Server durch Benutzer beendet")
    except Exception as e:
        logger.error(f"❌ Unerwarteter Fehler: {e}")
        raise


if __name__ == "__main__":
    main()