#!/usr/bin/env python3
"""
Creative Muse AI - Subscription-Enabled Backend
Backend con sistema di autenticazione e abbonamenti
"""

import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

# Import locali
from model_manager import ModelManager
from auth_service import (
    AuthService, User, SubscriptionTier, 
    get_current_user, check_user_limits, auth_service
)

# Carica variabili d'ambiente
load_dotenv("../.env")
load_dotenv(".env")

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Componenti globali
model_manager: Optional[ModelManager] = None


# ============================================================================
# MODELLI PYDANTIC PER API
# ============================================================================

class UserRegistration(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class IdeaRequest(BaseModel):
    prompt: str
    category: Optional[str] = "general"
    creativity_level: Optional[int] = 5
    language: Optional[str] = "it"
    model: Optional[str] = None
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None


class IdeaResponse(BaseModel):
    id: str
    title: str
    content: str
    category: str
    rating: Optional[int] = None
    created_at: str
    generation_method: str
    model_used: str
    user_id: str


class UserProfile(BaseModel):
    id: str
    uuid: str
    email: str
    username: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    subscription_tier: str
    email_verified: bool
    created_at: str
    usage_stats: Dict[str, Any]


class SubscriptionInfo(BaseModel):
    tier: str
    limits: Dict[str, Any]
    usage: Dict[str, Any]
    features: Dict[str, Any]


# ============================================================================
# STARTUP E SHUTDOWN
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup e Shutdown Events"""
    global model_manager
    
    # Startup
    logger.info("🚀 Avvio Creative Muse AI Subscription Backend...")
    
    # Inizializza database
    auth_service._init_database()
    
    # Model Manager
    hf_token = os.getenv("HF_TOKEN")
    cache_dir = os.getenv("MODEL_CACHE_DIR", "../models")
    
    model_manager = ModelManager(cache_dir=cache_dir, hf_token=hf_token)
    
    available_models = model_manager.get_available_models()
    if available_models:
        logger.info(f"📋 Modelli disponibili: {', '.join(available_models)}")
    else:
        logger.warning("⚠️  Nessun modello trovato - modalità Mock attiva")
    
    logger.info("✅ Backend subscription pronto!")
    
    yield
    
    # Shutdown
    logger.info("🛑 Spegnimento backend...")
    if model_manager:
        model_manager.unload_current_model()


# ============================================================================
# APPLICAZIONE FASTAPI
# ============================================================================

app = FastAPI(
    title="Creative Muse AI - Subscription Backend",
    description="Backend con autenticazione e sistema di abbonamenti",
    version="2.1.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# ENDPOINT AUTENTICAZIONE
# ============================================================================

@app.post("/api/v1/auth/register")
async def register(user_data: UserRegistration):
    """Registrazione nuovo utente"""
    try:
        result = await auth_service.register_user(
            email=user_data.email,
            password=user_data.password,
            username=user_data.username,
            first_name=user_data.first_name,
            last_name=user_data.last_name
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore registrazione: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore interno del server"
        )


@app.post("/api/v1/auth/login")
async def login(credentials: UserLogin):
    """Login utente"""
    try:
        result = await auth_service.login_user(
            email=credentials.email,
            password=credentials.password
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore interno del server"
        )


@app.get("/api/v1/auth/me")
async def get_profile(current_user: User = Depends(get_current_user)):
    """Profilo utente corrente"""
    try:
        # Ottieni statistiche usage
        import sqlite3
        with sqlite3.connect(auth_service.db_path) as conn:
            cursor = conn.cursor()
            
            # Usage oggi
            today = datetime.now().date()
            cursor.execute("""
                SELECT ideas_generated, api_calls 
                FROM user_usage 
                WHERE user_id = ? AND date = ?
            """, (current_user.id, today))
            
            today_usage = cursor.fetchone()
            daily_ideas = today_usage[0] if today_usage else 0
            
            # Usage totale
            cursor.execute("""
                SELECT SUM(ideas_generated), COUNT(DISTINCT date)
                FROM user_usage 
                WHERE user_id = ?
            """, (current_user.id,))
            
            total_usage = cursor.fetchone()
            total_ideas = total_usage[0] if total_usage and total_usage[0] else 0
            active_days = total_usage[1] if total_usage and total_usage[1] else 0
        
        return UserProfile(
            id=current_user.id,
            uuid=current_user.uuid,
            email=current_user.email,
            username=current_user.username,
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            subscription_tier=current_user.subscription_tier.value,
            email_verified=current_user.email_verified,
            created_at=current_user.created_at.isoformat(),
            usage_stats={
                "daily_ideas": daily_ideas,
                "total_ideas": total_ideas,
                "active_days": active_days
            }
        )
    except Exception as e:
        logger.error(f"❌ Errore get_profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore interno del server"
        )


@app.get("/api/v1/subscription/info")
async def get_subscription_info(current_user: User = Depends(get_current_user)):
    """Informazioni abbonamento corrente"""
    try:
        limits = auth_service.get_subscription_limits(current_user.subscription_tier)
        
        # Calcola usage corrente
        import sqlite3
        with sqlite3.connect(auth_service.db_path) as conn:
            cursor = conn.cursor()
            
            today = datetime.now().date()
            cursor.execute("""
                SELECT ideas_generated FROM user_usage
                WHERE user_id = ? AND date = ?
            """, (current_user.id, today))
            
            daily_usage = cursor.fetchone()
            daily_ideas = daily_usage[0] if daily_usage else 0
            
            # Usage mensile
            month_start = today.replace(day=1)
            cursor.execute("""
                SELECT SUM(ideas_generated) FROM user_usage
                WHERE user_id = ? AND date >= ?
            """, (current_user.id, month_start))
            
            monthly_usage = cursor.fetchone()
            monthly_ideas = monthly_usage[0] if monthly_usage and monthly_usage[0] else 0
        
        return SubscriptionInfo(
            tier=current_user.subscription_tier.value,
            limits={
                "daily_ideas": limits.daily_ideas_limit,
                "monthly_ideas": limits.monthly_ideas_limit,
                "team_members": limits.max_team_members,
                "projects": limits.max_projects
            },
            usage={
                "daily_ideas": daily_ideas,
                "monthly_ideas": monthly_ideas
            },
            features=limits.features
        )
    except Exception as e:
        logger.error(f"❌ Errore subscription_info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore interno del server"
        )


# ============================================================================
# ENDPOINT GENERAZIONE IDEE (CON LIMITI)
# ============================================================================

@app.post("/api/v1/generate")
async def generate_custom_idea(
    request: IdeaRequest,
    current_user: User = Depends(check_user_limits)
):
    """Genera idea personalizzata (richiede autenticazione)"""
    try:
        # Verifica features disponibili per il tier
        limits = auth_service.get_subscription_limits(current_user.subscription_tier)
        
        # Controlla se il modello richiesto è disponibile per il tier
        if request.model and request.model not in limits.features.get("ai_models", ["mock"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Modello {request.model} non disponibile per il tuo piano"
            )
        
        # Genera idea
        idea_data = await generate_with_model(
            prompt=request.prompt,
            category=request.category,
            language=request.language,
            creativity_level=request.creativity_level,
            model_key=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        # Salva nel database con user_id
        idea_id = str(uuid.uuid4())
        
        import sqlite3
        with sqlite3.connect(auth_service.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO ideas (id, user_id, title, content, category, 
                                 generation_method, model_used, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                idea_id, current_user.id, idea_data["title"], idea_data["content"],
                request.category, idea_data["generation_method"], 
                idea_data["model_used"], datetime.now().isoformat()
            ))
            
            conn.commit()
        
        # Traccia usage
        await auth_service.track_usage(current_user, "generate_idea")
        
        return IdeaResponse(
            id=idea_id,
            title=idea_data["title"],
            content=idea_data["content"],
            category=request.category,
            created_at=datetime.now().isoformat(),
            generation_method=idea_data["generation_method"],
            model_used=idea_data["model_used"],
            user_id=current_user.id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore generate_custom_idea: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore interno del server"
        )


@app.post("/api/v1/random")
async def generate_random_idea(
    category: str = "general",
    language: str = "it",
    model: Optional[str] = None,
    current_user: User = Depends(check_user_limits)
):
    """Genera idea casuale (richiede autenticazione)"""
    try:
        # Usa generate_custom_idea con prompt casuale
        random_prompts = {
            "it": [
                "Inventa una soluzione innovativa per un problema quotidiano",
                "Crea un prodotto che migliori la vita delle persone",
                "Progetta un servizio che connetta le comunità",
                "Sviluppa un'idea per la sostenibilità ambientale"
            ],
            "en": [
                "Invent an innovative solution for a daily problem",
                "Create a product that improves people's lives",
                "Design a service that connects communities",
                "Develop an idea for environmental sustainability"
            ],
            "de": [
                "Erfinde eine innovative Lösung für ein tägliches Problem",
                "Erstelle ein Produkt, das das Leben der Menschen verbessert",
                "Entwerfe einen Service, der Gemeinschaften verbindet",
                "Entwickle eine Idee für ökologische Nachhaltigkeit"
            ]
        }
        
        import random
        prompts = random_prompts.get(language, random_prompts["it"])
        random_prompt = random.choice(prompts)
        
        request = IdeaRequest(
            prompt=random_prompt,
            category=category,
            language=language,
            model=model,
            creativity_level=random.randint(6, 9)
        )
        
        return await generate_custom_idea(request, current_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore generate_random_idea: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore interno del server"
        )


# ============================================================================
# ENDPOINT IDEE UTENTE
# ============================================================================

@app.get("/api/v1/ideas")
async def get_user_ideas(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user)
):
    """Ottieni idee dell'utente"""
    try:
        import sqlite3
        with sqlite3.connect(auth_service.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT id, title, content, category, rating, created_at,
                       generation_method, model_used
                FROM ideas
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            """, (current_user.id, limit, offset))
            
            ideas = []
            for row in cursor.fetchall():
                ideas.append(IdeaResponse(
                    id=row[0],
                    title=row[1],
                    content=row[2],
                    category=row[3],
                    rating=row[4],
                    created_at=row[5],
                    generation_method=row[6],
                    model_used=row[7],
                    user_id=current_user.id
                ))
            
            return {"ideas": ideas, "total": len(ideas)}
            
    except Exception as e:
        logger.error(f"❌ Errore get_user_ideas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore interno del server"
        )


# ============================================================================
# FUNZIONI HELPER
# ============================================================================

async def generate_with_model(prompt: str, category: str, language: str, 
                             creativity_level: int, model_key: Optional[str] = None,
                             **kwargs) -> dict:
    """Genera idea con modello specificato"""
    
    if not model_manager:
        return generate_mock_idea(prompt, category, language, creativity_level)
    
    # Determina modello target
    target_model = model_key or model_manager.get_current_model()
    
    if not target_model:
        available = model_manager.get_available_models()
        if available:
            target_model = available[0]
        else:
            return generate_mock_idea(prompt, category, language, creativity_level)
    
    try:
        # Crea prompt ottimizzato
        formatted_prompt = create_optimized_prompt(prompt, category, language, creativity_level)
        
        # Genera testo
        generated_text = model_manager.generate_text(
            formatted_prompt,
            model_key=target_model,
            temperature=kwargs.get("temperature", 0.3 + (creativity_level / 10) * 0.7),
            max_tokens=kwargs.get("max_tokens", 512)
        )
        
        if not generated_text:
            raise Exception("Nessuna generazione ricevuta")
        
        # Parse risultato
        lines = generated_text.split('\n', 1)
        title = lines[0].strip()
        content = lines[1].strip() if len(lines) > 1 else generated_text
        
        # Pulisci titolo
        if title.startswith(('Titel:', 'Title:', 'Titolo:')):
            title = title.split(':', 1)[1].strip()
        
        return {
            "title": title[:200],
            "content": content[:2000],
            "generation_method": f"model_{target_model}",
            "model_used": target_model
        }
        
    except Exception as e:
        logger.error(f"❌ Errore generazione modello: {e}")
        return generate_mock_idea(prompt, category, language, creativity_level)


def generate_mock_idea(prompt: str, category: str, language: str, creativity_level: int) -> dict:
    """Genera idea mock per fallback"""
    import random
    
    mock_titles = {
        "it": [
            "Soluzione Innovativa per Sfide Moderne",
            "Fusione Creativa di Tecnologia e Sostenibilità",
            "Approccio Rivoluzionario per la Vita Quotidiana"
        ],
        "en": [
            "Innovative Solution for Modern Challenges",
            "Creative Fusion of Technology and Sustainability",
            "Revolutionary Approach for Daily Life"
        ],
        "de": [
            "Innovative Lösung für moderne Herausforderungen",
            "Kreative Fusion von Technologie und Nachhaltigkeit",
            "Revolutionärer Ansatz für den Alltag"
        ]
    }
    
    title = random.choice(mock_titles.get(language, mock_titles["it"]))
    
    content_template = {
        "it": f"Questa idea innovativa si basa su '{prompt}' e combina {category} "
              f"con tecnologie moderne. Livello di creatività: {creativity_level}.",
        "en": f"This innovative idea is based on '{prompt}' and combines {category} "
              f"with modern technologies. Creativity level: {creativity_level}.",
        "de": f"Diese innovative Idee basiert auf '{prompt}' und kombiniert {category} "
              f"mit modernen Technologien. Kreativitätslevel: {creativity_level}."
    }
    
    return {
        "title": title,
        "content": content_template.get(language, content_template["it"]),
        "generation_method": "mock",
        "model_used": "mock"
    }


def create_optimized_prompt(prompt: str, category: str, language: str, creativity_level: int) -> str:
    """Crea prompt ottimizzato per generazione"""
    
    language_prompts = {
        "it": {
            "system": "Sei un assistente IA creativo per la generazione di idee innovative.",
            "instruction": f"Genera un'idea creativa per '{category}' basata su: '{prompt}'. "
                          f"Livello di creatività: {creativity_level}/10. "
                          f"Rispondi con titolo e descrizione dettagliata."
        },
        "en": {
            "system": "You are a creative AI assistant for innovative idea generation.",
            "instruction": f"Generate a creative idea for '{category}' based on: '{prompt}'. "
                          f"Creativity level: {creativity_level}/10. "
                          f"Respond with title and detailed description."
        },
        "de": {
            "system": "Du bist ein kreativer KI-Assistent für innovative Ideengenerierung.",
            "instruction": f"Generiere eine kreative Idee für '{category}' basierend auf: '{prompt}'. "
                          f"Kreativitätslevel: {creativity_level}/10. "
                          f"Antworte mit Titel und detaillierter Beschreibung."
        }
    }
    
    lang_config = language_prompts.get(language, language_prompts["it"])
    return f"{lang_config['system']}\n\n{lang_config['instruction']}"


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check con info subscription"""
    model_status = "unknown"
    if model_manager:
        current_model = model_manager.get_current_model()
        model_status = f"loaded: {current_model}" if current_model else "no model loaded"
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.1.0",
        "features": ["authentication", "subscriptions", "usage_limits"],
        "model_manager": model_manager is not None,
        "model_status": model_status,
        "available_models": model_manager.get_available_models() if model_manager else []
    }


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Funzione principale"""
    try:
        logger.info("🚀 Avvio Creative Muse AI Subscription Backend...")
        
        host = os.getenv("API_HOST", "0.0.0.0")
        port = int(os.getenv("API_PORT", 8001))
        
        uvicorn.run(
            app,
            host=host,
            port=port,
            log_level="info",
            access_log=True
        )
        
    except KeyboardInterrupt:
        logger.info("👋 Server fermato dall'utente")
    except Exception as e:
        logger.error(f"❌ Errore inaspettato: {e}")
        raise


if __name__ == "__main__":
    main()