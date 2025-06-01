#!/usr/bin/env python3
"""
Creative Muse AI - Backend mit Mistral API (speicherschonend)
"""

import os
import sys
import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import json
import sqlite3
from datetime import datetime
import uuid
import asyncio
import httpx
from contextlib import asynccontextmanager

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Traduzioni per messaggi del backend
BACKEND_TRANSLATIONS = {
    "de": {
        "api_error": "API-Fehler aufgetreten",
        "database_error": "Datenbankfehler",
        "generation_error": "Fehler bei der Ideengenerierung",
        "invalid_request": "Ungültige Anfrage",
        "idea_saved": "Idee erfolgreich gespeichert",
        "idea_not_found": "Idee nicht gefunden",
        "rating_updated": "Bewertung aktualisiert",
        "backend_running": "Creative Muse AI Backend läuft",
        "database_connected": "Datenbank verbunden",
        "llm_ready": "KI-Modell bereit",
        "mock_mode": "Mock-Modus aktiv"
    },
    "en": {
        "api_error": "API error occurred",
        "database_error": "Database error",
        "generation_error": "Error during idea generation",
        "invalid_request": "Invalid request",
        "idea_saved": "Idea saved successfully",
        "idea_not_found": "Idea not found",
        "rating_updated": "Rating updated",
        "backend_running": "Creative Muse AI Backend running",
        "database_connected": "Database connected",
        "llm_ready": "AI model ready",
        "mock_mode": "Mock mode active"
    },
    "it": {
        "api_error": "Errore API verificato",
        "database_error": "Errore del database",
        "generation_error": "Errore durante la generazione dell'idea",
        "invalid_request": "Richiesta non valida",
        "idea_saved": "Idea salvata con successo",
        "idea_not_found": "Idea non trovata",
        "rating_updated": "Valutazione aggiornata",
        "backend_running": "Creative Muse AI Backend in esecuzione",
        "database_connected": "Database connesso",
        "llm_ready": "Modello IA pronto",
        "mock_mode": "Modalità mock attiva"
    },
    "fr": {
        "api_error": "Erreur API survenue",
        "database_error": "Erreur de base de données",
        "generation_error": "Erreur lors de la génération d'idée",
        "invalid_request": "Demande invalide",
        "idea_saved": "Idée sauvegardée avec succès",
        "idea_not_found": "Idée non trouvée",
        "rating_updated": "Évaluation mise à jour",
        "backend_running": "Creative Muse AI Backend en cours d'exécution",
        "database_connected": "Base de données connectée",
        "llm_ready": "Modèle IA prêt",
        "mock_mode": "Mode mock actif"
    },
    "es": {
        "api_error": "Error de API ocurrido",
        "database_error": "Error de base de datos",
        "generation_error": "Error durante la generación de idea",
        "invalid_request": "Solicitud inválida",
        "idea_saved": "Idea guardada exitosamente",
        "idea_not_found": "Idea no encontrada",
        "rating_updated": "Calificación actualizada",
        "backend_running": "Creative Muse AI Backend ejecutándose",
        "database_connected": "Base de datos conectada",
        "llm_ready": "Modelo IA listo",
        "mock_mode": "Modo mock activo"
    }
}

def get_translation(key: str, language: str = "de") -> str:
    """Obtiene traducción para un mensaje del backend"""
    return BACKEND_TRANSLATIONS.get(language, BACKEND_TRANSLATIONS["de"]).get(key, key)

# Globale Variablen
mistral_client = None

async def init_mistral_api():
    """Initialisiere Mistral API Client"""
    global mistral_client
    
    try:
        # Verwende Hugging Face Inference API für Mistral
        api_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
        
        if not api_token:
            logger.warning("⚠️  Kein Hugging Face Token gefunden. Verwende Mock-Implementation.")
            return False
        
        mistral_client = httpx.AsyncClient(
            base_url="https://api-inference.huggingface.co/models",
            headers={"Authorization": f"Bearer {api_token}"},
            timeout=30.0
        )
        
        # Test API Verbindung
        response = await mistral_client.post(
            "/mistralai/Mistral-7B-Instruct-v0.3",
            json={"inputs": "Test", "parameters": {"max_new_tokens": 10}}
        )
        
        if response.status_code == 200:
            logger.info("✅ Mistral API erfolgreich verbunden")
            return True
        else:
            logger.warning(f"⚠️  Mistral API Test fehlgeschlagen: {response.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Fehler bei Mistral API Initialisierung: {e}")
        return False

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup und Shutdown Events"""
    # Startup
    logger.info("🚀 Starte Creative Muse AI Backend mit Mistral API...")
    
    # Datenbank initialisieren
    init_simple_db()
    
    # Mistral API initialisieren
    api_ready = await init_mistral_api()
    if api_ready:
        logger.info("✅ Mistral API bereit")
    else:
        logger.warning("⚠️  Fallback auf Mock-Implementation")
    
    yield
    
    # Shutdown
    logger.info("🛑 Backend wird beendet...")
    if mistral_client:
        await mistral_client.aclose()

# FastAPI App
app = FastAPI(
    title="Creative Muse AI",
    description="AI-powered Creative Idea Generation Platform with Mistral API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Datenmodelle
class IdeaRequest(BaseModel):
    prompt: str
    category: Optional[str] = "general"
    creativity_level: Optional[int] = 5
    language: Optional[str] = "it"  # it, en, de, fr, es
    use_llm: Optional[bool] = True
    use_typing: Optional[bool] = False

class RandomIdeaRequest(BaseModel):
    category: Optional[str] = "general"
    language: Optional[str] = "it"

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
    recent_ideas: int
    average_rating: float
    categories: dict
    llm_ideas: int
    mock_ideas: int

# Globale Variablen
db_path = Path("../database/creative_muse.db")

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
    """Erstelle optimierten Prompt für Mistral API"""
    
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
        },
        "fr": {
            "system": "Vous êtes un assistant IA créatif qui génère des idées innovantes et pratiques.",
            "instruction": f"Générez une idée créative pour la catégorie '{category}' basée sur : '{prompt}'. "
                          f"Niveau de créativité : {creativity_level}/10. "
                          f"Répondez avec un titre concis et une description détaillée.",
        },
        "es": {
            "system": "Eres un asistente de IA creativo que genera ideas innovadoras y prácticas.",
            "instruction": f"Genera una idea creativa para la categoría '{category}' basada en: '{prompt}'. "
                          f"Nivel de creatividad: {creativity_level}/10. "
                          f"Responde con un título conciso y una descripción detallada.",
        }
    }
    
    lang_config = language_prompts.get(language, language_prompts["de"])
    
    # Mistral-Chat-Format für API
    formatted_prompt = f"<s>[INST] {lang_config['system']}\n\n{lang_config['instruction']} [/INST]"
    
    return formatted_prompt

async def generate_with_mistral_api(prompt: str, category: str, language: str, creativity_level: int) -> dict:
    """Generiere Idee mit Mistral API"""
    
    if not mistral_client:
        # Fallback auf Mock-Implementation
        return generate_mock_idea(prompt, category, language, creativity_level)
    
    try:
        # Prompt erstellen
        formatted_prompt = create_mistral_prompt(prompt, category, language, creativity_level)
        
        # Generierungs-Parameter basierend auf Kreativitätslevel
        temperature = 0.3 + (creativity_level / 10) * 0.7  # 0.3 bis 1.0
        top_p = 0.8 + (creativity_level / 10) * 0.2  # 0.8 bis 1.0
        
        # API Request
        response = await mistral_client.post(
            "/mistralai/Mistral-7B-Instruct-v0.3",
            json={
                "inputs": formatted_prompt,
                "parameters": {
                    "max_new_tokens": 512,
                    "temperature": temperature,
                    "top_p": top_p,
                    "do_sample": True,
                    "return_full_text": False
                }
            }
        )
        
        if response.status_code != 200:
            error_text = response.text if hasattr(response, 'text') else 'Unknown error'
            logger.error(f"❌ Mistral API Fehler: {response.status_code} - {error_text}")
            return generate_mock_idea(prompt, category, language, creativity_level)
        
        result = response.json()
        logger.info(f"✅ Mistral API Response: {result}")
        
        if not result or not isinstance(result, list) or len(result) == 0:
            logger.error("❌ Mistral API returned empty or invalid response")
            return generate_mock_idea(prompt, category, language, creativity_level)
            
        generated_text = result[0]['generated_text'].strip()
        
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
            "generation_method": "mistral-7b-api"
        }
        
    except Exception as e:
        logger.error(f"❌ Fehler bei Mistral API Generierung: {type(e).__name__}: {str(e)}")
        logger.error(f"❌ Prompt war: {formatted_prompt[:100]}...")
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
        ],
        "fr": [
            "Solution Innovante pour les Défis Modernes",
            "Fusion Créative de Technologie et Durabilité",
            "Approche Révolutionnaire pour la Vie Quotidienne",
            "Plateforme Intelligente pour la Construction Communautaire",
            "Innovation Durable avec Support IA"
        ],
        "es": [
            "Solución Innovadora para Desafíos Modernos",
            "Fusión Creativa de Tecnología y Sostenibilidad",
            "Enfoque Revolucionario para la Vida Diaria",
            "Plataforma Inteligente para Construcción de Comunidad",
            "Innovación Sostenible con Soporte IA"
        ]
    }
    
    title = random.choice(mock_titles.get(language, mock_titles["de"]))
    
    content_template = {
        "de": f"Diese innovative Idee basiert auf '{prompt}' und kombiniert {category} mit modernen Technologien. "
              f"Mit einem Kreativitätslevel von {creativity_level} entstehen völlig neue Möglichkeiten.",
        "en": f"This innovative idea is based on '{prompt}' and combines {category} with modern technologies. "
              f"With a creativity level of {creativity_level}, completely new possibilities emerge.",
        "it": f"Questa idea innovativa si basa su '{prompt}' e combina {category} con tecnologie moderne. "
              f"Con un livello di creatività di {creativity_level}, emergono possibilità completamente nuove.",
        "fr": f"Cette idée innovante est basée sur '{prompt}' et combine {category} avec des technologies modernes. "
              f"Avec un niveau de créativité de {creativity_level}, des possibilités complètement nouvelles émergent.",
        "es": f"Esta idea innovadora se basa en '{prompt}' y combina {category} con tecnologías modernas. "
              f"Con un nivel de creatividad de {creativity_level}, surgen posibilidades completamente nuevas."
    }
    
    return {
        "title": title,
        "content": content_template.get(language, content_template["de"]),
        "generation_method": "mock"
    }

# API Endpunkte
@app.get("/")
async def root(language: str = "it"):
    """Root endpoint"""
    return {
        "message": get_translation("backend_running", language),
        "version": "1.0.0",
        "status": "running",
        "model": "mistral-7b-api" if mistral_client else "mock",
        "model_status": get_translation("llm_ready" if mistral_client else "mock_mode", language),
        "database_status": get_translation("database_connected", language),
        "supported_languages": ["it", "en", "de", "fr", "es"],
        "endpoints": {
            "generate": "/api/v1/generate",
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
        if request.use_llm and mistral_client:
            idea_data = await generate_with_mistral_api(
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
        error_message = get_translation("generation_error", request.language)
        raise HTTPException(status_code=500, detail=error_message)

@app.post("/api/v1/random", response_model=IdeaResponse)
async def generate_random_idea(request: RandomIdeaRequest):
    """Generiere zufällige Idee"""
    random_prompts = {
        "de": [
            "Zukunft der Arbeit", "Nachhaltigkeit", "Künstliche Intelligenz",
            "Gemeinschaft", "Innovation", "Kreativität", "Technologie",
            "Umwelt", "Bildung", "Gesundheit"
        ],
        "en": [
            "Future of Work", "Sustainability", "Artificial Intelligence",
            "Community", "Innovation", "Creativity", "Technology",
            "Environment", "Education", "Health"
        ],
        "it": [
            "Futuro del Lavoro", "Sostenibilità", "Intelligenza Artificiale",
            "Comunità", "Innovazione", "Creatività", "Tecnologia",
            "Ambiente", "Educazione", "Salute"
        ],
        "fr": [
            "Avenir du Travail", "Durabilité", "Intelligence Artificielle",
            "Communauté", "Innovation", "Créativité", "Technologie",
            "Environnement", "Éducation", "Santé"
        ],
        "es": [
            "Futuro del Trabajo", "Sostenibilidad", "Inteligencia Artificial",
            "Comunidad", "Innovación", "Creatividad", "Tecnología",
            "Medio Ambiente", "Educación", "Salud"
        ]
    }
    
    import random
    prompts_for_lang = random_prompts.get(request.language, random_prompts["it"])
    random_prompt = random.choice(prompts_for_lang)
    
    idea_request = IdeaRequest(
        prompt=random_prompt,
        category=request.category,
        language=request.language,
        creativity_level=random.randint(6, 9),
        use_llm=True
    )
    
    return await generate_idea(idea_request)

@app.get("/api/v1/ideas", response_model=List[IdeaResponse])
async def get_ideas(limit: int = 50, category: Optional[str] = None, language: str = "it"):
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
        error_message = get_translation("database_error", language)
        raise HTTPException(status_code=500, detail=error_message)

@app.get("/api/v1/stats", response_model=Stats)
async def get_stats(language: str = "it"):
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
        recent_ideas = cursor.fetchone()[0]
        
        # LLM vs Mock Ideen
        cursor.execute("SELECT COUNT(*) FROM simple_ideas WHERE generation_method = 'llm'")
        llm_ideas = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM simple_ideas WHERE generation_method IN ('mock', 'random')")
        mock_ideas = cursor.fetchone()[0]
        
        conn.close()
        
        return Stats(
            total_ideas=total_ideas,
            recent_ideas=recent_ideas,
            average_rating=round(avg_rating, 2),
            categories=categories,
            llm_ideas=llm_ideas,
            mock_ideas=mock_ideas
        )
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Laden der Statistiken: {e}")
        error_message = get_translation("database_error", language)
        raise HTTPException(status_code=500, detail=error_message)

@app.get("/health")
async def health_check():
    """Health Check"""
    return {
        "status": "healthy",
        "llm_status": "api-ready" if mistral_client else "mock",
        "model": "mistral-7b-api" if mistral_client else "mock",
        "database": "connected"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main_mistral_api:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )