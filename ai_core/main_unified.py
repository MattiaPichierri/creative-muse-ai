#!/usr/bin/env python3
"""
Creative Muse AI - Unified Backend Application
Backend unificato con tutte le funzionalità integrate
"""

import os
import sys
import asyncio
import signal
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional

import uvicorn
from fastapi import (
    FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Import router modulari
from routers import auth, ai, admin, subscription, training

# Import servizi
from auth_service import auth_service
from model_manager import ModelManager
from rate_limiter import rate_limiter
from feature_flags_service import init_feature_flags_service
from training_service import training_service

# Import modelli
from models.api_models import HealthCheckResponse, WebSocketMessage

# Import security (se disponibile)
try:
    from security import CryptoManager, AuditLogger, SessionManager, KeyManager
    from security.audit_logger import EventCategory, SeverityLevel
    HAS_SECURITY = True
except ImportError:
    HAS_SECURITY = False
    CryptoManager = None
    AuditLogger = None
    SessionManager = None
    KeyManager = None

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
crypto_manager: Optional[CryptoManager] = None
audit_logger: Optional[AuditLogger] = None
session_manager: Optional[SessionManager] = None
key_manager: Optional[KeyManager] = None

# WebSocket connections
active_websockets: Dict[str, WebSocket] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestione ciclo di vita applicazione"""
    global model_manager, crypto_manager, audit_logger
    global session_manager, key_manager
    
    # Startup
    logger.info("🚀 Avvio Creative Muse AI Unified Backend...")
    
    try:
        # 1. Inizializza database
        logger.info("📊 Inizializzazione database...")
        auth_service._init_database()
        
        # 2. Inizializza Feature Flags Service
        logger.info("🏁 Inizializzazione Feature Flags...")
        init_feature_flags_service(auth_service.db_path)
        
        # 3. Inizializza componenti di sicurezza (se disponibili)
        if HAS_SECURITY:
            logger.info("🔒 Inizializzazione componenti sicurezza...")
            try:
                from config import config
                
                crypto_manager = CryptoManager(config.security.config)
                audit_logger = AuditLogger(config.security.config)
                key_manager = KeyManager(config.security.config, audit_logger)
                session_manager = SessionManager(
                    config.security.config, crypto_manager, audit_logger
                )
                logger.info("✅ Componenti sicurezza inizializzati")
            except Exception as e:
                logger.warning(f"⚠️ Sicurezza avanzata non disponibile: {e}")
        
        # 4. Inizializza Model Manager
        logger.info("🤖 Inizializzazione Model Manager...")
        hf_token = os.getenv("HF_TOKEN")
        cache_dir = os.getenv("MODEL_CACHE_DIR", "../models")
        
        model_manager = ModelManager(cache_dir=cache_dir, hf_token=hf_token)
        
        available_models = model_manager.get_available_models()
        if available_models:
            logger.info(
                f"📋 Modelli disponibili: {', '.join(available_models)}"
            )
        else:
            logger.warning("⚠️ Nessun modello trovato - modalità Mock attiva")
        
        # 5. Inizializza Training Service
        logger.info("🎓 Inizializzazione Training Service...")
        # training_service è già inizializzato come singleton
        
        # 6. Log startup event
        if audit_logger:
            audit_logger.log_event(
                category=EventCategory.SYSTEM_EVENTS,
                event_type="unified_backend_started",
                source_component="main_unified",
                description="Creative Muse AI Unified Backend started",
                details={
                    "version": "2.0.0",
                    "security_enabled": HAS_SECURITY,
                    "models_available": (
                        len(available_models) if available_models else 0
                    )
                }
            )
        
        logger.info("✅ Backend unificato pronto!")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Errore durante startup: {e}")
        raise
    
    finally:
        # Shutdown
        logger.info("🛑 Spegnimento backend unificato...")
        
        try:
            # Log shutdown event
            if audit_logger:
                audit_logger.log_event(
                    category=EventCategory.SYSTEM_EVENTS,
                    event_type="unified_backend_shutdown",
                    source_component="main_unified",
                    description=(
                        "Creative Muse AI Unified Backend shutting down"
                    )
                )
            
            # Chiudi WebSocket connections
            for session_id, websocket in active_websockets.items():
                try:
                    await websocket.close()
                except Exception:
                    pass
            active_websockets.clear()
            
            # Shutdown model manager
            if model_manager:
                model_manager.unload_current_model()
            
            # Shutdown security components
            if session_manager:
                session_manager.shutdown()
            if key_manager:
                key_manager.shutdown()
            if audit_logger:
                audit_logger.shutdown()
            
            logger.info("✅ Shutdown completato")
            
        except Exception as e:
            logger.error(f"❌ Errore durante shutdown: {e}")


# Crea applicazione FastAPI
app = FastAPI(
    title="Creative Muse AI - Unified Backend",
    description="Backend unificato con tutte le funzionalità integrate",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted Host Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "::1", "*"]
)

# Include router modulari
app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(admin.router)
app.include_router(subscription.router)
app.include_router(training.router)


# ============================================================================
# ENDPOINT PRINCIPALI
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Creative Muse AI Unified Backend",
        "version": "2.0.0",
        "status": "running",
        "features": {
            "authentication": True,
            "ai_generation": True,
            "subscriptions": True,
            "admin_panel": True,
            "training": True,
            "security": HAS_SECURITY
        }
    }


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check completo"""
    try:
        components = {
            "database": True,  # TODO: implementa check DB reale
            "model_manager": model_manager is not None,
            "auth_service": auth_service is not None,
            "feature_flags": True,  # TODO: implementa check feature flags
            "rate_limiter": rate_limiter is not None,
            "training_service": training_service is not None
        }
        
        if HAS_SECURITY:
            components.update({
                "crypto_manager": crypto_manager is not None,
                "audit_logger": audit_logger is not None,
                "session_manager": session_manager is not None,
                "key_manager": key_manager is not None
            })
        
        # Determina status generale
        all_healthy = all(components.values())
        status = "healthy" if all_healthy else "degraded"
        
        # Log health check
        if audit_logger:
            audit_logger.log_event(
                category=EventCategory.SYSTEM_EVENTS,
                event_type="health_check",
                source_component="health_endpoint",
                description="Health check performed",
                details={"status": status, "components": components}
            )
        
        return HealthCheckResponse(
            status=status,
            timestamp=str(asyncio.get_event_loop().time()),
            components=components,
            version="2.0.0"
        )
        
    except Exception as e:
        logger.error(f"❌ Errore health check: {e}")
        raise HTTPException(
            status_code=500,
            detail="Health check failed"
        )


@app.get("/api/v1/info")
async def get_api_info():
    """Informazioni API"""
    return {
        "api_version": "v1",
        "backend_version": "2.0.0",
        "endpoints": {
            "authentication": "/api/v1/auth/*",
            "ai_generation": "/api/v1/ai/*",
            "administration": "/api/v1/admin/*",
            "subscriptions": "/api/v1/subscription/*",
            "training": "/api/v1/train/*"
        },
        "websocket": "/ws/{session_id}",
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc"
        }
    }


# ============================================================================
# WEBSOCKET ENDPOINTS
# ============================================================================

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint per comunicazione real-time"""
    try:
        await websocket.accept()
        
        # Registra connessione
        active_websockets[session_id] = websocket
        
        # Log connessione
        if audit_logger:
            audit_logger.log_event(
                category=EventCategory.SYSTEM_EVENTS,
                event_type="websocket_connected",
                source_component="websocket_endpoint",
                description="WebSocket connection established",
                session_id=session_id
            )
        
        # Invia messaggio di benvenuto
        welcome_msg = WebSocketMessage(
            type="connection_established",
            data={"session_id": session_id, "status": "connected"}
        )
        await websocket.send_json(welcome_msg.dict())
        
        # Loop messaggi
        while True:
            try:
                data = await websocket.receive_json()
                response = await process_websocket_message(data, session_id)
                
                if response:
                    await websocket.send_json(response)
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"❌ Errore WebSocket message: {e}")
                error_msg = WebSocketMessage(
                    type="error",
                    data={"error": str(e)}
                )
                await websocket.send_json(error_msg.dict())
                
    except Exception as e:
        logger.error(f"❌ Errore WebSocket connection: {e}")
        
    finally:
        # Cleanup connessione
        if session_id in active_websockets:
            del active_websockets[session_id]
        
        if audit_logger:
            audit_logger.log_event(
                category=EventCategory.SYSTEM_EVENTS,
                event_type="websocket_disconnected",
                source_component="websocket_endpoint",
                description="WebSocket connection closed",
                session_id=session_id
            )


async def process_websocket_message(
    data: Dict[str, Any], 
    session_id: str
) -> Optional[Dict[str, Any]]:
    """Processa messaggio WebSocket"""
    try:
        message_type = data.get("type")
        
        if message_type == "ping":
            return {
                "type": "pong",
                "timestamp": str(asyncio.get_event_loop().time())
            }
        
        elif message_type == "stream_idea":
            # Streaming idea generation
            prompt = data.get("prompt", "")
            if model_manager and prompt:
                # TODO: implementa streaming generation
                return {
                    "type": "idea_chunk",
                    "data": {"content": f"Idea per: {prompt}"}
                }
        
        elif message_type == "get_status":
            # Status sistema
            return {
                "type": "status",
                "data": {
                    "active_connections": len(active_websockets),
                    "model_loaded": (
                        model_manager.current_model if model_manager else None
                    )
                }
            }
        
        return None
        
    except Exception as e:
        logger.error(f"❌ Errore processing WebSocket message: {e}")
        return {"type": "error", "data": {"error": str(e)}}


# ============================================================================
# EXCEPTION HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handler per HTTPException"""
    if audit_logger:
        audit_logger.log_event(
            category=EventCategory.SECURITY_EVENTS,
            event_type="http_exception",
            source_component="exception_handler",
            description=f"HTTP {exc.status_code}: {exc.detail}",
            details={"status_code": exc.status_code, "detail": exc.detail}
        )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handler per eccezioni generali"""
    logger.error(f"❌ Unhandled exception: {exc}")
    
    if audit_logger:
        audit_logger.log_event(
            category=EventCategory.SECURITY_EVENTS,
            event_type="unhandled_exception",
            source_component="exception_handler",
            description=f"Unhandled exception: {str(exc)}",
            severity=SeverityLevel.HIGH
        )
    
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "status_code": 500}
    )


# ============================================================================
# SIGNAL HANDLERS
# ============================================================================

def signal_handler(signum, frame):
    """Handler per segnali di sistema"""
    logger.info(f"🛑 Ricevuto segnale {signum}, spegnimento...")
    sys.exit(0)


# ============================================================================
# MAIN FUNCTION
# ============================================================================

def main():
    """Funzione principale"""
    try:
        # Registra signal handlers
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        # Configurazione server
        host = os.getenv("HOST", "0.0.0.0")
        port = int(os.getenv("PORT", "8000"))
        workers = int(os.getenv("WORKERS", "1"))
        reload = os.getenv("RELOAD", "false").lower() == "true"
        
        logger.info(f"🚀 Avvio server su {host}:{port}")
        logger.info(
            f"📖 Documentazione disponibile su http://{host}:{port}/docs"
        )
        
        # Avvia server
        uvicorn.run(
            "main_unified:app",
            host=host,
            port=port,
            workers=workers if not reload else 1,
            reload=reload,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        logger.info("🛑 Spegnimento richiesto dall'utente")
    except Exception as e:
        logger.error(f"❌ Errore fatale: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()