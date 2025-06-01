#!/usr/bin/env python3
"""
Creative Muse AI - Authentication & Subscription Service
Sistema di autenticazione, gestione utenti e abbonamenti
"""

import os
import sqlite3
import hashlib
import secrets
import jwt
import stripe
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from enum import Enum
import logging
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import bcrypt
import uuid

logger = logging.getLogger(__name__)

# Configurazione Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")

# Configurazione JWT
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-here")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

security = HTTPBearer()


class SubscriptionTier(Enum):
    """Tier di abbonamento disponibili"""
    FREE = "free"
    CREATOR = "creator"
    PRO = "pro"
    ENTERPRISE = "enterprise"


@dataclass
class User:
    """Modello utente"""
    id: str
    uuid: str
    email: str
    username: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    is_active: bool
    email_verified: bool
    subscription_tier: SubscriptionTier
    created_at: datetime
    last_login_at: Optional[datetime]


@dataclass
class SubscriptionLimits:
    """Limiti per tier di abbonamento"""
    daily_ideas_limit: int
    monthly_ideas_limit: int
    max_team_members: int
    max_projects: int
    features: Dict[str, Any]


class AuthService:
    """Servizio di autenticazione e gestione utenti"""
    
    def __init__(self, db_path: str = "../database/creative_muse.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Inizializza le tabelle del database se non esistono"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Il database è già stato inizializzato con setup_subscription_plans.py
                # Verifica solo che le tabelle esistano
                cursor = conn.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='subscription_plans'")
                if cursor.fetchone():
                    logger.info("✅ Database subscription schema già presente")
                else:
                    logger.warning("⚠️ Tabelle subscription non trovate, usa setup_subscription_plans.py")
                conn.commit()
        except Exception as e:
            logger.error(f"❌ Errore inizializzazione database: {e}")
    
    def _hash_password(self, password: str) -> tuple[str, str]:
        """Hash sicuro della password con bcrypt"""
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        return password_hash, salt.decode('utf-8')
    
    def _verify_password(self, password: str, hashed: str) -> bool:
        """Verifica password contro hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def _generate_jwt_token(self, user_id: str, email: str) -> str:
        """Genera JWT token per l'utente"""
        payload = {
            "user_id": user_id,
            "email": email,
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
            "iat": datetime.utcnow()
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    def _verify_jwt_token(self, token: str) -> Dict[str, Any]:
        """Verifica e decodifica JWT token"""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token scaduto"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token non valido"
            )
    
    async def register_user(self, email: str, password: str, 
                          username: Optional[str] = None,
                          first_name: Optional[str] = None,
                          last_name: Optional[str] = None) -> Dict[str, Any]:
        """Registra un nuovo utente"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Verifica se email già esiste
                cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
                if cursor.fetchone():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Email già registrata"
                    )
                
                # Verifica se username già esiste (se fornito)
                if username:
                    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
                    if cursor.fetchone():
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Username già in uso"
                        )
                
                # Hash password
                password_hash, salt = self._hash_password(password)
                user_uuid = str(uuid.uuid4())
                user_id = str(uuid.uuid4())  # Generate unique ID for TEXT PRIMARY KEY
                
                # Generate username if not provided
                if not username:
                    username = f"user_{user_uuid[:8]}"
                
                # Inserisci nuovo utente
                cursor.execute("""
                    INSERT INTO users (id, uuid, email, username, password_hash, salt,
                                     first_name, last_name, email_verified)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (user_id, user_uuid, email, username, password_hash, salt,
                      first_name, last_name, False))
                
                # Assegna piano gratuito di default
                cursor.execute("SELECT id FROM subscription_plans WHERE plan_code = 'free'")
                free_plan = cursor.fetchone()
                if free_plan:
                    cursor.execute("""
                        INSERT INTO user_subscriptions (user_id, plan_id, status)
                        VALUES (?, ?, 'active')
                    """, (user_id, free_plan[0]))
                
                # Inizializza livello utente
                cursor.execute("""
                    INSERT INTO user_levels (user_id, total_points, current_level)
                    VALUES (?, 0, 1)
                """, (user_id,))
                
                conn.commit()
                
                # Genera token JWT
                token = self._generate_jwt_token(user_id, email)
                
                logger.info(f"✅ Nuovo utente registrato: {email}")
                
                return {
                    "user_id": user_id,
                    "email": email,
                    "token": token,
                    "subscription_tier": "free",
                    "message": "Registrazione completata con successo"
                }
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Errore registrazione utente: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Errore interno del server"
            )
    
    async def login_user(self, email: str, password: str) -> Dict[str, Any]:
        """Autentica un utente"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Trova utente per email
                cursor.execute("""
                    SELECT u.id, u.uuid, u.email, u.username, u.password_hash, 
                           u.first_name, u.last_name, u.is_active, u.email_verified,
                           sp.plan_code
                    FROM users u
                    LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
                    LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
                    WHERE u.email = ?
                """, (email,))
                
                user_data = cursor.fetchone()
                if not user_data:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Credenziali non valide"
                    )
                
                user_id, user_uuid, user_email, username, password_hash, \
                first_name, last_name, is_active, email_verified, plan_code = user_data
                
                # Verifica password
                if not self._verify_password(password, password_hash):
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Credenziali non valide"
                    )
                
                # Verifica se account è attivo
                if not is_active:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Account disattivato"
                    )
                
                # Aggiorna ultimo login
                cursor.execute("""
                    UPDATE users 
                    SET last_login_at = CURRENT_TIMESTAMP, login_count = login_count + 1
                    WHERE id = ?
                """, (user_id,))
                
                conn.commit()
                
                # Genera token JWT
                token = self._generate_jwt_token(user_id, email)
                
                logger.info(f"✅ Login utente: {email}")
                
                return {
                    "user_id": user_id,
                    "email": user_email,
                    "username": username,
                    "first_name": first_name,
                    "last_name": last_name,
                    "token": token,
                    "subscription_tier": plan_code or "free",
                    "email_verified": email_verified,
                    "message": "Login effettuato con successo"
                }
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Errore login utente: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Errore interno del server"
            )
    
    async def get_current_user(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
        """Ottieni utente corrente dal token JWT"""
        try:
            token = credentials.credentials
            payload = self._verify_jwt_token(token)
            user_id = payload.get("user_id")
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT u.id, u.uuid, u.email, u.username, u.first_name, u.last_name,
                           u.is_active, u.email_verified, u.created_at, u.last_login_at,
                           sp.plan_code
                    FROM users u
                    LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
                    LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
                    WHERE u.id = ? AND u.is_active = TRUE
                """, (user_id,))
                
                user_data = cursor.fetchone()
                if not user_data:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Utente non trovato"
                    )
                
                return User(
                    id=user_data[0],
                    uuid=user_data[1],
                    email=user_data[2],
                    username=user_data[3],
                    first_name=user_data[4],
                    last_name=user_data[5],
                    is_active=user_data[6],
                    email_verified=user_data[7],
                    subscription_tier=SubscriptionTier(user_data[10] or "free"),
                    created_at=datetime.fromisoformat(user_data[8]),
                    last_login_at=datetime.fromisoformat(user_data[9]) if user_data[9] else None
                )
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Errore get_current_user: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token non valido"
            )
    
    def get_subscription_limits(self, tier) -> SubscriptionLimits:
        """Ottieni limiti per tier di abbonamento"""
        try:
            # Converti tier in string se è un Enum
            tier_value = tier.value if hasattr(tier, 'value') else str(tier)
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT daily_ideas_limit, monthly_ideas_limit, max_team_members,
                           max_projects, features
                    FROM subscription_plans
                    WHERE plan_code = ?
                """, (tier_value,))
                
                plan_data = cursor.fetchone()
                if not plan_data:
                    # Fallback ai limiti free
                    return SubscriptionLimits(
                        daily_ideas_limit=5,
                        monthly_ideas_limit=150,
                        max_team_members=1,
                        max_projects=3,
                        features={"ai_models": ["mock"], "export_formats": ["json"]}
                    )
                
                import json
                features = json.loads(plan_data[4]) if plan_data[4] else {}
                
                return SubscriptionLimits(
                    daily_ideas_limit=plan_data[0],
                    monthly_ideas_limit=plan_data[1],
                    max_team_members=plan_data[2],
                    max_projects=plan_data[3],
                    features=features
                )
                
        except Exception as e:
            logger.error(f"❌ Errore get_subscription_limits: {e}")
            # Fallback sicuro
            return SubscriptionLimits(
                daily_ideas_limit=5,
                monthly_ideas_limit=150,
                max_team_members=1,
                max_projects=3,
                features={"ai_models": ["mock"]}
            )
    
    async def check_usage_limits(self, user: User, action: str = "generate_idea") -> bool:
        """Verifica se l'utente può eseguire l'azione richiesta"""
        try:
            limits = self.get_subscription_limits(user.subscription_tier)
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Controlla usage giornaliero
                today = datetime.now().date()
                cursor.execute("""
                    SELECT ideas_generated FROM user_usage
                    WHERE user_id = ? AND date = ?
                """, (user.id, today))
                
                usage_data = cursor.fetchone()
                daily_usage = usage_data[0] if usage_data else 0
                
                # Verifica limite giornaliero (-1 = illimitato)
                if limits.daily_ideas_limit != -1 and daily_usage >= limits.daily_ideas_limit:
                    return False
                
                # Controlla usage mensile
                month_start = today.replace(day=1)
                cursor.execute("""
                    SELECT SUM(ideas_generated) FROM user_usage
                    WHERE user_id = ? AND date >= ?
                """, (user.id, month_start))
                
                monthly_usage = cursor.fetchone()[0] or 0
                
                # Verifica limite mensile (-1 = illimitato)
                if limits.monthly_ideas_limit != -1 and monthly_usage >= limits.monthly_ideas_limit:
                    return False
                
                return True
                
        except Exception as e:
            logger.error(f"❌ Errore check_usage_limits: {e}")
            return False
    
    async def track_usage(self, user: User, action: str = "generate_idea", 
                         metadata: Optional[Dict] = None):
        """Traccia l'utilizzo dell'utente"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                today = datetime.now().date()
                
                # Inserisci o aggiorna usage giornaliero
                cursor.execute("""
                    INSERT INTO user_usage (user_id, date, ideas_generated)
                    VALUES (?, ?, 1)
                    ON CONFLICT(user_id, date) DO UPDATE SET
                        ideas_generated = ideas_generated + 1,
                        updated_at = CURRENT_TIMESTAMP
                """, (user.id, today))
                
                conn.commit()
                logger.debug(f"✅ Usage tracked per utente {user.id}: {action}")
                
        except Exception as e:
            logger.error(f"❌ Errore track_usage: {e}")


# Istanza globale del servizio
auth_service = AuthService()


# Dependency per ottenere utente corrente
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Dependency per ottenere l'utente corrente autenticato"""
    return await auth_service.get_current_user(credentials)


# Dependency per verificare limiti
async def check_user_limits(user: User = Depends(get_current_user)) -> User:
    """Dependency per verificare i limiti dell'utente"""
    can_proceed = await auth_service.check_usage_limits(user)
    if not can_proceed:
        limits = auth_service.get_subscription_limits(user.subscription_tier)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Limite giornaliero raggiunto ({limits.daily_ideas_limit} idee). Aggiorna il tuo piano per continuare."
        )
    return user