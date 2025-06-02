#!/usr/bin/env python3
"""
Creative Muse AI - Training Service
Servizio per gestire l'upload e il training di modelli personalizzati
"""

import os
import uuid
import json
import csv
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
import sqlite3
from fastapi import UploadFile, HTTPException
import pandas as pd

logger = logging.getLogger(__name__)


class TrainingService:
    """Servizio per gestire il training di modelli personalizzati"""
    
    def __init__(self, db_path: str = "database/creative_muse.db"):
        self.db_path = db_path
        self.upload_dir = Path("uploads/training_data")
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self._init_database()
    
    def _init_database(self):
        """Inizializza le tabelle per il training"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Tabella per i dataset di training
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS training_datasets (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        uuid TEXT UNIQUE NOT NULL,
                        user_id INTEGER NOT NULL,
                        filename TEXT NOT NULL,
                        original_filename TEXT NOT NULL,
                        file_path TEXT NOT NULL,
                        file_size INTEGER NOT NULL,
                        file_type TEXT NOT NULL,
                        rows_count INTEGER,
                        columns_info TEXT,
                        status TEXT DEFAULT 'uploaded',
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                        processed_at TEXT,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                """)
                
                # Tabella per i modelli personalizzati
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS custom_models (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        uuid TEXT UNIQUE NOT NULL,
                        user_id INTEGER NOT NULL,
                        dataset_id INTEGER NOT NULL,
                        model_name TEXT NOT NULL,
                        model_type TEXT DEFAULT 'fine_tuned',
                        training_status TEXT DEFAULT 'pending',
                        training_progress INTEGER DEFAULT 0,
                        model_path TEXT,
                        training_config TEXT,
                        performance_metrics TEXT,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                        training_started_at TEXT,
                        training_completed_at TEXT,
                        FOREIGN KEY (user_id) REFERENCES users (id),
                        FOREIGN KEY (dataset_id) REFERENCES training_datasets (id)
                    )
                """)
                
                # Indici per performance
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_training_datasets_user_id 
                    ON training_datasets (user_id)
                """)
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_custom_models_user_id 
                    ON custom_models (user_id)
                """)
                
                conn.commit()
                logger.info("✅ Database training inizializzato")
                
        except Exception as e:
            logger.error(f"❌ Errore inizializzazione database training: {e}")
            raise
    
    async def upload_dataset(
        self, 
        file: UploadFile, 
        user_id: int,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload e validazione di un dataset di training"""
        try:
            # Validazione del file
            if not file.filename:
                raise HTTPException(status_code=400, detail="Nome file richiesto")
            
            # Controllo estensione file
            allowed_extensions = {'.csv', '.jsonl', '.json', '.txt'}
            file_ext = Path(file.filename).suffix.lower()
            if file_ext not in allowed_extensions:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Formato file non supportato. Supportati: {', '.join(allowed_extensions)}"
                )
            
            # Controllo dimensione file (max 100MB)
            max_size = 100 * 1024 * 1024  # 100MB
            content = await file.read()
            if len(content) > max_size:
                raise HTTPException(
                    status_code=400, 
                    detail="File troppo grande. Dimensione massima: 100MB"
                )
            
            # Genera UUID e percorso sicuro
            dataset_uuid = str(uuid.uuid4())
            safe_filename = f"{dataset_uuid}_{file.filename}"
            file_path = self.upload_dir / safe_filename
            
            # Salva il file
            with open(file_path, 'wb') as f:
                f.write(content)
            
            # Analizza il contenuto del file
            analysis = await self._analyze_dataset(file_path, file_ext)
            
            # Salva nel database
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO training_datasets 
                    (uuid, user_id, filename, original_filename, file_path, 
                     file_size, file_type, rows_count, columns_info, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    dataset_uuid, user_id, safe_filename, file.filename,
                    str(file_path), len(content), file_ext,
                    analysis['rows_count'], json.dumps(analysis['columns_info']),
                    'uploaded'
                ))
                conn.commit()
            
            logger.info(f"✅ Dataset caricato: {file.filename} per utente {user_id}")
            
            return {
                "dataset_id": dataset_uuid,
                "filename": file.filename,
                "file_size": len(content),
                "file_type": file_ext,
                "rows_count": analysis['rows_count'],
                "columns": analysis['columns_info'],
                "status": "uploaded",
                "message": "Dataset caricato con successo"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Errore upload dataset: {e}")
            # Cleanup in caso di errore
            if 'file_path' in locals() and file_path.exists():
                file_path.unlink()
            raise HTTPException(status_code=500, detail="Errore interno del server")
    
    async def _analyze_dataset(self, file_path: Path, file_ext: str) -> Dict[str, Any]:
        """Analizza il contenuto del dataset"""
        try:
            if file_ext == '.csv':
                df = pd.read_csv(file_path)
                return {
                    'rows_count': len(df),
                    'columns_info': {
                        'columns': list(df.columns),
                        'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()},
                        'sample_data': df.head(3).to_dict('records')
                    }
                }
            
            elif file_ext in ['.jsonl', '.json']:
                with open(file_path, 'r', encoding='utf-8') as f:
                    if file_ext == '.jsonl':
                        lines = f.readlines()
                        data = [json.loads(line.strip()) for line in lines if line.strip()]
                    else:
                        data = json.load(f)
                        if not isinstance(data, list):
                            data = [data]
                
                if data:
                    sample_keys = set()
                    for item in data[:10]:  # Analizza i primi 10 elementi
                        if isinstance(item, dict):
                            sample_keys.update(item.keys())
                    
                    return {
                        'rows_count': len(data),
                        'columns_info': {
                            'keys': list(sample_keys),
                            'sample_data': data[:3]
                        }
                    }
                else:
                    return {'rows_count': 0, 'columns_info': {}}
            
            elif file_ext == '.txt':
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                return {
                    'rows_count': len(lines),
                    'columns_info': {
                        'type': 'text',
                        'sample_lines': lines[:3]
                    }
                }
            
            else:
                return {'rows_count': 0, 'columns_info': {}}
                
        except Exception as e:
            logger.error(f"❌ Errore analisi dataset: {e}")
            return {'rows_count': 0, 'columns_info': {'error': str(e)}}
    
    def get_user_datasets(self, user_id: int) -> List[Dict[str, Any]]:
        """Ottieni tutti i dataset di un utente"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT uuid, original_filename, file_size, file_type, 
                           rows_count, status, created_at
                    FROM training_datasets 
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                """, (user_id,))
                
                datasets = []
                for row in cursor.fetchall():
                    datasets.append({
                        'dataset_id': row[0],
                        'filename': row[1],
                        'file_size': row[2],
                        'file_type': row[3],
                        'rows_count': row[4],
                        'status': row[5],
                        'created_at': row[6]
                    })
                
                return datasets
                
        except Exception as e:
            logger.error(f"❌ Errore recupero dataset utente: {e}")
            return []
    
    def delete_dataset(self, dataset_id: str, user_id: int) -> bool:
        """Elimina un dataset"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Verifica proprietà
                cursor.execute("""
                    SELECT file_path FROM training_datasets 
                    WHERE uuid = ? AND user_id = ?
                """, (dataset_id, user_id))
                
                result = cursor.fetchone()
                if not result:
                    return False
                
                file_path = Path(result[0])
                
                # Elimina dal database
                cursor.execute("""
                    DELETE FROM training_datasets 
                    WHERE uuid = ? AND user_id = ?
                """, (dataset_id, user_id))
                
                # Elimina il file
                if file_path.exists():
                    file_path.unlink()
                
                conn.commit()
                logger.info(f"✅ Dataset eliminato: {dataset_id}")
                return True
                
        except Exception as e:
            logger.error(f"❌ Errore eliminazione dataset: {e}")
            return False


# Istanza globale del servizio
training_service = TrainingService()