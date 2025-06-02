#!/usr/bin/env python3
"""
Creative Muse AI - Rate Limiting System
Sistema di rate limiting per prevenire brute force attacks
"""

import time
import sqlite3
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import hashlib
from fastapi import HTTPException, Request

logger = logging.getLogger(__name__)


class LimitType(Enum):
    """Tipi di rate limiting"""
    LOGIN_ATTEMPTS = "login_attempts"
    REGISTRATION_ATTEMPTS = "registration_attempts"
    PASSWORD_RESET = "password_reset"
    API_CALLS = "api_calls"


@dataclass
class RateLimit:
    """Configurazione rate limit"""
    max_attempts: int
    window_minutes: int
    block_duration_minutes: int


class RateLimiter:
    """Sistema di rate limiting per prevenire brute force attacks"""
    
    def __init__(self, db_path: str = "database/creative_muse.db"):
        self.db_path = db_path
        self._init_database()
        
        # Configurazioni rate limiting
        self.limits = {
            LimitType.LOGIN_ATTEMPTS: RateLimit(
                max_attempts=5,
                window_minutes=10,
                block_duration_minutes=15
            ),
            LimitType.REGISTRATION_ATTEMPTS: RateLimit(
                max_attempts=3,
                window_minutes=10,
                block_duration_minutes=30
            ),
            LimitType.PASSWORD_RESET: RateLimit(
                max_attempts=3,
                window_minutes=60,
                block_duration_minutes=60
            ),
            LimitType.API_CALLS: RateLimit(
                max_attempts=100,
                window_minutes=1,
                block_duration_minutes=5
            )
        }
    
    def _init_database(self):
        """Inizializza tabelle rate limiting"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Tabella per tracking tentativi
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS rate_limit_attempts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        identifier_hash TEXT NOT NULL,
                        limit_type TEXT NOT NULL,
                        attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        ip_address TEXT,
                        user_agent TEXT,
                        success BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Tabella per blocchi attivi
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS rate_limit_blocks (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        identifier_hash TEXT NOT NULL,
                        limit_type TEXT NOT NULL,
                        blocked_until TIMESTAMP NOT NULL,
                        block_reason TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(identifier_hash, limit_type)
                    )
                """)
                
                # Indici per performance
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_attempts_identifier_type 
                    ON rate_limit_attempts(identifier_hash, limit_type)
                """)
                
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_attempts_time 
                    ON rate_limit_attempts(attempt_time)
                """)
                
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_blocks_identifier_type 
                    ON rate_limit_blocks(identifier_hash, limit_type)
                """)
                
                conn.commit()
                logger.info("✅ Rate limiting database inizializzato")
                
        except Exception as e:
            logger.error(f"❌ Errore inizializzazione rate limiting DB: {e}")
    
    def _hash_identifier(self, identifier: str) -> str:
        """Hash dell'identificatore per privacy"""
        return hashlib.sha256(identifier.encode()).hexdigest()
    
    def _get_client_ip(self, request: Request) -> str:
        """Estrae IP del client considerando proxy"""
        # Controlla headers per proxy/load balancer
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback all'IP diretto
        return request.client.host if request.client else "unknown"
    
    def check_rate_limit(self, 
                        identifier: str, 
                        limit_type: LimitType, 
                        request: Request) -> Tuple[bool, Optional[str]]:
        """
        Controlla se l'identificatore ha superato il rate limit
        
        Returns:
            (is_allowed, error_message)
        """
        try:
            identifier_hash = self._hash_identifier(identifier)
            limit_config = self.limits[limit_type]
            now = datetime.now()
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 1. Controlla se c'è un blocco attivo
                cursor.execute("""
                    SELECT blocked_until, block_reason 
                    FROM rate_limit_blocks 
                    WHERE identifier_hash = ? AND limit_type = ? AND blocked_until > ?
                """, (identifier_hash, limit_type.value, now))
                
                block_result = cursor.fetchone()
                if block_result:
                    blocked_until, reason = block_result
                    blocked_until_dt = datetime.fromisoformat(blocked_until)
                    remaining_minutes = int((blocked_until_dt - now).total_seconds() / 60)
                    
                    return False, f"Account temporaneamente bloccato. Riprova tra {remaining_minutes} minuti. Motivo: {reason}"
                
                # 2. Conta tentativi nella finestra temporale
                window_start = now - timedelta(minutes=limit_config.window_minutes)
                
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM rate_limit_attempts 
                    WHERE identifier_hash = ? AND limit_type = ? 
                    AND attempt_time > ? AND success = FALSE
                """, (identifier_hash, limit_type.value, window_start))
                
                failed_attempts = cursor.fetchone()[0]
                
                # 3. Se superato il limite, crea blocco
                if failed_attempts >= limit_config.max_attempts:
                    blocked_until = now + timedelta(minutes=limit_config.block_duration_minutes)
                    
                    # Inserisci o aggiorna blocco
                    cursor.execute("""
                        INSERT OR REPLACE INTO rate_limit_blocks 
                        (identifier_hash, limit_type, blocked_until, block_reason)
                        VALUES (?, ?, ?, ?)
                    """, (
                        identifier_hash, 
                        limit_type.value, 
                        blocked_until,
                        f"Troppi tentativi falliti ({failed_attempts}/{limit_config.max_attempts})"
                    ))
                    
                    conn.commit()
                    
                    logger.warning(f"🚫 Rate limit superato per {limit_type.value}: {identifier} (IP: {self._get_client_ip(request)})")
                    
                    return False, f"Troppi tentativi falliti. Account bloccato per {limit_config.block_duration_minutes} minuti."
                
                return True, None
                
        except Exception as e:
            logger.error(f"❌ Errore controllo rate limit: {e}")
            # In caso di errore, permetti l'accesso (fail-open)
            return True, None
    
    def record_attempt(self, 
                      identifier: str, 
                      limit_type: LimitType, 
                      request: Request, 
                      success: bool = False):
        """Registra un tentativo di accesso"""
        try:
            identifier_hash = self._hash_identifier(identifier)
            ip_address = self._get_client_ip(request)
            user_agent = request.headers.get("User-Agent", "")[:500]  # Limita lunghezza
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    INSERT INTO rate_limit_attempts 
                    (identifier_hash, limit_type, ip_address, user_agent, success)
                    VALUES (?, ?, ?, ?, ?)
                """, (identifier_hash, limit_type.value, ip_address, user_agent, success))
                
                # Se successo, rimuovi eventuali blocchi
                if success:
                    cursor.execute("""
                        DELETE FROM rate_limit_blocks 
                        WHERE identifier_hash = ? AND limit_type = ?
                    """, (identifier_hash, limit_type.value))
                
                conn.commit()
                
                if success:
                    logger.info(f"✅ Tentativo riuscito per {limit_type.value}: {identifier}")
                else:
                    logger.warning(f"❌ Tentativo fallito per {limit_type.value}: {identifier} (IP: {ip_address})")
                    
        except Exception as e:
            logger.error(f"❌ Errore registrazione tentativo: {e}")
    
    def cleanup_old_records(self, days_to_keep: int = 30):
        """Pulisce record vecchi per mantenere performance"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days_to_keep)
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Rimuovi tentativi vecchi
                cursor.execute("""
                    DELETE FROM rate_limit_attempts 
                    WHERE created_at < ?
                """, (cutoff_date,))
                
                attempts_deleted = cursor.rowcount
                
                # Rimuovi blocchi scaduti
                cursor.execute("""
                    DELETE FROM rate_limit_blocks 
                    WHERE blocked_until < ?
                """, (datetime.now(),))
                
                blocks_deleted = cursor.rowcount
                
                conn.commit()
                
                logger.info(f"🧹 Cleanup rate limiting: {attempts_deleted} tentativi e {blocks_deleted} blocchi rimossi")
                
        except Exception as e:
            logger.error(f"❌ Errore cleanup rate limiting: {e}")
    
    def get_attempt_stats(self, identifier: str, limit_type: LimitType) -> Dict:
        """Ottieni statistiche tentativi per un identificatore"""
        try:
            identifier_hash = self._hash_identifier(identifier)
            limit_config = self.limits[limit_type]
            window_start = datetime.now() - timedelta(minutes=limit_config.window_minutes)
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Conta tentativi nella finestra
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_attempts,
                        SUM(CASE WHEN success = FALSE THEN 1 ELSE 0 END) as failed_attempts,
                        MAX(attempt_time) as last_attempt
                    FROM rate_limit_attempts 
                    WHERE identifier_hash = ? AND limit_type = ? AND attempt_time > ?
                """, (identifier_hash, limit_type.value, window_start))
                
                result = cursor.fetchone()
                total_attempts, failed_attempts, last_attempt = result
                
                # Controlla blocco attivo
                cursor.execute("""
                    SELECT blocked_until, block_reason 
                    FROM rate_limit_blocks 
                    WHERE identifier_hash = ? AND limit_type = ? AND blocked_until > ?
                """, (identifier_hash, limit_type.value, datetime.now()))
                
                block_info = cursor.fetchone()
                
                return {
                    "total_attempts": total_attempts or 0,
                    "failed_attempts": failed_attempts or 0,
                    "remaining_attempts": max(0, limit_config.max_attempts - (failed_attempts or 0)),
                    "window_minutes": limit_config.window_minutes,
                    "last_attempt": last_attempt,
                    "is_blocked": block_info is not None,
                    "blocked_until": block_info[0] if block_info else None,
                    "block_reason": block_info[1] if block_info else None
                }
                
        except Exception as e:
            logger.error(f"❌ Errore recupero statistiche: {e}")
            return {}
    
    def unblock_identifier(self, identifier: str, limit_type: LimitType) -> bool:
        """Sblocca manualmente un identificatore (per admin)"""
        try:
            identifier_hash = self._hash_identifier(identifier)
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    DELETE FROM rate_limit_blocks 
                    WHERE identifier_hash = ? AND limit_type = ?
                """, (identifier_hash, limit_type.value))
                
                conn.commit()
                
                if cursor.rowcount > 0:
                    logger.info(f"🔓 Sbloccato manualmente: {identifier} per {limit_type.value}")
                    return True
                
                return False
                
        except Exception as e:
            logger.error(f"❌ Errore sblocco manuale: {e}")
            return False


# Istanza globale del rate limiter
rate_limiter = RateLimiter()


def check_rate_limit_decorator(limit_type: LimitType):
    """Decorator per controllare rate limit su endpoint"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Estrai request dai parametri
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            if not request:
                # Se non troviamo Request, procedi senza rate limiting
                return await func(*args, **kwargs)
            
            # Usa IP come identificatore di default
            identifier = rate_limiter._get_client_ip(request)
            
            # Controlla rate limit
            is_allowed, error_message = rate_limiter.check_rate_limit(
                identifier, limit_type, request
            )
            
            if not is_allowed:
                raise HTTPException(
                    status_code=429,
                    detail=error_message
                )
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator