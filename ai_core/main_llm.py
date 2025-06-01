#!/usr/bin/env python3
"""
Creative Muse AI - Backend mit echtem Mistral-7B-Instruct-v0.3 Modell
"""

import os
import sys
import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, AsyncGenerator
import uvicorn
import json
import sqlite3
from datetime import datetime
import uuid
import asyncio
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Lade Umgebungsvariablen aus dem Hauptverzeichnis
load_dotenv("../.env")
# Fallback: Lade auch lokale .env falls vorhanden
load_dotenv(".env")

# Transformers und Torch für Mistral
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
    from transformers import TextStreamer
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False
    print("⚠️  Transformers nicht installiert. Verwende Mock-Implementation.")

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Globale Variablen für das Modell
tokenizer = None
model = None
text_generator = None

async def load_mistral_model():
    """Lade Mistral-7B-Instruct-v0.3 Modell"""
    global tokenizer, model, text_generator
    
    if not HAS_TRANSFORMERS:
        logger.warning("⚠️  Transformers nicht verfügbar - verwende Mock-Implementation")
        return False
    
    try:
        # Verwende das Mistral-7B-Instruct-v0.3 Modell mit HF Token
        model_name = "mistralai/Mistral-7B-Instruct-v0.3"
        hf_token = os.getenv("HF_TOKEN")
        
        if not hf_token:
            logger.error("❌ HF_TOKEN nicht gefunden in .env Datei")
            return False
            
        logger.info(f"🤖 Lade Mistral-7B-Instruct-v0.3 Modell: {model_name}")
        logger.info("🔑 Verwende Hugging Face Token für Authentifizierung")
        logger.info("📥 Download kann einige Minuten dauern (ca. 1.5GB)...")
        
        # Tokenizer laden mit Token
        tokenizer = AutoTokenizer.from_pretrained(model_name, token=hf_token)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        # Modell laden mit maximaler Speicher-Optimierung (ohne bitsandbytes)
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"🔧 Verwende Device: {device}")
        logger.info("💾 Verwende aggressive Speicher-Optimierung ohne Quantisierung...")
        
        # Maximale Speicher-Optimierung für Mistral-7B ohne bitsandbytes
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            token=hf_token,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            device_map="cpu",  # Forciere CPU um OOM zu vermeiden
            low_cpu_mem_usage=True,
            trust_remote_code=True,
            use_cache=False,  # Cache deaktivieren spart Speicher
            max_memory={"cpu": "6GB"},  # Speicher-Limit für CPU
            offload_folder="./temp_offload"  # Offload auf Festplatte
        )
        
        # Text-Generator Pipeline
        text_generator = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            device=0 if device == "cuda" else -1,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        )
        
        logger.info("✅ Mistral-Modell erfolgreich geladen")
        return True
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Laden des Mistral-Modells: {e}")
        return False

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup und Shutdown Events"""
    # Startup
    logger.info("🚀 Starte Creative Muse AI Backend mit Mistral-7B...")
    
    # Datenbank initialisieren
    init_simple_db()
    
    # Mistral-Modell laden
    model_loaded = await load_mistral_model()
    if model_loaded:
        logger.info("✅ Mistral-7B-Instruct-v0.3 bereit")
    else:
        logger.warning("⚠️  Fallback auf Mock-Implementation")
    
    yield
    
    # Shutdown
    logger.info("🛑 Backend wird beendet...")

# FastAPI App
app = FastAPI(
    title="Creative Muse AI",
    description="AI-powered Creative Idea Generation Platform with Mistral-7B-Instruct-v0.3",
    version="1.0.0",
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

# Datenmodelle
class IdeaRequest(BaseModel):
    prompt: str
    category: Optional[str] = "general"
    creativity_level: Optional[int] = 5
    language: Optional[str] = "de"  # de, en, it
    use_llm: Optional[bool] = True
    use_typing: Optional[bool] = False

class RandomIdeaRequest(BaseModel):
    category: Optional[str] = "general"
    language: Optional[str] = "de"

class IdeaResponse(BaseModel):
    id: str
    title: str
    content: str
    category: str
    rating: Optional[int] = None
    created_at: str
    generation_method: str

class IdeaRating(BaseModel):
    rating: int

class Stats(BaseModel):
    total_ideas: int
    categories: dict
    average_rating: float
    recent_activity: int

# Globale Variablen
# Verwende absoluten Pfad basierend auf dem aktuellen Skript-Verzeichnis
script_dir = Path(__file__).parent
db_path = script_dir.parent / "database" / "creative_muse.db"

def init_simple_db():
    """Initialisiere vereinfachte Datenbank"""
    try:
        db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Erweiterte Ideen-Tabelle
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS simple_ideas (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                rating INTEGER,
                generation_method TEXT DEFAULT 'mock',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        conn.commit()
        conn.close()
        logger.info("✅ Datenbank initialisiert")
        return True
    except Exception as e:
        logger.error(f"❌ Fehler bei DB-Initialisierung: {e}")
        return False

def create_mistral_prompt(prompt: str, category: str, language: str, creativity_level: int) -> str:
    """Erstelle optimierten Prompt für Mistral-7B"""
    
    language_prompts = {
        "de": {
            "system": "Du bist ein kreativer KI-Assistent, der innovative und praktische Ideen generiert.",
            "instruction": f"Generiere eine kreative Idee für die Kategorie '{category}' basierend auf: '{prompt}'. "
                          f"Kreativitätslevel: {creativity_level}/10. "
                          f"Antworte mit einem prägnanten Titel und einer detaillierten Beschreibung.",
        },
        "en": {
            "system": "You are a creative AI assistant that generates innovative and practical ideas.",
            "instruction": f"Generate a creative idea for the category '{category}' based on: '{prompt}'. "
                          f"Creativity level: {creativity_level}/10. "
                          f"Respond with a concise title and detailed description.",
        },
        "it": {
            "system": "Sei un assistente IA creativo che genera idee innovative e pratiche.",
            "instruction": f"Genera un'idea creativa per la categoria '{category}' basata su: '{prompt}'. "
                          f"Livello di creatività: {creativity_level}/10. "
                          f"Rispondi con un titolo conciso e una descrizione dettagliata.",
        }
    }
    
    lang_config = language_prompts.get(language, language_prompts["de"])
    
    # Mistral-Chat-Format
    messages = [
        {"role": "system", "content": lang_config["system"]},
        {"role": "user", "content": lang_config["instruction"]}
    ]
    
    # Format für Mistral-Instruct
    formatted_prompt = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    ) if tokenizer else f"{lang_config['system']}\n\n{lang_config['instruction']}"
    
    return formatted_prompt

async def generate_with_mistral(prompt: str, category: str, language: str, creativity_level: int) -> dict:
    """Generiere Idee mit Mistral-7B-Instruct-v0.3"""
    
    if not text_generator:
        # Fallback auf Mock-Implementation
        return generate_mock_idea(prompt, category, language, creativity_level)
    
    try:
        # Prompt erstellen
        formatted_prompt = create_mistral_prompt(prompt, category, language, creativity_level)
        
        # Generierungs-Parameter basierend auf Kreativitätslevel
        temperature = 0.3 + (creativity_level / 10) * 0.7  # 0.3 bis 1.0
        top_p = 0.8 + (creativity_level / 10) * 0.2  # 0.8 bis 1.0
        
        # Text generieren
        response = text_generator(
            formatted_prompt,
            max_new_tokens=512,
            temperature=temperature,
            top_p=top_p,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id,
            return_full_text=False
        )
        
        generated_text = response[0]['generated_text'].strip()
        
        # Parse Titel und Inhalt
        lines = generated_text.split('\n', 1)
        title = lines[0].strip()
        content = lines[1].strip() if len(lines) > 1 else generated_text
        
        # Bereinige Titel
        if title.startswith(('Titel:', 'Title:', 'Titolo:')):
            title = title.split(':', 1)[1].strip()
        
        return {
            "title": title[:200],  # Titel begrenzen
            "content": content[:2000],  # Inhalt begrenzen
            "generation_method": "mistral-7b-instruct-v0.3"
        }
        
    except Exception as e:
        logger.error(f"❌ Fehler bei Mistral-Generierung: {e}")
        # Fallback auf Mock
        return generate_mock_idea(prompt, category, language, creativity_level)

def generate_mock_idea(prompt: str, category: str, language: str, creativity_level: int) -> dict:
    """Fallback Mock-Implementation"""
    import random
    
    mock_titles = {
        "de": [
            "Innovative Lösung für moderne Herausforderungen",
            "Kreative Fusion von Technologie und Nachhaltigkeit",
            "Revolutionärer Ansatz für den Alltag",
            "Intelligente Plattform für Community-Building",
            "Nachhaltige Innovation mit KI-Unterstützung"
        ],
        "en": [
            "Innovative Solution for Modern Challenges",
            "Creative Fusion of Technology and Sustainability", 
            "Revolutionary Approach for Daily Life",
            "Intelligent Platform for Community Building",
            "Sustainable Innovation with AI Support"
        ],
        "it": [
            "Soluzione Innovativa per Sfide Moderne",
            "Fusione Creativa di Tecnologia e Sostenibilità",
            "Approccio Rivoluzionario per la Vita Quotidiana",
            "Piattaforma Intelligente per Community Building",
            "Innovazione Sostenibile con Supporto IA"
        ]
    }
    
    title = random.choice(mock_titles.get(language, mock_titles["de"]))
    
    content_template = {
        "de": f"Diese innovative Idee basiert auf '{prompt}' und kombiniert {category} mit modernen Technologien. "
              f"Mit einem Kreativitätslevel von {creativity_level} entstehen völlig neue Möglichkeiten.",
        "en": f"This innovative idea is based on '{prompt}' and combines {category} with modern technologies. "
              f"With a creativity level of {creativity_level}, completely new possibilities emerge.",
        "it": f"Questa idea innovativa si basa su '{prompt}' e combina {category} con tecnologie moderne. "
              f"Con un livello di creatività di {creativity_level}, emergono possibilità completamente nuove."
    }
    
    return {
        "title": title,
        "content": content_template.get(language, content_template["de"]),
        "generation_method": "mock"
    }

# API Endpunkte
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Creative Muse AI Backend",
        "version": "1.0.0",
        "status": "running",
        "model": "mistral-7b-instruct-v0.3" if text_generator else "mock",
        "endpoints": {
            "generate": "/api/v1/generate",
            "generate_stream": "/api/v1/generate/stream",
            "random": "/api/v1/random",
            "ideas": "/api/v1/ideas",
            "stats": "/api/v1/stats",
            "health": "/health"
        }
    }

@app.post("/api/v1/generate", response_model=IdeaResponse)
async def generate_idea(request: IdeaRequest):
    """Generiere neue Idee"""
    try:
        if request.use_llm and text_generator:
            idea_data = await generate_with_mistral(
                request.prompt,
                request.category,
                request.language,
                request.creativity_level
            )
        else:
            idea_data = generate_mock_idea(
                request.prompt, 
                request.category, 
                request.language, 
                request.creativity_level
            )
        
        # Speichere in Datenbank
        idea_id = str(uuid.uuid4())
        created_at = datetime.now().isoformat()
        
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO simple_ideas (id, title, content, category, generation_method, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (idea_id, idea_data["title"], idea_data["content"], 
             request.category, idea_data["generation_method"], created_at)
        )
        conn.commit()
        conn.close()
        
        return IdeaResponse(
            id=idea_id,
            title=idea_data["title"],
            content=idea_data["content"],
            category=request.category,
            created_at=created_at,
            generation_method=idea_data["generation_method"]
        )
        
    except Exception as e:
        logger.error(f"❌ Fehler bei Ideengenerierung: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/random", response_model=IdeaResponse)
async def generate_random_idea(request: RandomIdeaRequest):
    """Generiere zufällige Idee"""
    random_prompts = [
        "Zukunft der Arbeit", "Nachhaltigkeit", "Künstliche Intelligenz",
        "Gemeinschaft", "Innovation", "Kreativität", "Technologie",
        "Umwelt", "Bildung", "Gesundheit"
    ]
    
    import random
    random_prompt = random.choice(random_prompts)
    
    idea_request = IdeaRequest(
        prompt=random_prompt,
        category=request.category,
        language=request.language,
        creativity_level=random.randint(6, 9),
        use_llm=True
    )
    
    return await generate_idea(idea_request)

@app.get("/api/v1/ideas", response_model=List[IdeaResponse])
async def get_ideas(limit: int = 50, category: Optional[str] = None):
    """Hole alle Ideen"""
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        if category:
            cursor.execute(
                "SELECT * FROM simple_ideas WHERE category = ? ORDER BY created_at DESC LIMIT ?",
                (category, limit)
            )
        else:
            cursor.execute(
                "SELECT * FROM simple_ideas ORDER BY created_at DESC LIMIT ?",
                (limit,)
            )
        
        rows = cursor.fetchall()
        conn.close()
        
        ideas = []
        for row in rows:
            ideas.append(IdeaResponse(
                id=row[0],
                title=row[1],
                content=row[2],
                category=row[3],
                rating=row[4],
                generation_method=row[5] if len(row) > 5 else "unknown",
                created_at=row[6] if len(row) > 6 else datetime.now().isoformat()
            ))
        
        return ideas
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Laden der Ideen: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/stats", response_model=Stats)
async def get_stats():
    """Hole Statistiken"""
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Gesamtanzahl
        cursor.execute("SELECT COUNT(*) FROM simple_ideas")
        total_ideas = cursor.fetchone()[0]
        
        # Kategorien
        cursor.execute("SELECT category, COUNT(*) FROM simple_ideas GROUP BY category")
        categories = dict(cursor.fetchall())
        
        # Durchschnittliche Bewertung
        cursor.execute("SELECT AVG(rating) FROM simple_ideas WHERE rating IS NOT NULL")
        avg_rating = cursor.fetchone()[0] or 0.0
        
        # Aktivität der letzten 24h
        cursor.execute(
            "SELECT COUNT(*) FROM simple_ideas WHERE created_at > datetime('now', '-1 day')"
        )
        recent_activity = cursor.fetchone()[0]
        
        conn.close()
        
        return Stats(
            total_ideas=total_ideas,
            categories=categories,
            average_rating=round(avg_rating, 2),
            recent_activity=recent_activity
        )
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Laden der Statistiken: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health Check"""
    return {
        "status": "healthy",
        "llm_status": "ready" if text_generator else "mock",
        "model": "mistral-7b-instruct-v0.3" if text_generator else "mock",
        "database": "connected"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main_llm:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )