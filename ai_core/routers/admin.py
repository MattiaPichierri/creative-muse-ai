"""
Creative Muse AI - Admin Router
Router per funzionalità amministrative
"""

import logging
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status

from models.api_models import (
    FeatureFlagUpdate, UserOverrideCreate, AdminStats,
    SuccessResponse, RateLimitStatsResponse, UnblockRequest,
    RateLimitOverview
)
from auth_service import get_current_user
from admin_service import AdminService
from rate_limit_admin import (
    get_rate_limit_stats, unblock_identifier, get_rate_limit_overview,
    cleanup_rate_limit_records, get_blocked_identifiers
)

logger = logging.getLogger(__name__)

# Router per admin
router = APIRouter(prefix="/api/v1/admin", tags=["administration"])


async def require_admin_user(current_user=Depends(get_current_user)):
    """Richiede che l'utente sia admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accesso riservato agli amministratori"
        )
    return current_user


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(admin_user=Depends(require_admin_user)):
    """Ottieni statistiche amministrative"""
    try:
        admin_service = AdminService()
        stats = await admin_service.get_system_stats()
        return stats
    except Exception as e:
        logger.error(f"❌ Errore get admin stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero delle statistiche"
        )


@router.get("/users", response_model=List[dict])
async def get_all_users(
    admin_user=Depends(require_admin_user),
    limit: int = 100,
    offset: int = 0
):
    """Ottieni lista utenti"""
    try:
        admin_service = AdminService()
        users = await admin_service.get_all_users(limit=limit, offset=offset)
        return users
    except Exception as e:
        logger.error(f"❌ Errore get users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero degli utenti"
        )


@router.post("/users/{user_id}/suspend", response_model=SuccessResponse)
async def suspend_user(
    user_id: str,
    reason: str,
    admin_user=Depends(require_admin_user)
):
    """Sospendi utente"""
    try:
        admin_service = AdminService()
        success = await admin_service.suspend_user(
            user_id, reason, admin_user.id
        )
        
        if success:
            return SuccessResponse(
                success=True,
                message=f"Utente {user_id} sospeso con successo"
            )
        else:
            raise HTTPException(
                status_code=404,
                detail="Utente non trovato"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore suspend user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nella sospensione dell'utente"
        )


@router.post("/users/{user_id}/unsuspend", response_model=SuccessResponse)
async def unsuspend_user(
    user_id: str,
    admin_user=Depends(require_admin_user)
):
    """Riattiva utente sospeso"""
    try:
        admin_service = AdminService()
        success = await admin_service.unsuspend_user(user_id, admin_user.id)
        
        if success:
            return SuccessResponse(
                success=True,
                message=f"Utente {user_id} riattivato con successo"
            )
        else:
            raise HTTPException(
                status_code=404,
                detail="Utente non trovato"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore unsuspend user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nella riattivazione dell'utente"
        )


@router.get("/feature-flags", response_model=List[dict])
async def get_feature_flags(admin_user=Depends(require_admin_user)):
    """Ottieni lista feature flags"""
    try:
        from feature_flags_service import get_feature_flags_service
        service = get_feature_flags_service()
        flags = await service.get_all_flags()
        return flags
    except Exception as e:
        logger.error(f"❌ Errore get feature flags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero dei feature flags"
        )


@router.post("/feature-flags", response_model=SuccessResponse)
async def update_feature_flag(
    flag_update: FeatureFlagUpdate,
    admin_user=Depends(require_admin_user)
):
    """Aggiorna feature flag"""
    try:
        from feature_flags_service import get_feature_flags_service
        service = get_feature_flags_service()
        
        success = await service.update_flag(
            flag_update.flag_name,
            flag_update.enabled,
            flag_update.description
        )
        
        if success:
            return SuccessResponse(
                success=True,
                message=f"Feature flag {flag_update.flag_name} aggiornato"
            )
        else:
            raise HTTPException(
                status_code=404,
                detail="Feature flag non trovato"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore update feature flag: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nell'aggiornamento del feature flag"
        )


@router.post("/user-overrides", response_model=SuccessResponse)
async def create_user_override(
    override: UserOverrideCreate,
    admin_user=Depends(require_admin_user)
):
    """Crea override per utente specifico"""
    try:
        from feature_flags_service import get_feature_flags_service
        service = get_feature_flags_service()
        
        success = await service.create_user_override(
            override.user_id,
            override.flag_name,
            override.enabled,
            override.reason
        )
        
        if success:
            return SuccessResponse(
                success=True,
                message="Override utente creato con successo"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Impossibile creare override"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore create user override: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nella creazione dell'override"
        )


@router.get("/rate-limits/stats", response_model=List[RateLimitStatsResponse])
async def get_rate_limit_statistics(
    admin_user=Depends(require_admin_user)
):
    """Ottieni statistiche rate limiting"""
    try:
        stats = await get_rate_limit_stats()
        return stats
    except Exception as e:
        logger.error(f"❌ Errore get rate limit stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero delle statistiche rate limiting"
        )


@router.get("/rate-limits/overview", response_model=RateLimitOverview)
async def get_rate_limit_overview_endpoint(
    admin_user=Depends(require_admin_user)
):
    """Ottieni panoramica rate limiting"""
    try:
        overview = await get_rate_limit_overview()
        return overview
    except Exception as e:
        logger.error(f"❌ Errore get rate limit overview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero della panoramica rate limiting"
        )


@router.get("/rate-limits/blocked", response_model=List[str])
async def get_blocked_identifiers_endpoint(
    admin_user=Depends(require_admin_user)
):
    """Ottieni identificatori bloccati"""
    try:
        blocked = await get_blocked_identifiers()
        return blocked
    except Exception as e:
        logger.error(f"❌ Errore get blocked identifiers: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero degli identificatori bloccati"
        )


@router.post("/rate-limits/unblock", response_model=SuccessResponse)
async def unblock_identifier_endpoint(
    unblock_request: UnblockRequest,
    admin_user=Depends(require_admin_user)
):
    """Sblocca identificatore dal rate limiting"""
    try:
        success = await unblock_identifier(
            unblock_request.identifier,
            unblock_request.limit_type,
            unblock_request.reason
        )
        
        if success:
            return SuccessResponse(
                success=True,
                message=(
                    f"Identificatore {unblock_request.identifier} sbloccato"
                )
            )
        else:
            raise HTTPException(
                status_code=404,
                detail="Identificatore non trovato nei blocchi"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore unblock identifier: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nello sblocco dell'identificatore"
        )


@router.post("/rate-limits/cleanup", response_model=SuccessResponse)
async def cleanup_rate_limits(
    admin_user=Depends(require_admin_user)
):
    """Pulisci record rate limiting scaduti"""
    try:
        cleaned = await cleanup_rate_limit_records()
        return SuccessResponse(
            success=True,
            message=f"Puliti {cleaned} record scaduti",
            data={"cleaned_records": cleaned}
        )
    except Exception as e:
        logger.error(f"❌ Errore cleanup rate limits: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nella pulizia dei record"
        )


@router.get("/system/health", response_model=dict)
async def get_system_health(admin_user=Depends(require_admin_user)):
    """Ottieni stato salute sistema"""
    try:
        admin_service = AdminService()
        health = await admin_service.get_system_health()
        return health
    except Exception as e:
        logger.error(f"❌ Errore get system health: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel controllo dello stato del sistema"
        )


@router.post("/system/maintenance", response_model=SuccessResponse)
async def toggle_maintenance_mode(
    enabled: bool,
    admin_user=Depends(require_admin_user)
):
    """Attiva/disattiva modalità manutenzione"""
    try:
        admin_service = AdminService()
        await admin_service.set_maintenance_mode(enabled)
        
        status_text = "attivata" if enabled else "disattivata"
        return SuccessResponse(
            success=True,
            message=f"Modalità manutenzione {status_text}"
        )
    except Exception as e:
        logger.error(f"❌ Errore toggle maintenance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel cambio modalità manutenzione"
        )