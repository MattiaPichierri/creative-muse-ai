"""
Creative Muse AI - Subscription Router
Router per gestione abbonamenti e pagamenti
"""

import logging
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status

from models.api_models import (
    SubscriptionInfo, SuccessResponse
)
from auth_service import get_current_user

logger = logging.getLogger(__name__)

# Router per subscription
router = APIRouter(prefix="/api/v1/subscription", tags=["subscription"])


@router.get("/info", response_model=SubscriptionInfo)
async def get_subscription_info(current_user=Depends(get_current_user)):
    """Ottieni informazioni abbonamento corrente"""
    try:
        from auth_service import auth_service
        subscription = await auth_service.get_subscription_info(
            current_user.id
        )
        return subscription
    except Exception as e:
        logger.error(f"❌ Errore get subscription info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero delle informazioni abbonamento"
        )


@router.get("/plans", response_model=List[dict])
async def get_subscription_plans():
    """Ottieni piani di abbonamento disponibili"""
    try:
        from auth_service import auth_service
        plans = await auth_service.get_subscription_plans()
        return plans
    except Exception as e:
        logger.error(f"❌ Errore get subscription plans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero dei piani"
        )


@router.post("/upgrade/{plan_id}", response_model=dict)
async def upgrade_subscription(
    plan_id: str,
    current_user=Depends(get_current_user)
):
    """Avvia processo di upgrade abbonamento"""
    try:
        from auth_service import auth_service
        
        # Crea sessione di pagamento Stripe
        session = await auth_service.create_checkout_session(
            user_id=current_user.id,
            plan_id=plan_id
        )
        
        return {
            "checkout_url": session.url,
            "session_id": session.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore upgrade subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nell'avvio dell'upgrade"
        )


@router.post("/cancel", response_model=SuccessResponse)
async def cancel_subscription(current_user=Depends(get_current_user)):
    """Cancella abbonamento corrente"""
    try:
        from auth_service import auth_service
        
        success = await auth_service.cancel_subscription(current_user.id)
        
        if success:
            return SuccessResponse(
                success=True,
                message="Abbonamento cancellato con successo"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Nessun abbonamento attivo da cancellare"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore cancel subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nella cancellazione dell'abbonamento"
        )


@router.get("/usage", response_model=dict)
async def get_usage_stats(current_user=Depends(get_current_user)):
    """Ottieni statistiche utilizzo corrente"""
    try:
        from auth_service import auth_service
        usage = await auth_service.get_usage_stats(current_user.id)
        return usage
    except Exception as e:
        logger.error(f"❌ Errore get usage stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero delle statistiche utilizzo"
        )


@router.get("/billing/history", response_model=List[dict])
async def get_billing_history(
    current_user=Depends(get_current_user),
    limit: int = 20
):
    """Ottieni storico fatturazione"""
    try:
        from auth_service import auth_service
        history = await auth_service.get_billing_history(
            current_user.id, 
            limit=limit
        )
        return history
    except Exception as e:
        logger.error(f"❌ Errore get billing history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero dello storico fatturazione"
        )


@router.post("/webhook/stripe")
async def stripe_webhook(request):
    """Webhook per eventi Stripe"""
    try:
        from auth_service import auth_service
        
        # Verifica signature Stripe
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        event = await auth_service.handle_stripe_webhook(payload, sig_header)
        
        return {"status": "success", "event_type": event.type}
        
    except Exception as e:
        logger.error(f"❌ Errore stripe webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhook non valido"
        )


@router.get("/portal", response_model=dict)
async def get_customer_portal(current_user=Depends(get_current_user)):
    """Ottieni link al portale cliente Stripe"""
    try:
        from auth_service import auth_service
        
        portal_url = await auth_service.create_customer_portal_session(
            current_user.id
        )
        
        return {"portal_url": portal_url}
        
    except Exception as e:
        logger.error(f"❌ Errore customer portal: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nella creazione del portale cliente"
        )


@router.post("/reactivate", response_model=SuccessResponse)
async def reactivate_subscription(current_user=Depends(get_current_user)):
    """Riattiva abbonamento cancellato"""
    try:
        from ..auth_service import auth_service
        
        success = await auth_service.reactivate_subscription(current_user.id)
        
        if success:
            return SuccessResponse(
                success=True,
                message="Abbonamento riattivato con successo"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Impossibile riattivare l'abbonamento"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore reactivate subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nella riattivazione dell'abbonamento"
        )


@router.get("/features", response_model=dict)
async def get_subscription_features(current_user=Depends(get_current_user)):
    """Ottieni features disponibili per abbonamento corrente"""
    try:
        from ..feature_flags_service import get_feature_flags_service
        service = get_feature_flags_service()
        
        features = await service.get_user_features(current_user.id)
        return {"features": features}
        
    except Exception as e:
        logger.error(f"❌ Errore get subscription features: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero delle features"
        )