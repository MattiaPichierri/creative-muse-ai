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
    language: Optional[str] = "de"  # de, en, it


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
    prompt: str, category: str = "general", creativity_level: int = 5, language: str = "de"
) -> dict:
    """Generiere kreative Idee (Mock-Implementation)"""

    # Mock-Ideen basierend auf Kategorien und Sprachen
    mock_ideas = {
        "de": {
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
        },
        "en": {
            "business": [
                "An app that connects local artists with customers",
                "Sustainable delivery service with electric bikes",
                "Virtual Reality workspace for remote teams",
                "AI-powered recruitment consulting for startups",
                "Blockchain-based loyalty programs",
                "Subscription box for sustainable products",
                "Peer-to-peer learning platform for skills",
            ],
            "technology": [
                "Augmented Reality for interior design",
                "IoT sensors for smart gardening",
                "Machine Learning for music composition",
                "Quantum computing for weather forecasting",
                "Biometric security for smart homes",
                "AI assistant for creativity processes",
                "Blockchain for transparent supply chains",
            ],
            "art": [
                "Interactive light installations in parks",
                "Digital graffiti with projectors",
                "Composing music from environmental sounds",
                "3D-printed sculptures from recycled materials",
                "Collaborative murals via app",
                "VR art galleries for immersive experiences",
                "Generative art with AI algorithms",
            ],
            "scifi": [
                "Time travel paradox in a quantum world",
                "AI consciousness awakens in smart city",
                "Interstellar colony with terraforming technology",
                "Cyborg society and human identity",
                "Parallel universes through dimension portals",
                "Genetically modified humans in space",
                "Digital immortality and consciousness upload",
            ],
            "music": [
                "Ambient soundscapes for meditation",
                "Collaborative music composition via app",
                "AI-generated melodies from emotions",
                "Interactive concerts with audience participation",
                "Music therapy for mental health",
                "Fusion of classical and electronic elements",
                "Soundtracks for Virtual Reality experiences",
            ],
            "wellness": [
                "Mindfulness app with personalized exercises",
                "Biofeedback devices for stress management",
                "Community-based fitness challenges",
                "Nutrition tracker with AI recommendations",
                "Sleep optimization through smart home integration",
                "Mental health through creativity therapy",
                "Digital detox programs for work-life balance",
            ],
            "apps": [
                "MindFlow - Organize thoughts",
                "EcoTracker - Measure sustainability",
                "SkillSwap - Exchange abilities",
                "ZenSpace - Meditation and peace",
                "CreativeBoost - Find inspiration",
                "LocalConnect - Connect neighborhoods",
                "TimeWise - Increase productivity",
            ],
            "solutions": [
                "Smart waste sorting with AI recognition",
                "Carpooling app for commuters",
                "Digital household planner for families",
                "Automatic plant watering system",
                "Energy-saving assistant for home",
                "Food sharing against waste",
                "Noise reduction in big cities",
            ],
            "general": [
                "Community garden with exchange platform",
                "Time capsule service for families",
                "Neighborhood skill-sharing platform",
                "Upcycling workshops for children",
                "Meditation with nature sounds",
                "Intergenerational learning programs",
                "Creative problem solving through gamification",
            ],
        },
        "it": {
            "business": [
                "Un'app che collega artisti locali con clienti",
                "Servizio di consegna sostenibile con bici elettriche",
                "Spazio di lavoro in Realtà Virtuale per team remoti",
                "Consulenza di reclutamento basata su IA per startup",
                "Programmi fedeltà basati su blockchain",
                "Subscription box per prodotti sostenibili",
                "Piattaforma peer-to-peer per scambio competenze",
            ],
            "technology": [
                "Realtà Aumentata per design d'interni",
                "Sensori IoT per giardinaggio intelligente",
                "Machine Learning per composizione musicale",
                "Quantum computing per previsioni meteo",
                "Sicurezza biometrica per case intelligenti",
                "Assistente IA per processi creativi",
                "Blockchain per catene di fornitura trasparenti",
            ],
            "art": [
                "Installazioni luminose interattive nei parchi",
                "Graffiti digitali con proiettori",
                "Comporre musica da suoni ambientali",
                "Sculture stampate in 3D da materiali riciclati",
                "Murales collaborativi tramite app",
                "Gallerie d'arte VR per esperienze immersive",
                "Arte generativa con algoritmi IA",
            ],
            "scifi": [
                "Paradosso del viaggio nel tempo in mondo quantico",
                "Coscienza IA si risveglia in città intelligente",
                "Colonia interstellare con tecnologia terraforming",
                "Società cyborg e identità umana",
                "Universi paralleli attraverso portali dimensionali",
                "Umani geneticamente modificati nello spazio",
                "Immortalità digitale e upload della coscienza",
            ],
            "music": [
                "Paesaggi sonori ambient per meditazione",
                "Composizione musicale collaborativa tramite app",
                "Melodie generate da IA dalle emozioni",
                "Concerti interattivi con partecipazione del pubblico",
                "Musicoterapia per salute mentale",
                "Fusione di elementi classici ed elettronici",
                "Colonne sonore per esperienze di Realtà Virtuale",
            ],
            "wellness": [
                "App mindfulness con esercizi personalizzati",
                "Dispositivi biofeedback per gestione stress",
                "Sfide fitness basate sulla comunità",
                "Tracker nutrizionale con raccomandazioni IA",
                "Ottimizzazione del sonno tramite integrazione casa intelligente",
                "Salute mentale attraverso terapia della creatività",
                "Programmi detox digitale per equilibrio vita-lavoro",
            ],
            "apps": [
                "MindFlow - Organizza pensieri",
                "EcoTracker - Misura sostenibilità",
                "SkillSwap - Scambia abilità",
                "ZenSpace - Meditazione e pace",
                "CreativeBoost - Trova ispirazione",
                "LocalConnect - Connetti quartieri",
                "TimeWise - Aumenta produttività",
            ],
            "solutions": [
                "Smistamento rifiuti intelligente con riconoscimento IA",
                "App carpooling per pendolari",
                "Pianificatore domestico digitale per famiglie",
                "Sistema automatico irrigazione piante",
                "Assistente risparmio energetico per casa",
                "Condivisione cibo contro spreco",
                "Riduzione rumore nelle grandi città",
            ],
            "general": [
                "Giardino comunitario con piattaforma scambio",
                "Servizio capsula del tempo per famiglie",
                "Piattaforma condivisione competenze di quartiere",
                "Workshop upcycling per bambini",
                "Meditazione con suoni della natura",
                "Programmi apprendimento intergenerazionale",
                "Risoluzione problemi creativa attraverso gamification",
            ],
        },
    }

    import random

    # Wähle passende Sprache und Kategorie
    if language not in mock_ideas:
        language = "de"
    
    if category not in mock_ideas[language]:
        category = "general"

    # Generiere Titel basierend auf Prompt und Kategorie
    base_ideas = mock_ideas[language][category]
    selected_idea = random.choice(base_ideas)

    # Erweitere Idee basierend auf Prompt
    if prompt.lower():
        if language == "de":
            title = f"{selected_idea} - inspiriert von '{prompt[:50]}...'"
        elif language == "en":
            title = f"{selected_idea} - inspired by '{prompt[:50]}...'"
        else:  # it
            title = f"{selected_idea} - ispirato da '{prompt[:50]}...'"
    else:
        title = selected_idea

    # Generiere detaillierten Inhalt basierend auf Sprache
    content_templates = {
        "de": [
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
        ],
        "en": [
            f"This innovative idea combines {category} with modern technologies. "
            f"The approach '{prompt}' could be revolutionary as it solves existing problems "
            f"in a completely new way. Through the integration of AI and "
            f"user-friendly design, a solution emerges that is both practical "
            f"and inspiring.",
            f"Based on the concept '{prompt}', an idea develops that "
            f"could transform the {category} field. The combination of "
            f"innovation and sustainability makes this approach particularly valuable. "
            f"With a creativity level of {creativity_level}, completely "
            f"new possibilities for the future emerge.",
            f"The inspiration '{prompt}' leads to a groundbreaking idea in the "
            f"{category} sector. By connecting traditional methods "
            f"with cutting-edge technology, something completely new emerges. This "
            f"solution addresses real needs while creating new "
            f"opportunities for creativity and innovation.",
        ],
        "it": [
            f"Questa idea innovativa combina {category} con tecnologie moderne. "
            f"L'approccio '{prompt}' potrebbe essere rivoluzionario poiché risolve problemi esistenti "
            f"in un modo completamente nuovo. Attraverso l'integrazione di IA e "
            f"design user-friendly, emerge una soluzione che è sia pratica "
            f"che ispiratrice.",
            f"Basandosi sul concetto '{prompt}', si sviluppa un'idea che "
            f"potrebbe trasformare il campo {category}. La combinazione di "
            f"innovazione e sostenibilità rende questo approccio particolarmente prezioso. "
            f"Con un livello di creatività di {creativity_level}, emergono "
            f"nuove possibilità completamente per il futuro.",
            f"L'ispirazione '{prompt}' porta a un'idea rivoluzionaria nel "
            f"settore {category}. Collegando metodi tradizionali "
            f"con tecnologia all'avanguardia, emerge qualcosa di completamente nuovo. Questa "
            f"soluzione affronta bisogni reali creando al contempo nuove "
            f"opportunità per creatività e innovazione.",
        ]
    }

    content = random.choice(content_templates[language])

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
            request.prompt, request.category, request.creativity_level, request.language
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
