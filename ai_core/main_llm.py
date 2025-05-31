#!/usr/bin/env python3
"""
Creative Muse AI - Advanced Backend with Real LLM Integration
"""

import os
import sys
import logging
import asyncio
from pathlib import Path
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, AsyncGenerator
import uvicorn
import json
import sqlite3
from datetime import datetime
import uuid
import random
import time

# AI/ML Imports
try:
    from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
    import torch
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False
    print("⚠️ Transformers not available, using mock implementation")

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# FastAPI App
app = FastAPI(
    title="Creative Muse AI - Advanced",
    description="AI-powered Creative Idea Generation with Real LLM",
    version="2.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Datenmodelle
class IdeaRequest(BaseModel):
    prompt: str
    category: Optional[str] = "general"
    creativity_level: Optional[int] = 5
    language: Optional[str] = "de"
    use_llm: Optional[bool] = True

class IdeaResponse(BaseModel):
    id: str
    title: str
    content: str
    category: str
    rating: Optional[int] = None
    created_at: str
    generation_method: str  # "llm" or "mock"

class IdeaRating(BaseModel):
    rating: int

class RandomIdeaRequest(BaseModel):
    category: Optional[str] = None
    language: Optional[str] = "de"

# Globale Variablen
db_path = Path("../database/creative_muse.db")
ideas_storage = []

# LLM Configuration
class LLMManager:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.generator = None
        self.model_name = "microsoft/DialoGPT-small"  # Lightweight model for demo
        self.is_loaded = False
        
    async def load_model(self):
        """Load LLM model asynchronously"""
        if not HAS_TRANSFORMERS:
            logger.warning("🤖 Transformers not available, using mock LLM")
            return False
            
        try:
            logger.info(f"🤖 Loading LLM model: {self.model_name}")
            
            # Use a smaller, faster model for demo
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
            
            # Add padding token if not present
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Create text generation pipeline
            self.generator = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                max_length=200,
                num_return_sequences=1,
                temperature=0.8,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
            
            self.is_loaded = True
            logger.info("✅ LLM model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load LLM: {e}")
            return False
    
    async def generate_idea(self, prompt: str, category: str, creativity_level: int, language: str) -> dict:
        """Generate idea using LLM"""
        if not self.is_loaded:
            return await self.generate_mock_idea(prompt, category, creativity_level, language)
        
        try:
            # Create language-specific prompt templates
            prompt_templates = {
                "de": f"Kreative Idee für {category}: {prompt}\nIdee:",
                "en": f"Creative idea for {category}: {prompt}\nIdea:",
                "it": f"Idea creativa per {category}: {prompt}\nIdea:"
            }
            
            formatted_prompt = prompt_templates.get(language, prompt_templates["de"])
            
            # Generate with LLM
            logger.info(f"🤖 Generating with LLM: {formatted_prompt[:50]}...")
            
            result = self.generator(
                formatted_prompt,
                max_length=min(150, len(formatted_prompt.split()) + 50),
                temperature=creativity_level / 10.0,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
            
            generated_text = result[0]['generated_text']
            
            # Extract the generated part (remove the prompt)
            idea_text = generated_text[len(formatted_prompt):].strip()
            
            # Clean up the generated text
            idea_text = idea_text.split('\n')[0]  # Take first line
            idea_text = idea_text[:200]  # Limit length
            
            if not idea_text:
                return await self.generate_mock_idea(prompt, category, creativity_level, language)
            
            return {
                "title": f"LLM-Generated: {idea_text[:50]}...",
                "content": idea_text,
                "category": category,
                "creativity_level": creativity_level,
                "generation_method": "llm"
            }
            
        except Exception as e:
            logger.error(f"❌ LLM generation failed: {e}")
            return await self.generate_mock_idea(prompt, category, creativity_level, language)
    
    async def generate_mock_idea(self, prompt: str, category: str, creativity_level: int, language: str) -> dict:
        """Fallback to mock generation"""
        # Use the existing mock implementation from main_simple.py
        from main_simple import generate_creative_idea
        result = generate_creative_idea(prompt, category, creativity_level, language)
        result["generation_method"] = "mock"
        return result

# Initialize LLM Manager
llm_manager = LLMManager()

def init_simple_db():
    """Initialisiere vereinfachte Datenbank"""
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Erweiterte Ideen-Tabelle
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS advanced_ideas (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                rating INTEGER,
                generation_method TEXT DEFAULT 'mock',
                language TEXT DEFAULT 'de',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        conn.commit()
        conn.close()
        logger.info("✅ Advanced database initialized")
        return True
    except Exception as e:
        logger.error(f"❌ Database initialization error: {e}")
        return False

async def generate_random_idea(category: Optional[str] = None, language: str = "de") -> dict:
    """Generate a random idea without user prompt"""
    
    # Random prompts for inspiration
    random_prompts = {
        "de": [
            "Eine revolutionäre Lösung für den Alltag",
            "Nachhaltigkeit trifft auf Innovation",
            "Die Zukunft der menschlichen Kreativität",
            "Ein Produkt, das Leben verändert",
            "Technologie für eine bessere Welt",
            "Eine Idee, die Grenzen überschreitet",
            "Innovation durch Einfachheit"
        ],
        "en": [
            "A revolutionary solution for everyday life",
            "Sustainability meets innovation",
            "The future of human creativity",
            "A product that changes lives",
            "Technology for a better world",
            "An idea that breaks boundaries",
            "Innovation through simplicity"
        ],
        "it": [
            "Una soluzione rivoluzionaria per la vita quotidiana",
            "Sostenibilità incontra innovazione",
            "Il futuro della creatività umana",
            "Un prodotto che cambia la vita",
            "Tecnologia per un mondo migliore",
            "Un'idea che rompe i confini",
            "Innovazione attraverso la semplicità"
        ]
    }
    
    categories = ["general", "business", "technology", "art", "scifi", "music", "wellness", "apps", "solutions"]
    
    if not category:
        category = random.choice(categories)
    
    random_prompt = random.choice(random_prompts.get(language, random_prompts["de"]))
    
    return await llm_manager.generate_idea(random_prompt, category, random.randint(6, 9), language)

@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("🚀 Starting Creative Muse AI Advanced Backend...")
    
    # Initialize database
    if not init_simple_db():
        logger.warning("⚠️ Database initialization failed, using in-memory storage")
    
    # Load LLM model in background
    asyncio.create_task(llm_manager.load_model())

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Creative Muse AI Advanced Backend",
        "version": "2.0.0",
        "status": "running",
        "llm_status": "loaded" if llm_manager.is_loaded else "loading",
        "endpoints": {
            "generate": "/api/v1/generate",
            "generate_stream": "/api/v1/generate/stream",
            "random": "/api/v1/random",
            "ideas": "/api/v1/ideas",
            "health": "/health",
        },
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": "connected" if db_path.exists() else "not_found",
        "llm_status": "loaded" if llm_manager.is_loaded else "loading",
    }

@app.post("/api/v1/generate", response_model=IdeaResponse)
async def generate_idea(request: IdeaRequest):
    """Generate new creative idea"""
    try:
        logger.info(f"🎨 Generating idea for prompt: '{request.prompt}'")

        # Generate idea using LLM or mock
        if request.use_llm and llm_manager.is_loaded:
            idea_data = await llm_manager.generate_idea(
                request.prompt, request.category, request.creativity_level, request.language
            )
        else:
            idea_data = await llm_manager.generate_mock_idea(
                request.prompt, request.category, request.creativity_level, request.language
            )

        # Create idea object
        idea = IdeaResponse(
            id=str(uuid.uuid4()),
            title=idea_data["title"],
            content=idea_data["content"],
            category=idea_data["category"],
            generation_method=idea_data["generation_method"],
            created_at=datetime.now().isoformat(),
        )

        # Save to database
        try:
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO advanced_ideas (id, title, content, category, generation_method, language, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
                (idea.id, idea.title, idea.content, idea.category, idea.generation_method, request.language, idea.created_at),
            )
            conn.commit()
            conn.close()
        except Exception as db_error:
            logger.warning(f"DB save failed: {db_error}")
            ideas_storage.append(idea.dict())

        logger.info(f"✅ Idea generated ({idea.generation_method}): {idea.title[:50]}...")
        return idea

    except Exception as e:
        logger.error(f"❌ Error generating idea: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error generating idea: {str(e)}"
        )

@app.post("/api/v1/generate/stream")
async def generate_idea_stream(request: IdeaRequest):
    """Generate idea with streaming response (typing animation)"""
    
    async def generate_stream():
        try:
            # Generate the idea first
            if request.use_llm and llm_manager.is_loaded:
                idea_data = await llm_manager.generate_idea(
                    request.prompt, request.category, request.creativity_level, request.language
                )
            else:
                idea_data = await llm_manager.generate_mock_idea(
                    request.prompt, request.category, request.creativity_level, request.language
                )
            
            # Create idea object
            idea = IdeaResponse(
                id=str(uuid.uuid4()),
                title=idea_data["title"],
                content=idea_data["content"],
                category=idea_data["category"],
                generation_method=idea_data["generation_method"],
                created_at=datetime.now().isoformat(),
            )
            
            # Stream the title character by character
            yield f"data: {json.dumps({'type': 'title_start'})}\n\n"
            for char in idea.title:
                yield f"data: {json.dumps({'type': 'title_char', 'char': char})}\n\n"
                await asyncio.sleep(0.05)  # Typing speed
            
            yield f"data: {json.dumps({'type': 'title_complete'})}\n\n"
            await asyncio.sleep(0.3)
            
            # Stream the content character by character
            yield f"data: {json.dumps({'type': 'content_start'})}\n\n"
            for char in idea.content:
                yield f"data: {json.dumps({'type': 'content_char', 'char': char})}\n\n"
                await asyncio.sleep(0.02)  # Faster for content
            
            # Send complete idea data
            yield f"data: {json.dumps({'type': 'complete', 'idea': idea.dict()})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.post("/api/v1/random", response_model=IdeaResponse)
async def generate_random_idea_endpoint(request: RandomIdeaRequest):
    """Generate a random creative idea"""
    try:
        logger.info(f"🎲 Generating random idea for category: {request.category}")

        # Generate random idea
        idea_data = await generate_random_idea(request.category, request.language)

        # Create idea object
        idea = IdeaResponse(
            id=str(uuid.uuid4()),
            title=idea_data["title"],
            content=idea_data["content"],
            category=idea_data["category"],
            generation_method=idea_data["generation_method"],
            created_at=datetime.now().isoformat(),
        )

        # Save to database
        try:
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO advanced_ideas (id, title, content, category, generation_method, language, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
                (idea.id, idea.title, idea.content, idea.category, idea.generation_method, request.language, idea.created_at),
            )
            conn.commit()
            conn.close()
        except Exception as db_error:
            logger.warning(f"DB save failed: {db_error}")
            ideas_storage.append(idea.dict())

        logger.info(f"✅ Random idea generated: {idea.title[:50]}...")
        return idea

    except Exception as e:
        logger.error(f"❌ Error generating random idea: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error generating random idea: {str(e)}"
        )

@app.get("/api/v1/ideas", response_model=List[IdeaResponse])
async def get_ideas(limit: int = 10, category: Optional[str] = None):
    """Get saved ideas"""
    try:
        ideas = []

        # Try to load from database
        try:
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()

            if category:
                cursor.execute(
                    """
                    SELECT id, title, content, category, rating, generation_method, created_at 
                    FROM advanced_ideas 
                    WHERE category = ? 
                    ORDER BY created_at DESC 
                    LIMIT ?
                """,
                    (category, limit),
                )
            else:
                cursor.execute(
                    """
                    SELECT id, title, content, category, rating, generation_method, created_at 
                    FROM advanced_ideas 
                    ORDER BY created_at DESC 
                    LIMIT ?
                """,
                    (limit,),
                )

            rows = cursor.fetchall()
            conn.close()

            for row in rows:
                ideas.append(
                    IdeaResponse(
                        id=row[0],
                        title=row[1],
                        content=row[2],
                        category=row[3],
                        rating=row[4],
                        generation_method=row[5] or "mock",
                        created_at=row[6],
                    )
                )

        except Exception as db_error:
            logger.warning(f"DB query failed: {db_error}")
            ideas = [IdeaResponse(**idea) for idea in ideas_storage[-limit:]]

        logger.info(f"✅ Retrieved {len(ideas)} ideas")
        return ideas

    except Exception as e:
        logger.error(f"❌ Error retrieving ideas: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error retrieving ideas: {str(e)}"
        )

@app.put("/api/v1/ideas/{idea_id}/rating")
async def rate_idea(idea_id: str, rating: IdeaRating):
    """Rate an idea"""
    try:
        if not 1 <= rating.rating <= 5:
            raise HTTPException(
                status_code=400, detail="Rating must be between 1 and 5"
            )

        # Update in database
        try:
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE advanced_ideas 
                SET rating = ? 
                WHERE id = ?
            """,
                (rating.rating, idea_id),
            )

            if cursor.rowcount == 0:
                conn.close()
                raise HTTPException(status_code=404, detail="Idea not found")

            conn.commit()
            conn.close()

        except sqlite3.Error as db_error:
            logger.warning(f"DB update failed: {db_error}")
            # Fallback: In-memory update
            for idea in ideas_storage:
                if idea.get("id") == idea_id:
                    idea["rating"] = rating.rating
                    break
            else:
                raise HTTPException(status_code=404, detail="Idea not found")

        logger.info(f"✅ Idea {idea_id} rated: {rating.rating}/5")
        return {"message": "Rating saved", "rating": rating.rating}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error rating idea: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error rating idea: {str(e)}"
        )

@app.get("/api/v1/stats")
async def get_stats():
    """Get statistics"""
    try:
        stats = {
            "total_ideas": 0,
            "categories": {},
            "average_rating": 0,
            "recent_ideas": 0,
            "llm_ideas": 0,
            "mock_ideas": 0,
        }

        try:
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()

            # Total count
            cursor.execute("SELECT COUNT(*) FROM advanced_ideas")
            stats["total_ideas"] = cursor.fetchone()[0]

            # Categories
            cursor.execute(
                "SELECT category, COUNT(*) FROM advanced_ideas GROUP BY category"
            )
            stats["categories"] = dict(cursor.fetchall())

            # Average rating
            cursor.execute(
                "SELECT AVG(rating) FROM advanced_ideas WHERE rating IS NOT NULL"
            )
            avg_rating = cursor.fetchone()[0]
            stats["average_rating"] = round(avg_rating, 2) if avg_rating else 0

            # Recent ideas (last 24h)
            cursor.execute(
                """
                SELECT COUNT(*) FROM advanced_ideas 
                WHERE created_at > datetime('now', '-1 day')
            """
            )
            stats["recent_ideas"] = cursor.fetchone()[0]

            # Generation method stats
            cursor.execute(
                "SELECT generation_method, COUNT(*) FROM advanced_ideas GROUP BY generation_method"
            )
            method_stats = dict(cursor.fetchall())
            stats["llm_ideas"] = method_stats.get("llm", 0)
            stats["mock_ideas"] = method_stats.get("mock", 0)

            conn.close()

        except Exception as db_error:
            logger.warning(f"Stats query failed: {db_error}")
            stats["total_ideas"] = len(ideas_storage)

        return stats

    except Exception as e:
        logger.error(f"❌ Error getting stats: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error getting stats: {str(e)}"
        )

if __name__ == "__main__":
    logger.info("🚀 Starting Creative Muse AI Advanced Backend...")

    # Start server
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="info")