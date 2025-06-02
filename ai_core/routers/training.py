"""
Creative Muse AI - Training Router
Router per training e fine-tuning modelli AI
"""

import logging
from typing import List
from fastapi import (
    APIRouter, HTTPException, Depends, UploadFile, 
    File, Form, status
)

from models.api_models import (
    TrainingRequest, TrainingStatus, SuccessResponse
)
from auth_service import get_current_user
from feature_middleware import require_api_access

logger = logging.getLogger(__name__)

# Router per training
router = APIRouter(prefix="/api/v1/train", tags=["training"])


@router.post("/upload", response_model=dict)
async def upload_training_data(
    file: UploadFile = File(...),
    dataset_name: str = Form(...),
    description: str = Form(None),
    current_user=Depends(get_current_user),
    _=Depends(require_api_access)
):
    """Upload dataset per training"""
    
    # Verifica tipo file
    allowed_types = [
        "text/csv", "text/plain", "application/json",
        "application/jsonl", "text/jsonl"
    ]
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo file non supportato: {file.content_type}"
        )
    
    # Verifica dimensione file (max 100MB)
    max_size = 100 * 1024 * 1024  # 100MB
    if file.size and file.size > max_size:
        raise HTTPException(
            status_code=400,
            detail="File troppo grande (max 100MB)"
        )
    
    try:
        from training_service import training_service
        
        # Salva file e crea dataset
        dataset_id = await training_service.upload_dataset(
            file=file,
            dataset_name=dataset_name,
            description=description,
            user_id=current_user.id
        )
        
        return {
            "dataset_id": dataset_id,
            "dataset_name": dataset_name,
            "status": "uploaded",
            "message": "Dataset caricato con successo"
        }
        
    except Exception as e:
        logger.error(f"❌ Errore upload dataset: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel caricamento del dataset"
        )


@router.post("/start", response_model=TrainingStatus)
async def start_training(
    training_request: TrainingRequest,
    current_user=Depends(get_current_user),
    _=Depends(require_api_access)
):
    """Avvia training di un modello"""
    try:
        from training_service import training_service
        
        # Verifica che il dataset esista
        dataset_exists = await training_service.dataset_exists(
            training_request.dataset_name,
            current_user.id
        )
        
        if not dataset_exists:
            raise HTTPException(
                status_code=404,
                detail="Dataset non trovato"
            )
        
        # Avvia training
        job_id = await training_service.start_training(
            dataset_name=training_request.dataset_name,
            model_base=training_request.model_base,
            training_params=training_request.training_params,
            description=training_request.description,
            user_id=current_user.id
        )
        
        # Ottieni status iniziale
        status_info = await training_service.get_training_status(job_id)
        return status_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore start training: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nell'avvio del training"
        )


@router.get("/status/{job_id}", response_model=TrainingStatus)
async def get_training_status(
    job_id: str,
    current_user=Depends(get_current_user)
):
    """Ottieni status di un job di training"""
    try:
        from training_service import training_service
        
        status_info = await training_service.get_training_status(job_id)
        
        # Verifica che il job appartenga all'utente
        if not await training_service.user_owns_job(job_id, current_user.id):
            raise HTTPException(
                status_code=403,
                detail="Accesso negato a questo job"
            )
        
        return status_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore get training status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero dello status"
        )


@router.post("/stop/{job_id}", response_model=SuccessResponse)
async def stop_training(
    job_id: str,
    current_user=Depends(get_current_user)
):
    """Ferma un job di training"""
    try:
        from training_service import training_service
        
        # Verifica che il job appartenga all'utente
        if not await training_service.user_owns_job(job_id, current_user.id):
            raise HTTPException(
                status_code=403,
                detail="Accesso negato a questo job"
            )
        
        success = await training_service.stop_training(job_id)
        
        if success:
            return SuccessResponse(
                success=True,
                message=f"Training {job_id} fermato con successo"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Impossibile fermare il training"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore stop training: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel fermare il training"
        )


@router.get("/jobs", response_model=List[TrainingStatus])
async def get_user_training_jobs(
    current_user=Depends(get_current_user),
    limit: int = 20,
    offset: int = 0
):
    """Ottieni lista job di training dell'utente"""
    try:
        from training_service import training_service
        
        jobs = await training_service.get_user_jobs(
            current_user.id,
            limit=limit,
            offset=offset
        )
        
        return jobs
        
    except Exception as e:
        logger.error(f"❌ Errore get training jobs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero dei job"
        )


@router.get("/datasets", response_model=List[dict])
async def get_user_datasets(
    current_user=Depends(get_current_user)
):
    """Ottieni lista dataset dell'utente"""
    try:
        from training_service import training_service
        
        datasets = await training_service.get_user_datasets(current_user.id)
        return datasets
        
    except Exception as e:
        logger.error(f"❌ Errore get datasets: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero dei dataset"
        )


@router.delete("/datasets/{dataset_id}", response_model=SuccessResponse)
async def delete_dataset(
    dataset_id: str,
    current_user=Depends(get_current_user)
):
    """Elimina un dataset"""
    try:
        from training_service import training_service
        
        # Verifica che il dataset appartenga all'utente
        if not await training_service.user_owns_dataset(
            dataset_id, current_user.id
        ):
            raise HTTPException(
                status_code=403,
                detail="Accesso negato a questo dataset"
            )
        
        success = await training_service.delete_dataset(dataset_id)
        
        if success:
            return SuccessResponse(
                success=True,
                message="Dataset eliminato con successo"
            )
        else:
            raise HTTPException(
                status_code=404,
                detail="Dataset non trovato"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore delete dataset: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nell'eliminazione del dataset"
        )


@router.get("/models/trained", response_model=List[dict])
async def get_trained_models(
    current_user=Depends(get_current_user)
):
    """Ottieni lista modelli addestrati dall'utente"""
    try:
        from training_service import training_service
        
        models = await training_service.get_user_trained_models(
            current_user.id
        )
        return models
        
    except Exception as e:
        logger.error(f"❌ Errore get trained models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel recupero dei modelli addestrati"
        )


@router.post("/models/{model_id}/deploy", response_model=SuccessResponse)
async def deploy_trained_model(
    model_id: str,
    current_user=Depends(get_current_user)
):
    """Deploy di un modello addestrato"""
    try:
        from training_service import training_service
        
        # Verifica che il modello appartenga all'utente
        if not await training_service.user_owns_model(
            model_id, current_user.id
        ):
            raise HTTPException(
                status_code=403,
                detail="Accesso negato a questo modello"
            )
        
        success = await training_service.deploy_model(model_id)
        
        if success:
            return SuccessResponse(
                success=True,
                message="Modello deployato con successo"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Impossibile deployare il modello"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Errore deploy model: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errore nel deploy del modello"
        )