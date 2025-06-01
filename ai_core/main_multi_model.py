#!/usr/bin/env python3
"""
Creative Muse AI - Multi-Model Backend
FastAPI-basiertes Backend mit Multi-Model-Support
"""

import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
import sqlite3

import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Lokale Imports
from model_manager import ModelManager

# Lade Umgebungsvariablen
load_dotenv("../.env")

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


class ModelSwitchRequest(BaseModel):
    model_key: str


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


class Stats(BaseModel):
    total_ideas: int
    categories: Dict[str, int]
    average_rating: float
    recent_activity: int
    model_stats: Dict[str, Any]


# Globale Variablen
db_path = Path("../database/creative_muse.db")


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


def create_optimized_prompt(prompt: str, category: str, language: str, creativity_level: int) -> str:
    """Erstelle optimierten Prompt für verschiedene Modelle"""
    
    language_prompts = {
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
    
    lang_config = language_prompts.get(language, language_prompts["de"])
    return f"{lang_config['system']}\n\n{lang_config['instruction']}"


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
            "random": "/api/v1/random",
            "models": "/api/v1/models",
            "switch_model": "/api/v1/models/switch",
            "ideas": "/api/v1/ideas",
            "stats": "/api/v1/stats",
            "health": "/health"
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
        
        conn.close()
        
        # Model-Statistiken
        model_stats = model_manager.get_statistics() if model_manager else {}
        
        return Stats(
            total_ideas=total_ideas,
            categories=categories,
            average_rating=round(avg_rating, 2),
            recent_activity=recent_activity,
            model_stats=model_stats
        )
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Laden der Statistiken: {e}")
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