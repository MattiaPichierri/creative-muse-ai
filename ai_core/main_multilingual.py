#!/usr/bin/env python3
"""
Creative Muse AI - Erweiterte mehrsprachige Backend-API
"""

import os
import sys
import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
import json
import sqlite3
from datetime import datetime, timedelta
import uuid
import random

# Import der Mehrsprachigkeits-Unterstützung
from multilingual_support import multilingual

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# FastAPI App
app = FastAPI(
    title="Creative Muse AI - Multilingual",
    description="AI-powered Creative Idea Generation Platform with Multi-language Support",
    version="2.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Erweiterte Datenmodelle
class IdeaRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000, description="The creative prompt")
    category: Optional[str] = Field("general", description="Idea category")
    creativity_level: Optional[int] = Field(5, ge=1, le=10, description="Creativity level (1-10)")
    language: Optional[str] = Field("de", description="Response language (de, en, it, fr, es)")
    template_type: Optional[str] = Field(None, description="Predefined template type")

class IdeaResponse(BaseModel):
    id: str
    title: str
    content: str
    category: str
    localized_category: str
    rating: Optional[int] = None
    created_at: str
    generation_method: str = "multilingual_ai"
    language: str
    creativity_level: int

class IdeaRating(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")

class StatsResponse(BaseModel):
    total_ideas: int
    recent_ideas: int
    average_rating: float
    categories: Dict[str, int]
    llm_ideas: int
    mock_ideas: int
    languages: Dict[str, int]
    updated_at: str

class LanguageInfo(BaseModel):
    code: str
    name: str
    supported: bool

class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

# Globale Variablen
db_path = Path("../database/creative_muse.db")

def init_multilingual_db():
    """Initialisiere erweiterte mehrsprachige Datenbank"""
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Erweiterte Ideen-Tabelle mit Sprachunterstützung
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS multilingual_ideas (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                localized_category TEXT,
                rating INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                generation_method TEXT DEFAULT 'multilingual_ai',
                language TEXT DEFAULT 'de',
                creativity_level INTEGER DEFAULT 5,
                prompt TEXT,
                template_type TEXT
            )
        """)

        # Statistiken-Tabelle
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS multilingual_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                total_ideas INTEGER DEFAULT 0,
                recent_ideas INTEGER DEFAULT 0,
                average_rating REAL DEFAULT 0.0,
                categories TEXT DEFAULT '{}',
                languages TEXT DEFAULT '{}',
                llm_ideas INTEGER DEFAULT 0,
                mock_ideas INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()
        conn.close()
        logger.info("✅ Erweiterte mehrsprachige Datenbank initialisiert")
        return True
    except Exception as e:
        logger.error(f"❌ Fehler bei DB-Initialisierung: {e}")
        return False

def generate_enhanced_idea(request: IdeaRequest) -> dict:
    """Generiere erweiterte kreative Idee mit Mehrsprachigkeits-Support"""
    
    # Validiere und normalisiere Sprache
    language = multilingual.validate_language(request.language)
    
    # Erweiterte Mock-Ideen mit mehr Kategorien und Sprachen
    enhanced_ideas = {
        "de": {
            "business": [
                "KI-gestützte Nachhaltigkeitsberatung für KMUs",
                "Blockchain-basierte Tauschbörse für lokale Dienstleistungen", 
                "AR-Shopping-Erlebnis für lokale Geschäfte",
                "Peer-to-Peer Energiehandel mit Smart Contracts",
                "Digitale Genossenschaft für urbane Landwirtschaft",
                "Mikro-Investitionsplattform für Kreativprojekte",
                "KI-Matchmaking für Geschäftspartnerschaften"
            ],
            "technology": [
                "Quantencomputing für Klimamodellierung",
                "Biometrische Authentifizierung mit Herzrhythmus",
                "Edge-Computing für autonome Drohnenschwärme",
                "Neuromorphe Chips für energieeffiziente KI",
                "Holographische Displays für 3D-Kollaboration",
                "DNA-Datenspeicher für Langzeitarchivierung",
                "Optische Computer für ultraschnelle Berechnungen"
            ],
            "art": [
                "Synergetische Kunstinstallationen mit Biosensoren",
                "Kollaborative VR-Skulptur in Echtzeit",
                "Generative Musik aus Stadtgeräuschen",
                "Interaktive Lichtpoesie mit Spracherkennung",
                "Augmented Reality Straßenkunst",
                "KI-komponierte Symphonien aus Emotionen",
                "Haptische Kunstwerke für Sehbehinderte"
            ],
            "wellness": [
                "Personalisierte Meditation mit Brainwave-Feedback",
                "Aromatherapie-Diffuser mit Stimmungsanalyse",
                "Biofeedback-Yoga mit Echtzeit-Anpassung",
                "Circadiane Lichttherapie für Schichtarbeiter",
                "KI-Ernährungscoach mit Mikrobiom-Analyse",
                "Virtuelle Naturtherapie für Stadtbewohner",
                "Soziale Fitness-Challenges mit Gamification"
            ]
        },
        "en": {
            "business": [
                "AI-powered sustainability consulting for SMEs",
                "Blockchain-based exchange for local services",
                "AR shopping experience for local stores", 
                "Peer-to-peer energy trading with smart contracts",
                "Digital cooperative for urban agriculture",
                "Micro-investment platform for creative projects",
                "AI matchmaking for business partnerships"
            ],
            "technology": [
                "Quantum computing for climate modeling",
                "Biometric authentication with heart rhythm",
                "Edge computing for autonomous drone swarms",
                "Neuromorphic chips for energy-efficient AI",
                "Holographic displays for 3D collaboration",
                "DNA data storage for long-term archiving",
                "Optical computers for ultra-fast calculations"
            ],
            "art": [
                "Synergetic art installations with biosensors",
                "Collaborative VR sculpture in real-time",
                "Generative music from city sounds",
                "Interactive light poetry with voice recognition",
                "Augmented Reality street art",
                "AI-composed symphonies from emotions",
                "Haptic artworks for the visually impaired"
            ],
            "wellness": [
                "Personalized meditation with brainwave feedback",
                "Aromatherapy diffuser with mood analysis",
                "Biofeedback yoga with real-time adaptation",
                "Circadian light therapy for shift workers",
                "AI nutrition coach with microbiome analysis",
                "Virtual nature therapy for city dwellers",
                "Social fitness challenges with gamification"
            ]
        },
        "it": {
            "business": [
                "Consulenza sostenibilità basata su IA per PMI",
                "Piattaforma blockchain per servizi locali",
                "Esperienza shopping AR per negozi locali",
                "Trading energetico peer-to-peer con smart contract",
                "Cooperativa digitale per agricoltura urbana",
                "Piattaforma micro-investimenti per progetti creativi",
                "Matchmaking IA per partnership aziendali"
            ],
            "technology": [
                "Quantum computing per modellazione climatica",
                "Autenticazione biometrica con ritmo cardiaco",
                "Edge computing per sciami di droni autonomi",
                "Chip neuromorfici per IA efficiente",
                "Display olografici per collaborazione 3D",
                "Storage dati DNA per archiviazione a lungo termine",
                "Computer ottici per calcoli ultra-veloci"
            ],
            "art": [
                "Installazioni artistiche sinergiche con biosensori",
                "Scultura VR collaborativa in tempo reale",
                "Musica generativa da suoni urbani",
                "Poesia luminosa interattiva con riconoscimento vocale",
                "Street art in Realtà Aumentata",
                "Sinfonie composte da IA dalle emozioni",
                "Opere d'arte tattili per non vedenti"
            ],
            "wellness": [
                "Meditazione personalizzata con feedback onde cerebrali",
                "Diffusore aromaterapia con analisi umore",
                "Yoga biofeedback con adattamento tempo reale",
                "Terapia luce circadiana per lavoratori turni",
                "Coach nutrizionale IA con analisi microbioma",
                "Terapia natura virtuale per abitanti città",
                "Sfide fitness sociali con gamification"
            ]
        },
        "fr": {
            "business": [
                "Conseil en durabilité basé sur IA pour PME",
                "Plateforme blockchain pour services locaux",
                "Expérience shopping AR pour magasins locaux",
                "Trading énergétique peer-to-peer avec smart contracts",
                "Coopérative numérique pour agriculture urbaine",
                "Plateforme micro-investissement pour projets créatifs",
                "Matchmaking IA pour partenariats d'affaires"
            ],
            "technology": [
                "Informatique quantique pour modélisation climatique",
                "Authentification biométrique avec rythme cardiaque",
                "Edge computing pour essaims de drones autonomes",
                "Puces neuromorphiques pour IA efficace",
                "Écrans holographiques pour collaboration 3D",
                "Stockage données ADN pour archivage long terme",
                "Ordinateurs optiques pour calculs ultra-rapides"
            ],
            "art": [
                "Installations artistiques synergiques avec biocapteurs",
                "Sculpture VR collaborative en temps réel",
                "Musique générative à partir de sons urbains",
                "Poésie lumineuse interactive avec reconnaissance vocale",
                "Art de rue en Réalité Augmentée",
                "Symphonies composées par IA à partir d'émotions",
                "Œuvres d'art haptiques pour malvoyants"
            ],
            "wellness": [
                "Méditation personnalisée avec feedback ondes cérébrales",
                "Diffuseur aromathérapie avec analyse humeur",
                "Yoga biofeedback avec adaptation temps réel",
                "Thérapie lumière circadienne pour travailleurs postes",
                "Coach nutrition IA avec analyse microbiome",
                "Thérapie nature virtuelle pour citadins",
                "Défis fitness sociaux avec gamification"
            ]
        },
        "es": {
            "business": [
                "Consultoría sostenibilidad basada en IA para PYMES",
                "Plataforma blockchain para servicios locales",
                "Experiencia shopping AR para tiendas locales",
                "Trading energético peer-to-peer con smart contracts",
                "Cooperativa digital para agricultura urbana",
                "Plataforma micro-inversión para proyectos creativos",
                "Matchmaking IA para partnerships empresariales"
            ],
            "technology": [
                "Computación cuántica para modelado climático",
                "Autenticación biométrica con ritmo cardíaco",
                "Edge computing para enjambres drones autónomos",
                "Chips neuromórficos para IA eficiente",
                "Pantallas holográficas para colaboración 3D",
                "Almacenamiento datos ADN para archivo largo plazo",
                "Computadoras ópticas para cálculos ultra-rápidos"
            ],
            "art": [
                "Instalaciones artísticas sinérgicas con biosensores",
                "Escultura VR colaborativa en tiempo real",
                "Música generativa de sonidos urbanos",
                "Poesía lumínica interactiva con reconocimiento voz",
                "Arte callejero en Realidad Aumentada",
                "Sinfonías compuestas por IA desde emociones",
                "Obras arte hápticas para discapacitados visuales"
            ],
            "wellness": [
                "Meditación personalizada con feedback ondas cerebrales",
                "Difusor aromaterapia con análisis humor",
                "Yoga biofeedback con adaptación tiempo real",
                "Terapia luz circadiana para trabajadores turnos",
                "Coach nutrición IA con análisis microbioma",
                "Terapia naturaleza virtual para habitantes ciudad",
                "Desafíos fitness sociales con gamificación"
            ]
        }
    }

    # Wähle passende Kategorie und Sprache
    if request.category not in enhanced_ideas[language]:
        category = "business"  # Fallback
    else:
        category = request.category

    # Generiere Titel
    base_ideas = enhanced_ideas[language][category]
    selected_idea = random.choice(base_ideas)
    
    # Erweitere Titel basierend auf Prompt
    if request.prompt:
        title_templates = {
            "de": f"{selected_idea} - inspiriert von '{request.prompt[:50]}{'...' if len(request.prompt) > 50 else ''}'",
            "en": f"{selected_idea} - inspired by '{request.prompt[:50]}{'...' if len(request.prompt) > 50 else ''}'",
            "it": f"{selected_idea} - ispirato da '{request.prompt[:50]}{'...' if len(request.prompt) > 50 else ''}'",
            "fr": f"{selected_idea} - inspiré par '{request.prompt[:50]}{'...' if len(request.prompt) > 50 else ''}'",
            "es": f"{selected_idea} - inspirado por '{request.prompt[:50]}{'...' if len(request.prompt) > 50 else ''}'"
        }
        title = title_templates[language]
    else:
        title = selected_idea

    # Generiere erweiterten Inhalt
    base_content = multilingual.enhance_idea_content(
        selected_idea, request.prompt, category, 
        request.creativity_level, language
    )

    return {
        "title": title,
        "content": base_content,
        "category": category,
        "localized_category": multilingual.get_category_name(category, language),
        "language": language,
        "creativity_level": request.creativity_level,
        "prompt": request.prompt,
        "template_type": request.template_type
    }

@app.get("/")
async def root():
    """Root endpoint mit Mehrsprachigkeits-Info"""
    return {
        "message": "Creative Muse AI - Multilingual Backend",
        "version": "2.0.0",
        "status": "running",
        "supported_languages": multilingual.get_supported_languages(),
        "endpoints": {
            "generate": "/api/v1/generate",
            "random": "/api/v1/random", 
            "ideas": "/api/v1/ideas",
            "stats": "/api/v1/stats",
            "languages": "/api/v1/languages",
            "health": "/health",
        },
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": "connected" if db_path.exists() else "not_found",
        "multilingual_support": True,
        "supported_languages": multilingual.get_supported_languages()
    }

@app.get("/api/v1/languages", response_model=List[LanguageInfo])
async def get_supported_languages():
    """Hole unterstützte Sprachen"""
    languages = [
        LanguageInfo(code="de", name="Deutsch", supported=True),
        LanguageInfo(code="en", name="English", supported=True),
        LanguageInfo(code="it", name="Italiano", supported=True),
        LanguageInfo(code="fr", name="Français", supported=True),
        LanguageInfo(code="es", name="Español", supported=True),
    ]
    return languages

@app.post("/api/v1/generate", response_model=IdeaResponse)
async def generate_idea(
    request: IdeaRequest,
    accept_language: Optional[str] = Header(None)
):
    """Generiere neue kreative Idee mit Mehrsprachigkeits-Support"""
    try:
        # Verwende Accept-Language Header als Fallback
        if not request.language and accept_language:
            request.language = accept_language.split(',')[0].split('-')[0]
        
        language = multilingual.validate_language(request.language or "de")
        logger.info(f"Generiere Idee für Prompt: '{request.prompt}' in Sprache: {language}")

        # Generiere Idee
        idea_data = generate_enhanced_idea(request)

        # Erstelle Idee-Objekt
        idea = IdeaResponse(
            id=str(uuid.uuid4()),
            title=idea_data["title"],
            content=idea_data["content"],
            category=idea_data["category"],
            localized_category=idea_data["localized_category"],
            created_at=datetime.now().isoformat(),
            generation_method="multilingual_ai",
            language=language,
            creativity_level=idea_data["creativity_level"]
        )

        # Speichere in Datenbank
        try:
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO multilingual_ideas 
                (id, title, content, category, localized_category, created_at, 
                 generation_method, language, creativity_level, prompt, template_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                idea.id, idea.title, idea.content, idea.category, 
                idea.localized_category, idea.created_at, idea.generation_method,
                idea.language, idea.creativity_level, request.prompt, request.template_type
            ))
            conn.commit()
            conn.close()
            logger.info(f"✅ Idee gespeichert: {idea.id}")
        except Exception as db_error:
            logger.error(f"❌ Datenbankfehler: {db_error}")
            # Idee trotzdem zurückgeben, auch wenn Speicherung fehlschlägt

        return idea

    except Exception as e:
        logger.error(f"❌ Fehler bei Ideengenerierung: {e}")
        error_msg = multilingual.get_response_message("error", request.language or "de")
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/v1/random", response_model=IdeaResponse)
async def generate_random_idea(
    language: str = Query("de", description="Response language"),
    category: str = Query("general", description="Idea category"),
    accept_language: Optional[str] = Header(None)
):
    """Generiere zufällige Idee"""
    # Verwende Accept-Language Header als Fallback
    if not language and accept_language:
        language = accept_language.split(',')[0].split('-')[0]
    
    random_prompts = {
        "de": ["Innovation", "Zukunft", "Nachhaltigkeit", "Kreativität", "Technologie"],
        "en": ["Innovation", "Future", "Sustainability", "Creativity", "Technology"],
        "it": ["Innovazione", "Futuro", "Sostenibilità", "Creatività", "Tecnologia"],
        "fr": ["Innovation", "Futur", "Durabilité", "Créativité", "Technologie"],
        "es": ["Innovación", "Futuro", "Sostenibilidad", "Creatividad", "Tecnología"]
    }
    
    lang = multilingual.validate_language(language)
    random_prompt = random.choice(random_prompts[lang])
    
    request = IdeaRequest(
        prompt=random_prompt,
        category=category,
        creativity_level=random.randint(3, 8),
        language=lang
    )
    
    return await generate_idea(request)

@app.get("/api/v1/ideas", response_model=List[IdeaResponse])
async def get_ideas(
    limit: int = Query(10, description="Number of ideas to return"),
    category: Optional[str] = Query(None, description="Filter by category"),
    language: Optional[str] = Query(None, description="Filter by language")
):
    """Hole gespeicherte Ideen"""
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Build query based on filters
        query = "SELECT * FROM multilingual_ideas"
        params = []
        conditions = []
        
        if category:
            conditions.append("category = ?")
            params.append(category)
            
        if language:
            conditions.append("language = ?")
            params.append(language)
            
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
            
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        ideas = []
        for row in rows:
            idea = IdeaResponse(
                id=row[0],
                title=row[1],
                content=row[2],
                category=row[3],
                localized_category=row[4] or row[3],
                rating=row[5],
                created_at=row[6],
                generation_method=row[7] or "multilingual_ai",
                language=row[8] or "de",
                creativity_level=row[9] or 5
            )
            ideas.append(idea)
            
        return ideas
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Laden der Ideen: {e}")
        return []

@app.put("/api/v1/ideas/{idea_id}/rate")
async def rate_idea(idea_id: str, rating: IdeaRating):
    """Bewerte eine Idee"""
    try:
        if not 1 <= rating.rating <= 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
            
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Update rating
        cursor.execute(
            "UPDATE multilingual_ideas SET rating = ? WHERE id = ?",
            (rating.rating, idea_id)
        )
        
        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail="Idea not found")
            
        # Get updated idea
        cursor.execute("SELECT * FROM multilingual_ideas WHERE id = ?", (idea_id,))
        row = cursor.fetchone()
        conn.commit()
        conn.close()
        
        if row:
            return IdeaResponse(
                id=row[0],
                title=row[1],
                content=row[2],
                category=row[3],
                localized_category=row[4] or row[3],
                rating=row[5],
                created_at=row[6],
                generation_method=row[7] or "multilingual_ai",
                language=row[8] or "de",
                creativity_level=row[9] or 5
            )
        else:
            raise HTTPException(status_code=404, detail="Idea not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Fehler beim Bewerten der Idee: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/v1/stats", response_model=StatsResponse)
async def get_stats():
    """Hole Statistiken"""
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Get basic stats
        cursor.execute("SELECT COUNT(*) FROM multilingual_ideas")
        total_ideas = cursor.fetchone()[0]
        
        # Get recent ideas (last 7 days)
        week_ago = (datetime.now() - timedelta(days=7)).isoformat()
        cursor.execute("SELECT COUNT(*) FROM multilingual_ideas WHERE created_at >= ?", (week_ago,))
        recent_ideas = cursor.fetchone()[0]
        
        # Get average rating
        cursor.execute("SELECT AVG(rating) FROM multilingual_ideas WHERE rating IS NOT NULL")
        avg_rating = cursor.fetchone()[0] or 0.0
        
        # Get category distribution
        cursor.execute("SELECT category, COUNT(*) FROM multilingual_ideas GROUP BY category")
        categories = dict(cursor.fetchall())
        
        # Get language distribution
        cursor.execute("SELECT language, COUNT(*) FROM multilingual_ideas GROUP BY language")
        languages = dict(cursor.fetchall())
        
        # Get generation method stats
        cursor.execute("SELECT COUNT(*) FROM multilingual_ideas WHERE generation_method LIKE '%llm%' OR generation_method LIKE '%ai%'")
        llm_ideas = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM multilingual_ideas WHERE generation_method = 'mock'")
        mock_ideas = cursor.fetchone()[0]
        
        conn.close()
        
        return StatsResponse(
            total_ideas=total_ideas,
            recent_ideas=recent_ideas,
            average_rating=round(avg_rating, 2),
            categories=categories,
            llm_ideas=llm_ideas,
            mock_ideas=mock_ideas,
            languages=languages,
            updated_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Laden der Statistiken: {e}")
        return StatsResponse(
            total_ideas=0,
            recent_ideas=0,
            average_rating=0.0,
            categories={},
            llm_ideas=0,
            mock_ideas=0,
            languages={},
            updated_at=datetime.now().isoformat()
        )
if __name__ == "__main__":
    logger.info("🚀 Starte Creative Muse AI - Multilingual Backend...")
    
    # Initialisiere Datenbank
    if not init_multilingual_db():
        logger.error("❌ Konnte Datenbank nicht initialisieren")
        sys.exit(1)
    
    # Starte Server
    uvicorn.run(
        "main_multilingual:app",
        host="127.0.0.1",
        port=8001,  # Anderer Port um Konflikte zu vermeiden
        reload=True,
        log_level="info"
    )