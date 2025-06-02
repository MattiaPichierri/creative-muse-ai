#!/usr/bin/env python3
"""
Creative Muse AI - Subscription-Enabled Backend
Backend con sistema di autenticazione e abbonamenti
"""

import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

# Import locali
from model_manager import ModelManager
from auth_service import (
    AuthService, User, SubscriptionTier,
    get_current_user, check_user_limits, auth_service
)
from rate_limiter import rate_limiter, LimitType
from training_service import training_service
from rate_limit_admin import (
    get_rate_limit_stats, unblock_identifier, get_rate_limit_overview,
    cleanup_rate_limit_records, get_blocked_identifiers,
    RateLimitStatsResponse, UnblockRequest, RateLimitOverview
)
from admin_service import AdminService, FeatureFlagUpdate, UserOverrideCreate
from feature_flags_service import init_feature_flags_service, get_feature_flags_service
from feature_middleware import (
    require_feature, check_feature_access, get_user_features, FeatureGates,
    require_ai_model_selection, require_advanced_analytics, require_bulk_generation,
    require_export_formats, require_api_access
)
from admin_service import AdminService, FeatureFlagUpdate, UserOverrideCreate

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


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


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
    
    # Inizializza Feature Flags Service
    init_feature_flags_service(auth_service.db_path)
    
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
async def register(user_data: UserRegistration, request: Request):
    """Registrazione nuovo utente con rate limiting"""
    
    # Controlla rate limit per email e IP
    email_allowed, email_error = rate_limiter.check_rate_limit(
        user_data.email, LimitType.REGISTRATION_ATTEMPTS, request
    )
    if not email_allowed:
        rate_limiter.record_attempt(
            user_data.email, LimitType.REGISTRATION_ATTEMPTS, request, False
        )
        raise HTTPException(status_code=429, detail=email_error)
    
    ip_address = rate_limiter._get_client_ip(request)
    ip_allowed, ip_error = rate_limiter.check_rate_limit(
        ip_address, LimitType.REGISTRATION_ATTEMPTS, request
    )
    if not ip_allowed:
        rate_limiter.record_attempt(
            ip_address, LimitType.REGISTRATION_ATTEMPTS, request, False
        )
        raise HTTPException(status_code=429, detail=ip_error)
    
    try:
        result = await auth_service.register_user(
            email=user_data.email,
            password=user_data.password,
            username=user_data.username,
            first_name=user_data.first_name,
            last_name=user_data.last_name
        )
        
        # Registra tentativo riuscito
        rate_limiter.record_attempt(
            user_data.email, LimitType.REGISTRATION_ATTEMPTS, request, True
        )
        rate_limiter.record_attempt(
            ip_address, LimitType.REGISTRATION_ATTEMPTS, request, True
        )
        
        return result
        
    except HTTPException as e:
        # Registra tentativo fallito
        rate_limiter.record_attempt(
            user_data.email, LimitType.REGISTRATION_ATTEMPTS, request, False
        )
        rate_limiter.record_attempt(
            ip_address, LimitType.REGISTRATION_ATTEMPTS, request, False
        )
        raise
    except Exception as e:
        logger.error(f"❌ Errore registrazione: {e}")
        rate_limiter.record_attempt(
            user_data.email, LimitType.REGISTRATION_ATTEMPTS, request, False
        )
        rate_limiter.record_attempt(
            ip_address, LimitType.REGISTRATION_ATTEMPTS, request, False
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore interno del server"
        )


@app.post("/api/v1/auth/login")
async def login(credentials: UserLogin, request: Request):
    """Login utente con rate limiting"""
    
    # Controlla rate limit per email e IP
    email_allowed, email_error = rate_limiter.check_rate_limit(
        credentials.email, LimitType.LOGIN_ATTEMPTS, request
    )
    if not email_allowed:
        rate_limiter.record_attempt(
            credentials.email, LimitType.LOGIN_ATTEMPTS, request, False
        )
        raise HTTPException(status_code=429, detail=email_error)
    
    ip_address = rate_limiter._get_client_ip(request)
    ip_allowed, ip_error = rate_limiter.check_rate_limit(
        ip_address, LimitType.LOGIN_ATTEMPTS, request
    )
    if not ip_allowed:
        rate_limiter.record_attempt(
            ip_address, LimitType.LOGIN_ATTEMPTS, request, False
        )
        raise HTTPException(status_code=429, detail=ip_error)
    
    try:
        result = await auth_service.login_user(
            email=credentials.email,
            password=credentials.password
        )
        
        # Registra tentativo riuscito
        rate_limiter.record_attempt(
            credentials.email, LimitType.LOGIN_ATTEMPTS, request, True
        )
        rate_limiter.record_attempt(
            ip_address, LimitType.LOGIN_ATTEMPTS, request, True
        )
        
        return result
        
    except HTTPException as e:
        # Registra tentativo fallito
        rate_limiter.record_attempt(
            credentials.email, LimitType.LOGIN_ATTEMPTS, request, False
        )
        rate_limiter.record_attempt(
            ip_address, LimitType.LOGIN_ATTEMPTS, request, False
        )
        raise
    except Exception as e:
        logger.error(f"❌ Errore login: {e}")
        rate_limiter.record_attempt(
            credentials.email, LimitType.LOGIN_ATTEMPTS, request, False
        )
        rate_limiter.record_attempt(
            ip_address, LimitType.LOGIN_ATTEMPTS, request, False
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore interno del server"
        )


@app.post("/api/v1/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, req: Request):
    """Richiesta reset password con rate limiting"""
    
    # Controlla rate limit per email e IP
    email_allowed, email_error = rate_limiter.check_rate_limit(
        request.email, LimitType.PASSWORD_RESET, req
    )
    if not email_allowed:
        rate_limiter.record_attempt(
            request.email, LimitType.PASSWORD_RESET, req, False
        )
        raise HTTPException(status_code=429, detail=email_error)
    
    ip_address = rate_limiter._get_client_ip(req)
    ip_allowed, ip_error = rate_limiter.check_rate_limit(
        ip_address, LimitType.PASSWORD_RESET, req
    )
    if not ip_allowed:
        rate_limiter.record_attempt(
            ip_address, LimitType.PASSWORD_RESET, req, False
        )
        raise HTTPException(status_code=429, detail=ip_error)
    
    try:
        # Genera token di reset
        token = auth_service.generate_reset_token(request.email)
        
        # Registra tentativo (sempre come successo per sicurezza)
        rate_limiter.record_attempt(
            request.email, LimitType.PASSWORD_RESET, req, True
        )
        rate_limiter.record_attempt(
            ip_address, LimitType.PASSWORD_RESET, req, True
        )
        
        if token:
            # Invia email (per ora solo log)
            success = auth_service.send_reset_email(request.email, token)
            if success:
                return {
                    "success": True,
                    "message": "Se l'email esiste, riceverai un link per il reset della password"
                }
        
        # Sempre restituire successo per sicurezza (non rivelare se email esiste)
        return {
            "success": True,
            "message": "Se l'email esiste, riceverai un link per il reset della password"
        }
        
    except Exception as e:
        logger.error(f"❌ Errore forgot password: {e}")
        # Anche in caso di errore, registra come successo per sicurezza
        rate_limiter.record_attempt(
            request.email, LimitType.PASSWORD_RESET, req, True
        )
        rate_limiter.record_attempt(
            ip_address, LimitType.PASSWORD_RESET, req, True
        )
        return {
            "success": True,
            "message": "Se l'email esiste, riceverai un link per il reset della password"
        }


@app.post("/api/v1/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password con token"""
    try:
        # Verifica token e reset password
        success = auth_service.reset_password(request.token, request.new_password)
        
        if success:
            return {
                "success": True,
                "message": "Password aggiornata con successo"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token non valido o scaduto"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore reset password: {e}")
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
        # Leggi sempre il tier aggiornato dal database
        import sqlite3
        with sqlite3.connect(auth_service.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT subscription_tier FROM users WHERE id = ?", (current_user.id,))
            result = cursor.fetchone()
            current_tier = result[0] if result else "free"
        
        limits = auth_service.get_subscription_limits(current_tier)
        
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
        
        return {
            "tier": current_tier,
            "limits": {
                "daily_ideas": limits.daily_ideas_limit,
                "monthly_ideas": limits.monthly_ideas_limit,
                "team_members": limits.max_team_members,
                "projects": limits.max_projects
            },
            "usage": {
                "daily_ideas": daily_ideas,
                "monthly_ideas": monthly_ideas
            },
            "features": limits.features
        }
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
        idea_uuid = str(uuid.uuid4())
        
        import sqlite3
        with sqlite3.connect(auth_service.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO ideas (uuid, user_id, title, content, category,
                                 generation_method, model_used, prompt_used,
                                 language, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                idea_uuid, current_user.id, idea_data["title"], idea_data["content"],
                request.category, idea_data["generation_method"],
                idea_data["model_used"], request.prompt, request.language,
                datetime.now().isoformat()
            ))
            
            conn.commit()
        
        # Traccia usage
        await auth_service.track_usage(current_user, "generate_idea")
        
        return IdeaResponse(
            id=idea_uuid,
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
# SUBSCRIPTION MANAGEMENT
# ============================================================================

class SubscriptionUpdateRequest(BaseModel):
    new_tier: str
    payment_id: Optional[str] = None
    payment_method: Optional[str] = "sandbox"

@app.post("/api/v1/subscription/upgrade")
async def upgrade_subscription(
    request: SubscriptionUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    """Aggiorna la subscription dell'utente (sandbox)"""
    try:
        # Valida il tier richiesto
        valid_tiers = ["free", "creator", "pro", "enterprise"]
        if request.new_tier not in valid_tiers:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tier non valido: {request.new_tier}"
            )
        
        # Aggiorna nel database
        import sqlite3
        with sqlite3.connect(auth_service.db_path) as conn:
            cursor = conn.cursor()
            
            # Aggiorna il tier dell'utente
            cursor.execute("""
                UPDATE users
                SET subscription_tier = ?, updated_at = ?
                WHERE id = ?
            """, (request.new_tier, datetime.now().isoformat(), current_user.id))
            
            # Registra il pagamento (per audit)
            cursor.execute("""
                INSERT INTO payment_history (user_id, tier, payment_id, payment_method, amount, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                current_user.id,
                request.new_tier,
                request.payment_id or f"sandbox_{datetime.now().timestamp()}",
                request.payment_method,
                0.0,  # Sandbox amount
                datetime.now().isoformat()
            ))
            
            conn.commit()
        
        # Aggiorna l'oggetto user corrente
        current_user.subscription_tier = request.new_tier
        
        logger.info(f"✅ Subscription aggiornata: {current_user.email} -> {request.new_tier}")
        
        return {
            "success": True,
            "message": f"Subscription aggiornata a {request.new_tier}",
            "new_tier": request.new_tier,
            "payment_method": request.payment_method
        }
        
    except Exception as e:
        logger.error(f"❌ Errore aggiornamento subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore durante l'aggiornamento della subscription"
        )


# ============================================================================
# MODEL MANAGEMENT
# ============================================================================

@app.get("/api/v1/models")
async def get_models():
    """Lista dei modelli disponibili"""
    try:
        # Hole verfügbare Modelle vom model_manager
        available_model_names = []
        if model_manager:
            try:
                models_data = model_manager.get_available_models()
                if isinstance(models_data, list):
                    available_model_names = models_data
                elif isinstance(models_data, dict) and 'models' in models_data:
                    available_model_names = models_data['models']
            except Exception as e:
                logger.error(f"❌ Fehler beim Abrufen der Modelle: {e}")
        
        # Erstelle vollständige Modell-Objekte
        models = []
        
        # Definiere bekannte Modelle mit ihren Eigenschaften
        known_models = {
            "mock": {
                "name": "Mock Model",
                "description": "Modello di test per sviluppo",
                "size_gb": 0.0,
                "requires_token": False,
                "recommended": True,
                "current": True
            },
            "mistral-7b-instruct-v0.3": {
                "name": "Mistral 7B Instruct",
                "description": "Mistral 7B Instruct v0.3 Modell",
                "size_gb": 14.0,
                "requires_token": False,
                "recommended": True,
                "current": False
            },
            "microsoft-dialoGPT-medium": {
                "name": "DialoGPT Medium",
                "description": "Microsoft DialoGPT Medium Modell",
                "size_gb": 2.5,
                "requires_token": False,
                "recommended": False,
                "current": False
            },
            "microsoft-dialoGPT-large": {
                "name": "DialoGPT Large",
                "description": "Microsoft DialoGPT Large Modell",
                "size_gb": 5.0,
                "requires_token": False,
                "recommended": False,
                "current": False
            }
        }
        
        # Erstelle Modell-Objekte für verfügbare Modelle
        for model_key in available_model_names:
            if model_key in known_models:
                model_info = known_models[model_key].copy()
                model_info.update({
                    "key": model_key,
                    "available": True,
                    "loaded": False,
                    "status": "available"
                })
                models.append(model_info)
        
        # Fallback: Füge Mock-Modell hinzu wenn keine Modelle gefunden
        if not models:
            models.append({
                "key": "mock",
                "name": "Mock Model",
                "description": "Modello di test per sviluppo",
                "size_gb": 0.0,
                "requires_token": False,
                "recommended": True,
                "available": True,
                "loaded": True,
                "status": "ready",
                "current": True
            })
        else:
            # Setze das erste Modell als aktuell
            models[0]["current"] = True
            models[0]["loaded"] = True
            models[0]["status"] = "ready"
        
        return models
    except Exception as e:
        logger.error(f"❌ Errore get_models: {e}")
        return []


@app.post("/api/v1/models/switch")
async def switch_model(request: dict):
    """Wechsle zu einem anderen Modell"""
    try:
        model_key = request.get("model_key")
        if not model_key:
            raise HTTPException(status_code=400, detail="model_key erforderlich")
        
        logger.info(f"🔄 Wechsle zu Modell: {model_key}")
        
        # Hier würde normalerweise der model_manager das Modell wechseln
        # Für jetzt simulieren wir einen erfolgreichen Wechsel
        
        return {
            "message": f"Erfolgreich zu Modell {model_key} gewechselt",
            "current_model": model_key,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"❌ Fehler beim Model-Switch: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/models/deactivate")
async def deactivate_model():
    """Deaktiviere das aktuelle Modell"""
    try:
        logger.info("🔄 Deaktiviere aktuelles Modell")
        
        # Hier würde normalerweise der model_manager das Modell deaktivieren
        # Für jetzt simulieren wir eine erfolgreiche Deaktivierung
        
        return {
            "message": "Modell erfolgreich deaktiviert",
            "current_model": None,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"❌ Fehler beim Deaktivieren: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
# FEATURE-FLAG-GESCHÜTZTE ENDPOINTS
# ============================================================================

@app.get("/api/v1/features")
async def get_user_features_endpoint(
    features: dict = Depends(get_user_features),
    current_user: User = Depends(get_current_user)
):
    """Holt alle verfügbaren Features für den aktuellen Benutzer"""
    return {
        "features": features,
        "user_tier": current_user.subscription_tier or "free"
    }


@app.post("/api/v1/ideas/bulk")
@require_bulk_generation("Bulk-Generierung nur für Pro/Enterprise verfügbar")
async def bulk_generate_ideas(
    prompts: List[str],
    category: str = "general",
    language: str = "it",
    current_user: User = Depends(check_user_limits)
):
    """Generiert mehrere Ideen in einem Request (Pro/Enterprise Feature)"""
    try:
        # Feature-Konfiguration holen
        feature_service = get_feature_flags_service()
        config = feature_service.get_feature_config("bulk_idea_generation")
        max_batch_size = config.get("max_batch_size", 5)
        
        if len(prompts) > max_batch_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximal {max_batch_size} Prompts pro Request erlaubt"
            )
        
        ideas = []
        for prompt in prompts:
            idea_data = await generate_with_model(
                prompt=prompt,
                category=category,
                language=language,
                creativity_level=7,
                model_key="mock"
            )
            
            # Speichere in Datenbank
            idea_uuid = str(uuid.uuid4())
            import sqlite3
            with sqlite3.connect(auth_service.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO ideas (uuid, user_id, title, content, category,
                                     generation_method, model_used, prompt_used,
                                     language, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    idea_uuid, current_user.id, idea_data["title"], idea_data["content"],
                    category, idea_data["generation_method"],
                    idea_data["model_used"], prompt, language,
                    datetime.now().isoformat()
                ))
                conn.commit()
            
            ideas.append({
                "id": idea_uuid,
                "title": idea_data["title"],
                "content": idea_data["content"],
                "prompt": prompt
            })
        
        # Tracke Usage für alle generierten Ideen
        for _ in prompts:
            await auth_service.track_usage(current_user, "generate_idea")
        
        return {"ideas": ideas, "count": len(ideas)}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore bulk_generate_ideas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore interno del server"
        )


@app.get("/api/v1/analytics/advanced")
@require_advanced_analytics("Erweiterte Analytics nur für Enterprise verfügbar")
async def get_advanced_analytics(current_user: User = Depends(get_current_user)):
    """Erweiterte Analytics (Enterprise Feature)"""
    try:
        import sqlite3
        with sqlite3.connect(auth_service.db_path) as conn:
            cursor = conn.cursor()
            
            # Detaillierte Statistiken
            cursor.execute("""
                SELECT
                    DATE(created_at) as date,
                    COUNT(*) as ideas_count,
                    AVG(LENGTH(content)) as avg_content_length
                FROM ideas
                WHERE user_id = ?
                GROUP BY DATE(created_at)
                ORDER BY date DESC
                LIMIT 30
            """, (current_user.id,))
            
            daily_stats = []
            for row in cursor.fetchall():
                daily_stats.append({
                    "date": row[0],
                    "ideas_count": row[1],
                    "avg_content_length": round(row[2], 2) if row[2] else 0
                })
            
            return {
                "daily_stats": daily_stats,
                "retention_days": 365
            }
        
    except Exception as e:
        logger.error(f"❌ Errore advanced_analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore interno del server"
        )


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

# ============================================================================
# RATE LIMITING ADMIN ENDPOINTS
# ============================================================================


if __name__ == "__main__":
    main()
# ============================================================================
# ADMIN ENDPOINTS - FEATURE FLAGS MANAGEMENT
# ============================================================================

# Inizializza admin service
admin_service = AdminService('database/creative_muse.db')

def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency per verificare che l'utente sia admin"""
    # Semplice controllo admin basato su email
    if not current_user.email.endswith("@creativemuse.com"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accesso negato: privilegi admin richiesti"
        )
    return current_user


@app.get("/api/v1/admin/stats")
async def get_admin_stats(admin_user: User = Depends(require_admin)):
    """Ottieni statistiche per l'admin dashboard"""
    try:
        stats = admin_service.get_admin_stats()
        return {"success": True, "stats": stats}
    except Exception as e:
        logger.error(f"❌ Errore admin stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero delle statistiche"
        )


@app.get("/api/v1/admin/feature-flags")
async def get_admin_feature_flags(admin_user: User = Depends(require_admin)):
    """Ottieni tutti i feature flags per l'admin"""
    try:
        flags = admin_service.get_all_feature_flags()
        return {"success": True, "flags": flags}
    except Exception as e:
        logger.error(f"❌ Errore admin feature flags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero dei feature flags"
        )


@app.put("/api/v1/admin/feature-flags/{flag_id}")
async def update_feature_flag(
    flag_id: int,
    update_data: FeatureFlagUpdate,
    admin_user: User = Depends(require_admin)
):
    """Aggiorna un feature flag"""
    try:
        success = admin_service.update_feature_flag(flag_id, update_data)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feature flag non trovato"
            )
        
        # Refresh cache dei feature flags
        feature_service = get_feature_flags_service()
        if feature_service:
            feature_service.refresh_cache()
        
        return {"success": True, "message": "Feature flag aggiornato"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore update feature flag: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nell'aggiornamento del feature flag"
        )


@app.get("/api/v1/admin/users")
async def get_admin_users(admin_user: User = Depends(require_admin)):
    """Ottieni tutti gli utenti per l'admin"""
    try:
        users = admin_service.get_all_users()
        return {"success": True, "users": users}
    except Exception as e:
        logger.error(f"❌ Errore admin users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero degli utenti"
        )


@app.get("/api/v1/admin/user-overrides")
async def get_user_overrides(
    user_id: Optional[int] = None,
    admin_user: User = Depends(require_admin)
):
    """Ottieni gli override degli utenti"""
    try:
        overrides = admin_service.get_user_overrides(user_id)
        return {"success": True, "overrides": overrides}
    except Exception as e:
        logger.error(f"❌ Errore user overrides: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero degli override"
        )


@app.post("/api/v1/admin/user-overrides")
async def create_user_override(
    override_data: UserOverrideCreate,
    admin_user: User = Depends(require_admin)
):
    """Crea un override per un utente"""
    try:
        success = admin_service.create_user_override(override_data)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Errore nella creazione dell'override"
            )
        
        # Refresh cache dei feature flags
        feature_service = get_feature_flags_service()
        if feature_service:
            feature_service.refresh_cache()
        
        return {"success": True, "message": "Override creato"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore create override: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nella creazione dell'override"
        )


@app.delete("/api/v1/admin/user-overrides/{override_id}")
async def delete_user_override(
    override_id: int,
    admin_user: User = Depends(require_admin)
):
    """Elimina un override utente"""
    try:
        success = admin_service.delete_user_override(override_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Override non trovato"
            )
        
        # Refresh cache dei feature flags
        feature_service = get_feature_flags_service()
        if feature_service:
            feature_service.refresh_cache()
        
        return {"success": True, "message": "Override eliminato"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore delete override: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nell'eliminazione dell'override"
        )


# ============================================================================
# RATE LIMITING ADMIN ENDPOINTS
# ============================================================================

@app.get("/api/v1/admin/rate-limits/overview")
async def admin_get_rate_limit_overview(admin_user: User = Depends(require_admin)):
    """Ottieni overview generale del rate limiting"""
    try:
        stats = rate_limiter.get_attempt_stats("test@example.com", LimitType.LOGIN_ATTEMPTS)
        return {
            "total_attempts_24h": stats.get("total_attempts", 0),
            "total_blocks_active": 1 if stats.get("is_blocked", False) else 0,
            "top_blocked_ips": [],
            "top_blocked_emails": [],
            "limit_configurations": {
                "login_attempts": {"max_attempts": 5, "window_minutes": 10, "block_duration_minutes": 15},
                "registration_attempts": {"max_attempts": 3, "window_minutes": 10, "block_duration_minutes": 30},
                "password_reset": {"max_attempts": 3, "window_minutes": 60, "block_duration_minutes": 60}
            }
        }
    except Exception as e:
        logger.error(f"❌ Errore overview rate limiting: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")


@app.get("/api/v1/admin/rate-limits/blocked")
async def admin_get_blocked_identifiers(
    limit_type: Optional[str] = None,
    admin_user: User = Depends(require_admin)
):
    """Ottieni lista identificatori attualmente bloccati"""
    try:
        # Implementazione semplificata
        return []
    except Exception as e:
        logger.error(f"❌ Errore blocked identifiers: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")


@app.post("/api/v1/admin/rate-limits/unblock")
async def admin_unblock_identifier(
    request: dict,
    admin_user: User = Depends(require_admin)
):
    """Sblocca manualmente un identificatore"""
    try:
        identifier = request.get("identifier")
        limit_type_str = request.get("limit_type")
        
        if not identifier or not limit_type_str:
            raise HTTPException(status_code=400, detail="Identifier e limit_type richiesti")
        
        limit_type = LimitType(limit_type_str)
        success = rate_limiter.unblock_identifier(identifier, limit_type)
        
        return {
            "success": success,
            "message": f"Identificatore {identifier} sbloccato" if success else "Nessun blocco trovato"
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Tipo di limite non valido")
    except Exception as e:
        logger.error(f"❌ Errore sblocco: {e}")
        raise HTTPException(status_code=500, detail="Errore interno del server")


@app.get("/api/v1/admin/rate-limits/stats/{identifier}")
async def admin_get_rate_limit_stats(
    identifier: str,
    limit_type: str,
    admin_user: User = Depends(require_admin)
):
    """Ottieni statistiche rate limiting per identificatore specifico"""
    try:
        limit_type_enum = LimitType(limit_type)
        stats = rate_limiter.get_attempt_stats(identifier, limit_type_enum)
        return stats
    except ValueError:
        raise HTTPException(status_code=400, detail="Tipo di limite non valido")
    except Exception as e:
        logger.error(f"❌ Errore statistiche: {e}")
# ============================================================================
# TRAINING ENDPOINTS - CUSTOM MODEL TRAINING
# ============================================================================

def require_pro_or_enterprise(current_user: User = Depends(get_current_user)):
    """Dependency per verificare che l'utente sia Pro o Enterprise"""
    if current_user.subscription_tier not in ["pro", "enterprise"]:
        raise HTTPException(
            status_code=403,
            detail="Funzionalità disponibile solo per utenti Pro/Enterprise"
        )
    return current_user


@app.post("/api/v1/train/upload")
async def upload_training_dataset(
    file: UploadFile,
    description: Optional[str] = None,
    current_user: User = Depends(require_pro_or_enterprise)
):
    """Upload di un dataset per il training di modelli personalizzati"""
    try:
        result = await training_service.upload_dataset(
            file=file,
            user_id=current_user.id,
            description=description
        )
        
        logger.info(f"✅ Dataset caricato da utente {current_user.email}: {file.filename}")
        
        return {
            "success": True,
            "data": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore upload dataset: {e}")
        raise HTTPException(
            status_code=500,
            detail="Errore interno del server"
        )


@app.get("/api/v1/train/datasets")
async def get_user_datasets(
    current_user: User = Depends(require_pro_or_enterprise)
):
    """Ottieni tutti i dataset dell'utente"""
    try:
        datasets = training_service.get_user_datasets(current_user.id)
        
        return {
            "success": True,
            "datasets": datasets,
            "count": len(datasets)
        }
        
    except Exception as e:
        logger.error(f"❌ Errore recupero dataset: {e}")
        raise HTTPException(
            status_code=500,
            detail="Errore interno del server"
        )


@app.delete("/api/v1/train/datasets/{dataset_id}")
async def delete_training_dataset(
    dataset_id: str,
    current_user: User = Depends(require_pro_or_enterprise)
):
    """Elimina un dataset di training"""
    try:
        success = training_service.delete_dataset(dataset_id, current_user.id)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Dataset non trovato"
            )
        
        logger.info(f"✅ Dataset eliminato da utente {current_user.email}: {dataset_id}")
        
        return {
            "success": True,
            "message": "Dataset eliminato con successo"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore eliminazione dataset: {e}")
        raise HTTPException(
            status_code=500,
            detail="Errore interno del server"
        )


@app.post("/api/v1/train/start")
async def start_model_training(
    request: dict,
    current_user: User = Depends(require_pro_or_enterprise)
):
    """Avvia il training di un modello personalizzato"""
    try:
        dataset_id = request.get("dataset_id")
        model_name = request.get("model_name", "Custom Model")
        
        if not dataset_id:
            raise HTTPException(
                status_code=400,
                detail="dataset_id richiesto"
            )
        
        # Per ora restituiamo una risposta mock
        # In una implementazione reale, qui si avvierebbe il processo di training
        
        logger.info(f"✅ Training avviato da utente {current_user.email}: {model_name}")
        
        return {
            "success": True,
            "message": "Training avviato con successo",
            "training_id": f"train_{dataset_id}_{current_user.id}",
            "status": "pending",
            "estimated_time": "30-60 minuti"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore avvio training: {e}")
        raise HTTPException(
            status_code=500,
            detail="Errore interno del server"
        )


@app.get("/api/v1/train/status/{training_id}")
async def get_training_status(
    training_id: str,
    current_user: User = Depends(require_pro_or_enterprise)
):
    """Ottieni lo stato del training"""
    try:
        # Mock response - in una implementazione reale si controllerebbe il database
        return {
            "success": True,
            "training_id": training_id,
            "status": "in_progress",
            "progress": 45,
            "estimated_remaining": "15 minuti",
            "logs": [
                "Inizializzazione dataset completata",
                "Preprocessing dati in corso...",
                "Training epoch 1/10 completato"
            ]
        }
        
    except Exception as e:
        logger.error(f"❌ Errore stato training: {e}")
        raise HTTPException(
            status_code=500,
            detail="Errore interno del server"
        )
        raise HTTPException(status_code=500, detail="Errore interno del server")