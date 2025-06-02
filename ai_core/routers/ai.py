"""
Creative Muse AI - AI Router
Router per generazione idee e gestione modelli AI
"""

import logging
from typing import List
from fastapi import APIRouter, HTTPException, Depends, Request, status
from fastapi.responses import StreamingResponse

from models.api_models import (
    IdeaRequest, IdeaResponse, BatchIdeaRequest, ModelInfo,
    SuccessResponse
)
from auth_service import get_current_user, check_user_limits
from rate_limiter import rate_limiter, LimitType
from feature_middleware import (
    require_ai_model_selection, require_bulk_generation
)

logger = logging.getLogger(__name__)

# Router per AI
router = APIRouter(prefix="/api/v1/ai", tags=["artificial-intelligence"])


@router.post("/generate", response_model=IdeaResponse)
async def generate_idea(
    idea_request: IdeaRequest,
    request: Request,
    current_user=Depends(get_current_user)
):
    """Genera una singola idea"""
    
    # Controlla limiti utente
    await check_user_limits(current_user, "idea_generation")
    
    # Rate limiting per generazione idee
    user_allowed, user_error = rate_limiter.check_rate_limit(
        current_user.email, LimitType.IDEA_GENERATION, request
    )
    if not user_allowed:
        rate_limiter.record_attempt(
            current_user.email, LimitType.IDEA_GENERATION, request, False
        )
        raise HTTPException(status_code=429, detail=user_error)
    
    try:
        # Importa model manager
        import model_manager
        
        if not model_manager:
            raise HTTPException(
                status_code=503,
                detail="Servizio AI temporaneamente non disponibile"
            )
        
        # Genera idea
        result = await model_manager.generate_idea(
            prompt=idea_request.prompt,
            category=idea_request.category,
            creativity_level=idea_request.creativity_level,
            language=idea_request.language,
            model=idea_request.model,
            max_tokens=idea_request.max_tokens,
            temperature=idea_request.temperature,
            user_id=current_user.id
        )
        
        # Registra successo
        rate_limiter.record_attempt(
            current_user.email, LimitType.IDEA_GENERATION, request, True
        )
        
        return result
        
    except HTTPException:
        rate_limiter.record_attempt(
            current_user.email, LimitType.IDEA_GENERATION, request, False
        )
        raise
    except Exception as e:
        logger.error(f"❌ Errore generazione idea: {e}")
        rate_limiter.record_attempt(
            current_user.email, LimitType.IDEA_GENERATION, request, False
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nella generazione dell'idea"
        )


@router.post("/generate/batch", response_model=List[IdeaResponse])
async def generate_batch_ideas(
    batch_request: BatchIdeaRequest,
    request: Request,
    current_user=Depends(get_current_user),
    _=Depends(require_bulk_generation)
):
    """Genera multiple idee in batch (richiede feature bulk_generation)"""
    
    # Controlla limiti utente
    await check_user_limits(current_user, "batch_generation")
    
    # Limita numero di prompt per batch
    if len(batch_request.prompts) > 10:
        raise HTTPException(
            status_code=400,
            detail="Massimo 10 prompt per batch"
        )
    
    # Rate limiting per batch generation
    user_allowed, user_error = rate_limiter.check_rate_limit(
        current_user.email, LimitType.BATCH_GENERATION, request
    )
    if not user_allowed:
        rate_limiter.record_attempt(
            current_user.email, LimitType.BATCH_GENERATION, request, False
        )
        raise HTTPException(status_code=429, detail=user_error)
    
    try:
        import model_manager
        
        if not model_manager:
            raise HTTPException(
                status_code=503,
                detail="Servizio AI temporaneamente non disponibile"
            )
        
        # Genera idee in batch
        results = await model_manager.generate_batch_ideas(
            prompts=batch_request.prompts,
            category=batch_request.category,
            creativity_level=batch_request.creativity_level,
            language=batch_request.language,
            model=batch_request.model,
            user_id=current_user.id
        )
        
        # Registra successo
        rate_limiter.record_attempt(
            current_user.email, LimitType.BATCH_GENERATION, request, True
        )
        
        return results
        
    except HTTPException:
        rate_limiter.record_attempt(
            current_user.email, LimitType.BATCH_GENERATION, request, False
        )
        raise
    except Exception as e:
        logger.error(f"❌ Errore batch generation: {e}")
        rate_limiter.record_attempt(
            current_user.email, LimitType.BATCH_GENERATION, request, False
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nella generazione batch"
        )


@router.get("/models", response_model=List[ModelInfo])
async def get_available_models(
    current_user=Depends(get_current_user),
    _=Depends(require_ai_model_selection)
):
    """Ottieni lista modelli AI disponibili"""
    try:
        import model_manager
        
        if not model_manager:
            return []
        
        models = model_manager.get_model_info()
        return models
        
    except Exception as e:
        logger.error(f"❌ Errore get models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero dei modelli"
        )


@router.post("/models/{model_key}/load", response_model=SuccessResponse)
async def load_model(
    model_key: str,
    current_user=Depends(get_current_user),
    _=Depends(require_ai_model_selection)
):
    """Carica un modello specifico"""
    try:
        from .. import model_manager
        
        if not model_manager:
            raise HTTPException(
                status_code=503,
                detail="Servizio AI non disponibile"
            )
        
        success = await model_manager.load_model(model_key)
        
        if success:
            return SuccessResponse(
                success=True,
                message=f"Modello {model_key} caricato con successo"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Impossibile caricare il modello {model_key}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore load model: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel caricamento del modello"
        )


@router.get("/ideas/history", response_model=List[IdeaResponse])
async def get_idea_history(
    current_user=Depends(get_current_user),
    limit: int = 50,
    offset: int = 0
):
    """Ottieni storico idee utente"""
    try:
        from auth_service import auth_service
        
        ideas = await auth_service.get_user_ideas(
            current_user.id, 
            limit=limit, 
            offset=offset
        )
        return ideas
        
    except Exception as e:
        logger.error(f"❌ Errore get history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero dello storico"
        )


@router.post("/ideas/{idea_id}/rate", response_model=SuccessResponse)
async def rate_idea(
    idea_id: str,
    rating: int,
    current_user=Depends(get_current_user)
):
    """Valuta un'idea (1-5 stelle)"""
    
    if not 1 <= rating <= 5:
        raise HTTPException(
            status_code=400,
            detail="Rating deve essere tra 1 e 5"
        )
    
    try:
        from ..auth_service import auth_service
        
        success = await auth_service.rate_idea(
            idea_id, 
            rating, 
            current_user.id
        )
        
        if success:
            return SuccessResponse(
                success=True,
                message="Valutazione salvata con successo"
            )
        else:
            raise HTTPException(
                status_code=404,
                detail="Idea non trovata"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore rate idea: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel salvare la valutazione"
        )


@router.get("/stream/generate")
async def stream_generate_idea(
    prompt: str,
    current_user=Depends(get_current_user),
    model: str = None,
    category: str = "general",
    creativity_level: int = 5
):
    """Genera idea in streaming (WebSocket alternativo)"""
    
    async def generate_stream():
        try:
            from .. import model_manager
            
            if not model_manager:
                yield "data: {\"error\": \"Servizio AI non disponibile\"}\n\n"
                return
            
            async for chunk in model_manager.stream_generate_idea(
                prompt=prompt,
                model=model,
                category=category,
                creativity_level=creativity_level,
                user_id=current_user.id
            ):
                yield f"data: {chunk}\n\n"
                
        except Exception as e:
            logger.error(f"❌ Errore stream generation: {e}")
            yield f"data: {{\"error\": \"{str(e)}\"}}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )