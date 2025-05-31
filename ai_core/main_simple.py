#!/usr/bin/env python3
"""
Creative Muse AI - Vereinfachtes Backend für Demo
"""

import os
import sys
import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import json
import sqlite3
from datetime import datetime
import uuid

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# FastAPI App
app = FastAPI(
    title="Creative Muse AI",
    description="AI-powered Creative Idea Generation Platform",
    version="1.0.0",
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


class IdeaResponse(BaseModel):
    id: str
    title: str
    content: str
    category: str
    rating: Optional[int] = None
    created_at: str


class IdeaRating(BaseModel):
    rating: int


# Globale Variablen
db_path = Path("../database/creative_muse.db")
ideas_storage = []


def init_simple_db():
    """Initialisiere vereinfachte Datenbank"""
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Einfache Ideen-Tabelle
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS simple_ideas (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                rating INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        conn.commit()
        conn.close()
        logger.info("✅ Vereinfachte Datenbank initialisiert")
        return True
    except Exception as e:
        logger.error(f"❌ Fehler bei DB-Initialisierung: {e}")
        return False


def generate_creative_idea(
    prompt: str, category: str = "general", creativity_level: int = 5
) -> dict:
    """Generiere kreative Idee (Mock-Implementation)"""

    # Mock-Ideen basierend auf Kategorien
    mock_ideas = {
        "business": [
            "Eine App, die lokale Künstler mit Kunden verbindet",
            "Nachhaltiger Lieferservice mit Elektrofahrrädern",
            "Virtual Reality Workspace für Remote-Teams",
            "KI-gestützte Personalberatung für Startups",
            "Blockchain-basierte Loyalitätsprogramme",
            "Subscription-Box für nachhaltige Produkte",
            "Peer-to-Peer Lernplattform für Fähigkeiten",
        ],
        "technology": [
            "Augmented Reality für Innenarchitektur",
            "IoT-Sensoren für Smart Gardening",
            "Machine Learning für Musikkomposition",
            "Quantencomputing für Wettervorhersagen",
            "Biometrische Sicherheit für Smart Homes",
            "KI-Assistent für Kreativitätsprozesse",
            "Blockchain für transparente Lieferketten",
        ],
        "art": [
            "Interaktive Lichtinstallationen in Parks",
            "Digitale Graffiti mit Projektoren",
            "Musik aus Umweltgeräuschen komponieren",
            "3D-gedruckte Skulpturen aus Recyclingmaterial",
            "Kollaborative Wandmalereien via App",
            "VR-Kunstgalerien für immersive Erlebnisse",
            "Generative Kunst mit KI-Algorithmen",
        ],
        "scifi": [
            "Zeitreise-Paradoxon in einer Quantenwelt",
            "KI-Bewusstsein erwacht in Smart City",
            "Interstellare Kolonie mit Terraforming-Technologie",
            "Cyborg-Gesellschaft und menschliche Identität",
            "Paralleluniversen durch Dimensionsportale",
            "Genetisch modifizierte Menschen im Weltraum",
            "Digitale Unsterblichkeit und Bewusstseins-Upload",
        ],
        "music": [
            "Ambient-Soundscapes für Meditation",
            "Kollaborative Musikkomposition via App",
            "KI-generierte Melodien aus Emotionen",
            "Interaktive Konzerte mit Publikumsbeteiligung",
            "Musik-Therapie für mentale Gesundheit",
            "Fusion von klassischen und elektronischen Elementen",
            "Soundtracks für Virtual Reality Erlebnisse",
        ],
        "wellness": [
            "Achtsamkeits-App mit personalisierten Übungen",
            "Biofeedback-Geräte für Stressmanagement",
            "Community-basierte Fitness-Challenges",
            "Ernährungs-Tracker mit KI-Empfehlungen",
            "Schlaf-Optimierung durch Smart Home Integration",
            "Mentale Gesundheit durch Kreativitäts-Therapie",
            "Digitale Detox-Programme für Work-Life-Balance",
        ],
        "apps": [
            "MindFlow - Gedanken organisieren",
            "EcoTracker - Nachhaltigkeit messen",
            "SkillSwap - Fähigkeiten tauschen",
            "ZenSpace - Meditation und Ruhe",
            "CreativeBoost - Inspiration finden",
            "LocalConnect - Nachbarschaft vernetzen",
            "TimeWise - Produktivität steigern",
        ],
        "solutions": [
            "Smart Mülltrennung mit KI-Erkennung",
            "Carpooling-App für Pendler",
            "Digitaler Haushaltsplaner für Familien",
            "Automatische Pflanzenbewässerung",
            "Energiespar-Assistent für Zuhause",
            "Lebensmittel-Sharing gegen Verschwendung",
            "Lärmreduzierung in Großstädten",
        ],
        "general": [
            "Community-Garten mit Tauschbörse",
            "Zeitkapsel-Service für Familien",
            "Nachbarschafts-Skill-Sharing-Plattform",
            "Upcycling-Workshops für Kinder",
            "Meditation mit Naturgeräuschen",
            "Intergenerationelle Lernprogramme",
            "Kreative Problemlösung durch Gamification",
        ],
    }

    import random

    # Wähle passende Kategorie
    if category not in mock_ideas:
        category = "general"

    # Generiere Titel basierend auf Prompt und Kategorie
    base_ideas = mock_ideas[category]
    selected_idea = random.choice(base_ideas)

    # Erweitere Idee basierend auf Prompt
    if prompt.lower():
        title = f"{selected_idea} - inspiriert von '{prompt[:50]}...'"
    else:
        title = selected_idea

    # Generiere detaillierten Inhalt
    content_templates = [
        f"Diese innovative Idee kombiniert {category} mit modernen Technologien. "
        f"Der Ansatz '{prompt}' könnte revolutionär sein, da er bestehende Probleme "
        f"auf eine völlig neue Art löst. Durch die Integration von KI und "
        f"benutzerfreundlichem Design entsteht eine Lösung, die sowohl praktisch "
        f"als auch inspirierend ist.",
        f"Basierend auf dem Konzept '{prompt}' entwickelt sich eine Idee, die "
        f"den {category}-Bereich transformieren könnte. Die Kombination aus "
        f"Innovation und Nachhaltigkeit macht diesen Ansatz besonders wertvoll. "
        f"Mit einem Kreativitätslevel von {creativity_level} entstehen völlig "
        f"neue Möglichkeiten für die Zukunft.",
        f"Die Inspiration '{prompt}' führt zu einer bahnbrechenden Idee im "
        f"{category}-Sektor. Durch die Verbindung von traditionellen Methoden "
        f"mit cutting-edge Technologie entsteht etwas völlig Neues. Diese "
        f"Lösung adressiert reale Bedürfnisse und schafft gleichzeitig neue "
        f"Möglichkeiten für Kreativität und Innovation.",
    ]

    content = random.choice(content_templates)

    return {
        "title": title,
        "content": content,
        "category": category,
        "creativity_level": creativity_level,
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Creative Muse AI Backend",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "generate": "/api/v1/generate",
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
    }


@app.post("/api/v1/generate", response_model=IdeaResponse)
async def generate_idea(request: IdeaRequest):
    """Generiere neue kreative Idee"""
    try:
        logger.info(f"Generiere Idee für Prompt: '{request.prompt}'")

        # Generiere Idee
        idea_data = generate_creative_idea(
            request.prompt, request.category, request.creativity_level
        )

        # Erstelle Idee-Objekt
        idea = IdeaResponse(
            id=str(uuid.uuid4()),
            title=idea_data["title"],
            content=idea_data["content"],
            category=idea_data["category"],
            created_at=datetime.now().isoformat(),
        )

        # Speichere in Datenbank
        try:
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO simple_ideas (id, title, content, category, created_at)
                VALUES (?, ?, ?, ?, ?)
            """,
                (idea.id, idea.title, idea.content, idea.category, idea.created_at),
            )
            conn.commit()
            conn.close()
        except Exception as db_error:
            logger.warning(f"DB-Speicherung fehlgeschlagen: {db_error}")
            # Fallback: In-Memory-Speicherung
            ideas_storage.append(idea.dict())

        logger.info(f"✅ Idee generiert: {idea.title[:50]}...")
        return idea

    except Exception as e:
        logger.error(f"❌ Fehler bei Ideengenerierung: {e}")
        raise HTTPException(
            status_code=500, detail=f"Fehler bei der Ideengenerierung: {str(e)}"
        )


@app.get("/api/v1/ideas", response_model=List[IdeaResponse])
async def get_ideas(limit: int = 10, category: Optional[str] = None):
    """Hole gespeicherte Ideen"""
    try:
        ideas = []

        # Versuche aus Datenbank zu laden
        try:
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()

            if category:
                cursor.execute(
                    """
                    SELECT id, title, content, category, rating, created_at 
                    FROM simple_ideas 
                    WHERE category = ? 
                    ORDER BY created_at DESC 
                    LIMIT ?
                """,
                    (category, limit),
                )
            else:
                cursor.execute(
                    """
                    SELECT id, title, content, category, rating, created_at 
                    FROM simple_ideas 
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
                        created_at=row[5],
                    )
                )

        except Exception as db_error:
            logger.warning(f"DB-Abfrage fehlgeschlagen: {db_error}")
            # Fallback: In-Memory-Daten
            ideas = [IdeaResponse(**idea) for idea in ideas_storage[-limit:]]

        logger.info(f"✅ {len(ideas)} Ideen abgerufen")
        return ideas

    except Exception as e:
        logger.error(f"❌ Fehler beim Abrufen der Ideen: {e}")
        raise HTTPException(
            status_code=500, detail=f"Fehler beim Abrufen der Ideen: {str(e)}"
        )


@app.put("/api/v1/ideas/{idea_id}/rating")
async def rate_idea(idea_id: str, rating: IdeaRating):
    """Bewerte eine Idee"""
    try:
        if not 1 <= rating.rating <= 5:
            raise HTTPException(
                status_code=400, detail="Rating muss zwischen 1 und 5 liegen"
            )

        # Update in Datenbank
        try:
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE simple_ideas 
                SET rating = ? 
                WHERE id = ?
            """,
                (rating.rating, idea_id),
            )

            if cursor.rowcount == 0:
                conn.close()
                raise HTTPException(status_code=404, detail="Idee nicht gefunden")

            conn.commit()
            conn.close()

        except sqlite3.Error as db_error:
            logger.warning(f"DB-Update fehlgeschlagen: {db_error}")
            # Fallback: In-Memory-Update
            for idea in ideas_storage:
                if idea.get("id") == idea_id:
                    idea["rating"] = rating.rating
                    break
            else:
                raise HTTPException(status_code=404, detail="Idee nicht gefunden")

        logger.info(f"✅ Idee {idea_id} bewertet: {rating.rating}/5")
        return {"message": "Bewertung gespeichert", "rating": rating.rating}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Fehler bei Bewertung: {e}")
        raise HTTPException(
            status_code=500, detail=f"Fehler bei der Bewertung: {str(e)}"
        )


@app.get("/api/v1/stats")
async def get_stats():
    """Hole Statistiken"""
    try:
        stats = {
            "total_ideas": 0,
            "categories": {},
            "average_rating": 0,
            "recent_ideas": 0,
        }

        try:
            conn = sqlite3.connect(str(db_path))
            cursor = conn.cursor()

            # Gesamtanzahl
            cursor.execute("SELECT COUNT(*) FROM simple_ideas")
            stats["total_ideas"] = cursor.fetchone()[0]

            # Kategorien
            cursor.execute(
                "SELECT category, COUNT(*) FROM simple_ideas GROUP BY category"
            )
            stats["categories"] = dict(cursor.fetchall())

            # Durchschnittsbewertung
            cursor.execute(
                "SELECT AVG(rating) FROM simple_ideas WHERE rating IS NOT NULL"
            )
            avg_rating = cursor.fetchone()[0]
            stats["average_rating"] = round(avg_rating, 2) if avg_rating else 0

            # Aktuelle Ideen (letzte 24h)
            cursor.execute(
                """
                SELECT COUNT(*) FROM simple_ideas 
                WHERE created_at > datetime('now', '-1 day')
            """
            )
            stats["recent_ideas"] = cursor.fetchone()[0]

            conn.close()

        except Exception as db_error:
            logger.warning(f"Stats-Abfrage fehlgeschlagen: {db_error}")
            stats["total_ideas"] = len(ideas_storage)

        return stats

    except Exception as e:
        logger.error(f"❌ Fehler bei Statistiken: {e}")
        raise HTTPException(
            status_code=500, detail=f"Fehler bei den Statistiken: {str(e)}"
        )


if __name__ == "__main__":
    logger.info("🚀 Starte Creative Muse AI Backend (Vereinfacht)...")

    # Initialisiere Datenbank
    if not init_simple_db():
        logger.warning(
            "⚠️ Datenbank-Initialisierung fehlgeschlagen, verwende In-Memory-Speicher"
        )

    # Starte Server
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
