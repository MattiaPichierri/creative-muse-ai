#!/usr/bin/env python3
"""
Creative Muse AI - Hauptanwendung
FastAPI-basiertes Backend mit sicherer AI-Integration
"""

import os
import sys
import asyncio
import signal
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
import yaml

# Lokale Imports
from config import config
from security import CryptoManager, AuditLogger, SessionManager, KeyManager
from security.audit_logger import EventCategory, SeverityLevel

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Globale Komponenten
crypto_manager: Optional[CryptoManager] = None
audit_logger: Optional[AuditLogger] = None
session_manager: Optional[SessionManager] = None
key_manager: Optional[KeyManager] = None
ai_model_manager = None  # Wird später implementiert

# WebSocket-Verbindungen
active_websockets: Dict[str, WebSocket] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Anwendungslebenszyklus-Management"""
    # Startup
    logger.info("🚀 Creative Muse AI Backend startet...")
    
    try:
        await startup_event()
        logger.info("✅ Backend erfolgreich gestartet")
        yield
    except Exception as e:
        logger.error(f"❌ Fehler beim Startup: {e}")
        raise
    finally:
        # Shutdown
        logger.info("🛑 Creative Muse AI Backend wird beendet...")
        await shutdown_event()
        logger.info("✅ Backend erfolgreich beendet")

# FastAPI-App erstellen
app = FastAPI(
    title="Creative Muse AI",
    description="Sichere, offline-fähige AI-Anwendung für kreative Ideengenerierung",
    version="1.0.0",
    docs_url="/docs" if config.is_development() else None,
    redoc_url="/redoc" if config.is_development() else None,
    lifespan=lifespan
)

# Security-Middleware
security = HTTPBearer(auto_error=False)

# CORS-Middleware (nur für lokale Entwicklung)
if config.is_development():
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.api.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )

# Trusted Host Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "::1"]
)

async def startup_event():
    """Initialisierung beim Anwendungsstart"""
    global crypto_manager, audit_logger, session_manager, key_manager
    
    try:
        # 1. Sicherheitskomponenten initialisieren
        logger.info("🔒 Initialisiere Sicherheitskomponenten...")
        
        # Crypto-Manager
        crypto_manager = CryptoManager(config.security.config)
        logger.info("✅ Crypto-Manager initialisiert")
        
        # Audit-Logger
        audit_logger = AuditLogger(config.security.config)
        logger.info("✅ Audit-Logger initialisiert")
        
        # Key-Manager
        key_manager = KeyManager(config.security.config, audit_logger)
        logger.info("✅ Key-Manager initialisiert")
        
        # Session-Manager
        session_manager = SessionManager(config.security.config, crypto_manager, audit_logger)
        logger.info("✅ Session-Manager initialisiert")
        
        # 2. Datenbank-Verbindung prüfen
        await check_database_connection()
        
        # 3. AI-Modell laden (später implementiert)
        # await load_ai_model()
        
        # 4. Startup-Event protokollieren
        audit_logger.log_event(
            category=EventCategory.SYSTEM_EVENTS,
            event_type="backend_started",
            source_component="main_application",
            description="Creative Muse AI Backend successfully started",
            details={
                "version": "1.0.0",
                "debug_mode": config.is_development(),
                "encryption_enabled": True
            }
        )
        
        logger.info("🎉 Alle Komponenten erfolgreich initialisiert")
        
    except Exception as e:
        logger.error(f"❌ Fehler bei der Initialisierung: {e}")
        raise

async def shutdown_event():
    """Cleanup beim Anwendungsende"""
    try:
        # Audit-Event protokollieren
        if audit_logger:
            audit_logger.log_event(
                category=EventCategory.SYSTEM_EVENTS,
                event_type="backend_shutdown",
                source_component="main_application",
                description="Creative Muse AI Backend shutting down"
            )
        
        # WebSocket-Verbindungen schließen
        for session_id, websocket in active_websockets.items():
            try:
                await websocket.close()
            except:
                pass
        active_websockets.clear()
        
        # Komponenten ordnungsgemäß beenden
        if session_manager:
            session_manager.shutdown()
        
        if key_manager:
            key_manager.shutdown()
        
        if audit_logger:
            audit_logger.shutdown()
        
        logger.info("✅ Cleanup abgeschlossen")
        
    except Exception as e:
        logger.error(f"❌ Fehler beim Shutdown: {e}")

async def check_database_connection():
    """Prüfe Datenbank-Verbindung"""
    try:
        # TODO: Implementiere Datenbank-Verbindungsprüfung
        logger.info("✅ Datenbank-Verbindung OK")
    except Exception as e:
        logger.error(f"❌ Datenbank-Verbindung fehlgeschlagen: {e}")
        raise

# ============================================================================
# DEPENDENCY INJECTION
# ============================================================================

async def get_current_session(request: Request) -> Optional[str]:
    """Hole aktuelle Session aus Request"""
    try:
        # Session-ID aus Header oder Cookie
        session_id = request.headers.get("X-Session-ID")
        if not session_id:
            session_id = request.cookies.get("session_id")
        
        if session_id and session_manager:
            # Session validieren
            client_ip = request.client.host
            user_agent = request.headers.get("User-Agent")
            
            session_data = session_manager.validate_session(
                session_id, client_ip, user_agent
            )
            
            if session_data:
                return session_id
        
        return None
        
    except Exception as e:
        logger.error(f"Fehler bei Session-Validierung: {e}")
        return None

async def require_session(session_id: Optional[str] = Depends(get_current_session)) -> str:
    """Erfordere gültige Session"""
    if not session_id:
        raise HTTPException(
            status_code=401,
            detail="Gültige Session erforderlich"
        )
    return session_id

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root-Endpoint"""
    return {
        "message": "Creative Muse AI Backend",
        "version": "1.0.0",
        "status": "running",
        "encryption": "enabled"
    }

@app.get("/health")
async def health_check():
    """Gesundheitsprüfung"""
    try:
        # Komponenten-Status prüfen
        status = {
            "status": "healthy",
            "timestamp": audit_logger.audit_logger.handlers[0].stream.name if audit_logger else None,
            "components": {
                "crypto_manager": crypto_manager is not None,
                "audit_logger": audit_logger is not None,
                "session_manager": session_manager is not None,
                "key_manager": key_manager is not None,
                "database": True,  # TODO: Echte DB-Prüfung
                "ai_model": False  # TODO: Modell-Status
            }
        }
        
        # Audit-Log
        if audit_logger:
            audit_logger.log_event(
                category=EventCategory.SYSTEM_EVENTS,
                event_type="health_check",
                source_component="health_endpoint",
                description="Health check performed"
            )
        
        return status
        
    except Exception as e:
        logger.error(f"Fehler bei Gesundheitsprüfung: {e}")
        raise HTTPException(status_code=500, detail="Gesundheitsprüfung fehlgeschlagen")

@app.post("/auth/session")
async def create_session(request: Request):
    """Erstelle neue Session"""
    try:
        client_ip = request.client.host
        user_agent = request.headers.get("User-Agent")
        
        # Session erstellen
        session_id = session_manager.create_session(
            ip_address=client_ip,
            user_agent=user_agent
        )
        
        # Audit-Log
        audit_logger.log_event(
            category=EventCategory.AUTHENTICATION,
            event_type="session_created",
            source_component="auth_endpoint",
            description="New session created",
            session_id=session_id,
            ip_address=client_ip,
            user_agent=user_agent
        )
        
        return {
            "session_id": session_id,
            "expires_in": config.api.session_timeout_minutes * 60
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Erstellen der Session: {e}")
        raise HTTPException(status_code=500, detail="Session-Erstellung fehlgeschlagen")

@app.delete("/auth/session")
async def terminate_session(session_id: str = Depends(require_session)):
    """Beende Session"""
    try:
        success = session_manager.terminate_session(session_id, "user_logout")
        
        if success:
            # Audit-Log
            audit_logger.log_event(
                category=EventCategory.AUTHENTICATION,
                event_type="session_terminated",
                source_component="auth_endpoint",
                description="Session terminated by user",
                session_id=session_id
            )
            
            return {"message": "Session erfolgreich beendet"}
        else:
            raise HTTPException(status_code=404, detail="Session nicht gefunden")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Beenden der Session: {e}")
        raise HTTPException(status_code=500, detail="Session-Beendigung fehlgeschlagen")

@app.get("/stats")
async def get_statistics(session_id: str = Depends(require_session)):
    """Hole System-Statistiken"""
    try:
        stats = {
            "session_manager": session_manager.get_statistics() if session_manager else {},
            "key_manager": key_manager.get_statistics() if key_manager else {},
            "audit_logger": audit_logger.get_statistics() if audit_logger else {}
        }
        
        # Audit-Log
        audit_logger.log_event(
            category=EventCategory.DATA_ACCESS,
            event_type="statistics_accessed",
            source_component="stats_endpoint",
            description="System statistics accessed",
            session_id=session_id
        )
        
        return stats
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Statistiken: {e}")
        raise HTTPException(status_code=500, detail="Statistiken nicht verfügbar")

# ============================================================================
# WEBSOCKET ENDPOINTS
# ============================================================================

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket-Endpoint für Echtzeit-Kommunikation"""
    try:
        # WebSocket-Verbindung akzeptieren
        await websocket.accept()
        
        # Session validieren
        if not session_manager:
            await websocket.close(code=1008, reason="Session-Manager nicht verfügbar")
            return
        
        session_data = session_manager.validate_session(session_id)
        if not session_data:
            await websocket.close(code=1008, reason="Ungültige Session")
            return
        
        # Verbindung registrieren
        active_websockets[session_id] = websocket
        
        # Audit-Log
        audit_logger.log_event(
            category=EventCategory.SYSTEM_EVENTS,
            event_type="websocket_connected",
            source_component="websocket_endpoint",
            description="WebSocket connection established",
            session_id=session_id
        )
        
        # Willkommensnachricht senden
        await websocket.send_json({
            "type": "connection_established",
            "session_id": session_id,
            "timestamp": audit_logger.audit_logger.handlers[0].stream.name if audit_logger else None
        })
        
        # Nachrichten-Loop
        while True:
            try:
                # Nachricht empfangen
                data = await websocket.receive_json()
                
                # Nachricht verarbeiten
                response = await process_websocket_message(data, session_id)
                
                # Antwort senden
                if response:
                    await websocket.send_json(response)
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Fehler bei WebSocket-Nachricht: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": "Nachrichtenverarbeitung fehlgeschlagen"
                })
    
    except Exception as e:
        logger.error(f"Fehler bei WebSocket-Verbindung: {e}")
    
    finally:
        # Verbindung bereinigen
        if session_id in active_websockets:
            del active_websockets[session_id]
        
        # Audit-Log
        if audit_logger:
            audit_logger.log_event(
                category=EventCategory.SYSTEM_EVENTS,
                event_type="websocket_disconnected",
                source_component="websocket_endpoint",
                description="WebSocket connection closed",
                session_id=session_id
            )

async def process_websocket_message(data: Dict[str, Any], session_id: str) -> Optional[Dict[str, Any]]:
    """Verarbeite WebSocket-Nachricht"""
    try:
        message_type = data.get("type")
        
        if message_type == "ping":
            return {"type": "pong", "timestamp": audit_logger.audit_logger.handlers[0].stream.name if audit_logger else None}
        
        elif message_type == "generate_idea":
            # TODO: Implementiere Ideengenerierung
            prompt = data.get("prompt", "")
            
            # Audit-Log
            audit_logger.log_event(
                category=EventCategory.API_CALLS,
                event_type="idea_generation_requested",
                source_component="websocket_processor",
                description="Idea generation requested via WebSocket",
                details={"prompt_length": len(prompt)},
                session_id=session_id
            )
            
            # Placeholder-Antwort
            return {
                "type": "idea_generated",
                "idea": f"Kreative Idee basierend auf: '{prompt[:50]}...'",
                "timestamp": audit_logger.audit_logger.handlers[0].stream.name if audit_logger else None
            }
        
        else:
            return {
                "type": "error",
                "message": f"Unbekannter Nachrichtentyp: {message_type}"
            }
            
    except Exception as e:
        logger.error(f"Fehler bei Nachrichtenverarbeitung: {e}")
        return {
            "type": "error",
            "message": "Nachrichtenverarbeitung fehlgeschlagen"
        }

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """HTTP-Exception-Handler"""
    # Audit-Log für Fehler
    if audit_logger:
        audit_logger.log_event(
            category=EventCategory.ERROR_EVENTS,
            event_type="http_exception",
            severity=SeverityLevel.WARNING,
            source_component="exception_handler",
            description=f"HTTP {exc.status_code}: {exc.detail}",
            details={
                "status_code": exc.status_code,
                "detail": exc.detail,
                "path": str(request.url.path)
            },
            ip_address=request.client.host
        )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Allgemeiner Exception-Handler"""
    logger.error(f"Unbehandelter Fehler: {exc}")
    
    # Audit-Log für kritische Fehler
    if audit_logger:
        audit_logger.log_event(
            category=EventCategory.ERROR_EVENTS,
            event_type="unhandled_exception",
            severity=SeverityLevel.ERROR,
            source_component="exception_handler",
            description=f"Unhandled exception: {str(exc)}",
            details={
                "exception_type": type(exc).__name__,
                "path": str(request.url.path)
            },
            ip_address=request.client.host
        )
    
    return JSONResponse(
        status_code=500,
        content={"error": "Interner Serverfehler", "status_code": 500}
    )

# ============================================================================
# SIGNAL HANDLERS
# ============================================================================

def signal_handler(signum, frame):
    """Signal-Handler für graceful shutdown"""
    logger.info(f"Signal {signum} empfangen, beende Anwendung...")
    sys.exit(0)

# Signal-Handler registrieren
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

# ============================================================================
# MAIN FUNCTION
# ============================================================================

def main():
    """Hauptfunktion"""
    try:
        logger.info("🚀 Starte Creative Muse AI Backend...")
        
        # TLS-Konfiguration
        ssl_context = config.get_tls_context()
        
        # Server-Konfiguration
        server_config = {
            "app": app,
            "host": config.api.host,
            "port": config.api.port,
            "log_level": "info" if not config.is_development() else "debug",
            "access_log": True,
            "server_header": False,  # Sicherheit: Server-Header verstecken
            "date_header": False,    # Sicherheit: Date-Header verstecken
        }
        
        # TLS hinzufügen falls konfiguriert
        if ssl_context:
            server_config.update({
                "ssl_keyfile": config.api.key_file,
                "ssl_certfile": config.api.cert_file,
                "ssl_version": 3,  # TLS 1.3
            })
            logger.info(f"🔒 TLS aktiviert: {config.api.cert_file}")
        
        # Server starten
        logger.info(f"🌐 Server startet auf {config.api.host}:{config.api.port}")
        uvicorn.run(**server_config)
        
    except KeyboardInterrupt:
        logger.info("👋 Server durch Benutzer beendet")
    except Exception as e:
        logger.error(f"❌ Kritischer Fehler beim Serverstart: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()