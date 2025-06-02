#!/usr/bin/env python3
"""
Creative Muse AI - Rate Limiting Admin Endpoints
Endpoints amministrativi per gestire il rate limiting
"""

import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, Depends
from pydantic import BaseModel

from rate_limiter import rate_limiter, LimitType
from auth_service import get_current_user, User

logger = logging.getLogger(__name__)


class RateLimitStatsResponse(BaseModel):
    """Response per statistiche rate limiting"""
    identifier: str
    limit_type: str
    total_attempts: int
    failed_attempts: int
    remaining_attempts: int
    is_blocked: bool
    blocked_until: Optional[str]
    block_reason: Optional[str]
    last_attempt: Optional[str]


class UnblockRequest(BaseModel):
    """Request per sbloccare un identificatore"""
    identifier: str
    limit_type: str


class RateLimitOverview(BaseModel):
    """Overview generale del rate limiting"""
    total_attempts_24h: int
    total_blocks_active: int
    top_blocked_ips: List[Dict[str, Any]]
    top_blocked_emails: List[Dict[str, Any]]
    limit_configurations: Dict[str, Dict[str, Any]]


def require_admin_user(current_user: User = Depends(get_current_user)):
    """Verifica che l'utente sia admin"""
    # Per ora controllo semplice - in produzione usare ruoli più sofisticati
    if not current_user.email.endswith("@creativemuse.com"):
        raise HTTPException(
            status_code=403,
            detail="Accesso negato: privilegi amministratore richiesti"
        )
    return current_user


async def get_rate_limit_stats(
    identifier: str,
    limit_type: str,
    current_user: User = Depends(require_admin_user)
) -> RateLimitStatsResponse:
    """Ottieni statistiche rate limiting per un identificatore specifico"""
    try:
        limit_type_enum = LimitType(limit_type)
        stats = rate_limiter.get_attempt_stats(identifier, limit_type_enum)
        
        return RateLimitStatsResponse(
            identifier=identifier,
            limit_type=limit_type,
            total_attempts=stats.get("total_attempts", 0),
            failed_attempts=stats.get("failed_attempts", 0),
            remaining_attempts=stats.get("remaining_attempts", 0),
            is_blocked=stats.get("is_blocked", False),
            blocked_until=stats.get("blocked_until"),
            block_reason=stats.get("block_reason"),
            last_attempt=stats.get("last_attempt")
        )
        
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo di limite non valido: {limit_type}"
        )
    except Exception as e:
        logger.error(f"❌ Errore recupero statistiche rate limit: {e}")
        raise HTTPException(
            status_code=500,
            detail="Errore interno del server"
        )


async def unblock_identifier(
    request: UnblockRequest,
    current_user: User = Depends(require_admin_user)
) -> Dict[str, Any]:
    """Sblocca manualmente un identificatore"""
    try:
        limit_type_enum = LimitType(request.limit_type)
        success = rate_limiter.unblock_identifier(
            request.identifier, 
            limit_type_enum
        )
        
        if success:
            logger.info(
                f"🔓 Admin {current_user.email} ha sbloccato {request.identifier} "
                f"per {request.limit_type}"
            )
            return {
                "success": True,
                "message": f"Identificatore {request.identifier} sbloccato con successo",
                "unblocked_by": current_user.email,
                "unblocked_at": datetime.now().isoformat()
            }
        else:
            return {
                "success": False,
                "message": f"Nessun blocco trovato per {request.identifier}"
            }
            
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo di limite non valido: {request.limit_type}"
        )
    except Exception as e:
        logger.error(f"❌ Errore sblocco identificatore: {e}")
        raise HTTPException(
            status_code=500,
            detail="Errore interno del server"
        )


async def get_rate_limit_overview(
    current_user: User = Depends(require_admin_user)
) -> RateLimitOverview:
    """Ottieni overview generale del rate limiting"""
    try:
        import sqlite3
        
        with sqlite3.connect(rate_limiter.db_path) as conn:
            cursor = conn.cursor()
            
            # Tentativi nelle ultime 24 ore
            yesterday = datetime.now() - timedelta(days=1)
            cursor.execute("""
                SELECT COUNT(*) 
                FROM rate_limit_attempts 
                WHERE attempt_time > ?
            """, (yesterday,))
            total_attempts_24h = cursor.fetchone()[0]
            
            # Blocchi attivi
            cursor.execute("""
                SELECT COUNT(*) 
                FROM rate_limit_blocks 
                WHERE blocked_until > ?
            """, (datetime.now(),))
            total_blocks_active = cursor.fetchone()[0]
            
            # Top IP bloccati (ultimi 7 giorni)
            week_ago = datetime.now() - timedelta(days=7)
            cursor.execute("""
                SELECT ra.ip_address, COUNT(*) as attempts, 
                       MAX(ra.attempt_time) as last_attempt
                FROM rate_limit_attempts ra
                JOIN rate_limit_blocks rb ON ra.identifier_hash = rb.identifier_hash
                WHERE ra.attempt_time > ? AND ra.success = FALSE
                  AND rb.blocked_until > ?
                GROUP BY ra.ip_address
                ORDER BY attempts DESC
                LIMIT 10
            """, (week_ago, datetime.now()))
            
            top_blocked_ips = [
                {
                    "ip_address": row[0],
                    "failed_attempts": row[1],
                    "last_attempt": row[2]
                }
                for row in cursor.fetchall()
            ]
            
            # Configurazioni limite
            limit_configurations = {}
            for limit_type in LimitType:
                config = rate_limiter.limits[limit_type]
                limit_configurations[limit_type.value] = {
                    "max_attempts": config.max_attempts,
                    "window_minutes": config.window_minutes,
                    "block_duration_minutes": config.block_duration_minutes
                }
        
        return RateLimitOverview(
            total_attempts_24h=total_attempts_24h,
            total_blocks_active=total_blocks_active,
            top_blocked_ips=top_blocked_ips,
            top_blocked_emails=[],  # Non esponiamo email per privacy
            limit_configurations=limit_configurations
        )
        
    except Exception as e:
        logger.error(f"❌ Errore recupero overview rate limiting: {e}")
        raise HTTPException(
            status_code=500,
            detail="Errore interno del server"
        )


async def cleanup_rate_limit_records(
    days_to_keep: int = 30,
    current_user: User = Depends(require_admin_user)
) -> Dict[str, Any]:
    """Pulisci record vecchi del rate limiting"""
    try:
        rate_limiter.cleanup_old_records(days_to_keep)
        
        logger.info(
            f"🧹 Admin {current_user.email} ha avviato cleanup rate limiting "
            f"(mantieni {days_to_keep} giorni)"
        )
        
        return {
            "success": True,
            "message": f"Cleanup completato, mantenuti record degli ultimi {days_to_keep} giorni",
            "cleaned_by": current_user.email,
            "cleaned_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Errore cleanup rate limiting: {e}")
        raise HTTPException(
            status_code=500,
            detail="Errore interno del server"
        )


async def get_blocked_identifiers(
    limit_type: Optional[str] = None,
    current_user: User = Depends(require_admin_user)
) -> List[Dict[str, Any]]:
    """Ottieni lista identificatori attualmente bloccati"""
    try:
        import sqlite3
        
        with sqlite3.connect(rate_limiter.db_path) as conn:
            cursor = conn.cursor()
            
            if limit_type:
                # Filtra per tipo specifico
                try:
                    limit_type_enum = LimitType(limit_type)
                    cursor.execute("""
                        SELECT identifier_hash, limit_type, blocked_until, 
                               block_reason, created_at
                        FROM rate_limit_blocks 
                        WHERE blocked_until > ? AND limit_type = ?
                        ORDER BY created_at DESC
                    """, (datetime.now(), limit_type))
                except ValueError:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Tipo di limite non valido: {limit_type}"
                    )
            else:
                # Tutti i blocchi attivi
                cursor.execute("""
                    SELECT identifier_hash, limit_type, blocked_until, 
                           block_reason, created_at
                    FROM rate_limit_blocks 
                    WHERE blocked_until > ?
                    ORDER BY created_at DESC
                """, (datetime.now(),))
            
            blocked_identifiers = []
            for row in cursor.fetchall():
                blocked_until_dt = datetime.fromisoformat(row[2])
                remaining_minutes = int(
                    (blocked_until_dt - datetime.now()).total_seconds() / 60
                )
                
                blocked_identifiers.append({
                    "identifier_hash": row[0][:8] + "...",  # Mostra solo parte per privacy
                    "limit_type": row[1],
                    "blocked_until": row[2],
                    "remaining_minutes": max(0, remaining_minutes),
                    "block_reason": row[3],
                    "blocked_since": row[4]
                })
            
            return blocked_identifiers
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore recupero identificatori bloccati: {e}")
        raise HTTPException(
            status_code=500,
            detail="Errore interno del server"
        )