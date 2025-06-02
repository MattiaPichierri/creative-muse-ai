"""
Creative Muse AI - Authentication Router
Router per gestione autenticazione e utenti
"""

import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer

from models.api_models import (
    UserRegistration, UserLogin, ForgotPasswordRequest,
    ResetPasswordRequest, UserProfile, SuccessResponse
)
from auth_service import get_current_user
from rate_limiter import rate_limiter, LimitType

logger = logging.getLogger(__name__)
security = HTTPBearer()

# Router per autenticazione
router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


@router.post("/register", response_model=Dict[str, Any])
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
        from auth_service import auth_service
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
        
    except HTTPException:
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


@router.post("/login", response_model=Dict[str, Any])
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
        from auth_service import auth_service
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
        
    except HTTPException:
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


@router.post("/forgot-password", response_model=SuccessResponse)
async def forgot_password(request_data: ForgotPasswordRequest):
    """Richiesta reset password"""
    try:
        from auth_service import auth_service
        result = await auth_service.request_password_reset(request_data.email)
        return SuccessResponse(
            success=True,
            message="Email di reset inviata se l'account esiste",
            data=result
        )
    except Exception as e:
        logger.error(f"❌ Errore forgot password: {e}")
        # Non rivelare se l'email esiste o meno
        return SuccessResponse(
            success=True,
            message="Email di reset inviata se l'account esiste"
        )


@router.post("/reset-password", response_model=SuccessResponse)
async def reset_password(reset_data: ResetPasswordRequest):
    """Reset password con token"""
    try:
        from auth_service import auth_service
        result = await auth_service.reset_password(
            reset_data.token, 
            reset_data.new_password
        )
        return SuccessResponse(
            success=True,
            message="Password aggiornata con successo",
            data=result
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore reset password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore interno del server"
        )


@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user=Depends(get_current_user)):
    """Ottieni profilo utente corrente"""
    try:
        from auth_service import auth_service
        profile = await auth_service.get_user_profile(current_user.id)
        return profile
    except Exception as e:
        logger.error(f"❌ Errore get profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero del profilo"
        )


@router.post("/logout", response_model=SuccessResponse)
async def logout(current_user=Depends(get_current_user)):
    """Logout utente"""
    try:
        from auth_service import auth_service
        await auth_service.logout_user(current_user.id)
        return SuccessResponse(
            success=True,
            message="Logout effettuato con successo"
        )
    except Exception as e:
        logger.error(f"❌ Errore logout: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore durante il logout"
        )


@router.post("/verify-email/{token}", response_model=SuccessResponse)
async def verify_email(token: str):
    """Verifica email con token"""
    try:
        from auth_service import auth_service
        result = await auth_service.verify_email(token)
        return SuccessResponse(
            success=True,
            message="Email verificata con successo",
            data=result
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore verifica email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nella verifica email"
        )


@router.get("/me", response_model=UserProfile)
async def get_current_user_info(current_user=Depends(get_current_user)):
    """Ottieni informazioni utente corrente (alias per /profile)"""
    return await get_profile(current_user)