#!/usr/bin/env python3
"""
Creative Muse AI - Erweiterte Mehrsprachigkeits-Unterstützung
"""

from typing import Dict, List, Optional
import random

class MultilingualSupport:
    """Klasse für erweiterte Mehrsprachigkeits-Unterstützung"""
    
    def __init__(self):
        self.supported_languages = ["de", "en", "it", "fr", "es"]
        self.default_language = "de"
        
        # Erweiterte Kategorien-Mappings
        self.category_mappings = {
            "de": {
                "business": "Business & Startups",
                "technology": "Technologie", 
                "art": "Kunst & Design",
                "scifi": "Sci-Fi Story",
                "music": "Musikprojekt",
                "wellness": "Wellness & Gesundheit",
                "apps": "App-Namen",
                "solutions": "Alltagslösungen",
                "general": "Allgemein"
            },
            "en": {
                "business": "Business & Startups",
                "technology": "Technology",
                "art": "Art & Design", 
                "scifi": "Sci-Fi Story",
                "music": "Music Project",
                "wellness": "Wellness & Health",
                "apps": "App Names",
                "solutions": "Daily Solutions",
                "general": "General"
            },
            "it": {
                "business": "Business & Startup",
                "technology": "Tecnologia",
                "art": "Arte & Design",
                "scifi": "Storia Sci-Fi", 
                "music": "Progetto Musicale",
                "wellness": "Wellness & Salute",
                "apps": "Nomi App",
                "solutions": "Soluzioni Quotidiane",
                "general": "Generale"
            },
            "fr": {
                "business": "Business & Startups",
                "technology": "Technologie",
                "art": "Art & Design",
                "scifi": "Histoire Sci-Fi",
                "music": "Projet Musical", 
                "wellness": "Bien-être & Santé",
                "apps": "Noms d'Apps",
                "solutions": "Solutions Quotidiennes",
                "general": "Général"
            },
            "es": {
                "business": "Business & Startups",
                "technology": "Tecnología",
                "art": "Arte & Diseño",
                "scifi": "Historia Sci-Fi",
                "music": "Proyecto Musical",
                "wellness": "Bienestar & Salud", 
                "apps": "Nombres de Apps",
                "solutions": "Soluciones Diarias",
                "general": "General"
            }
        }
        
        # Erweiterte Prompt-Templates
        self.prompt_templates = {
            "de": {
                "startup": "Entwickle eine nachhaltige Startup-Idee für {topic}",
                "scifi": "Schreibe eine Science-Fiction-Geschichte über {topic}",
                "tech": "Entwerfe ein innovatives Tech-Produkt für {topic}",
                "music": "Komponiere ein Musikkonzept inspiriert von {topic}",
                "wellness": "Erstelle eine Wellness-App-Idee für {topic}",
                "appname": "Generiere einen kreativen App-Namen für {topic}",
                "problem": "Löse das Alltagsproblem: {topic}"
            },
            "en": {
                "startup": "Develop a sustainable startup idea for {topic}",
                "scifi": "Write a science fiction story about {topic}",
                "tech": "Design an innovative tech product for {topic}",
                "music": "Compose a music concept inspired by {topic}",
                "wellness": "Create a wellness app idea for {topic}",
                "appname": "Generate a creative app name for {topic}",
                "problem": "Solve the everyday problem: {topic}"
            },
            "it": {
                "startup": "Sviluppa un'idea di startup sostenibile per {topic}",
                "scifi": "Scrivi una storia di fantascienza su {topic}",
                "tech": "Progetta un prodotto tecnologico innovativo per {topic}",
                "music": "Componi un concetto musicale ispirato da {topic}",
                "wellness": "Crea un'idea per app wellness per {topic}",
                "appname": "Genera un nome creativo per app per {topic}",
                "problem": "Risolvi il problema quotidiano: {topic}"
            },
            "fr": {
                "startup": "Développez une idée de startup durable pour {topic}",
                "scifi": "Écrivez une histoire de science-fiction sur {topic}",
                "tech": "Concevez un produit technologique innovant pour {topic}",
                "music": "Composez un concept musical inspiré de {topic}",
                "wellness": "Créez une idée d'app bien-être pour {topic}",
                "appname": "Générez un nom d'app créatif pour {topic}",
                "problem": "Résolvez le problème quotidien : {topic}"
            },
            "es": {
                "startup": "Desarrolla una idea de startup sostenible para {topic}",
                "scifi": "Escribe una historia de ciencia ficción sobre {topic}",
                "tech": "Diseña un producto tecnológico innovador para {topic}",
                "music": "Compone un concepto musical inspirado en {topic}",
                "wellness": "Crea una idea de app de bienestar para {topic}",
                "appname": "Genera un nombre creativo de app para {topic}",
                "problem": "Resuelve el problema cotidiano: {topic}"
            }
        }
        
        # Erweiterte Antwort-Templates
        self.response_templates = {
            "de": {
                "success": "Idee erfolgreich generiert",
                "error": "Fehler bei der Ideengenerierung",
                "not_found": "Idee nicht gefunden",
                "invalid_rating": "Ungültige Bewertung (1-5)",
                "database_error": "Datenbankfehler",
                "invalid_language": "Nicht unterstützte Sprache"
            },
            "en": {
                "success": "Idea successfully generated",
                "error": "Error generating idea",
                "not_found": "Idea not found", 
                "invalid_rating": "Invalid rating (1-5)",
                "database_error": "Database error",
                "invalid_language": "Unsupported language"
            },
            "it": {
                "success": "Idea generata con successo",
                "error": "Errore nella generazione dell'idea",
                "not_found": "Idea non trovata",
                "invalid_rating": "Valutazione non valida (1-5)",
                "database_error": "Errore del database",
                "invalid_language": "Lingua non supportata"
            },
            "fr": {
                "success": "Idée générée avec succès",
                "error": "Erreur lors de la génération d'idée",
                "not_found": "Idée non trouvée",
                "invalid_rating": "Note invalide (1-5)",
                "database_error": "Erreur de base de données",
                "invalid_language": "Langue non supportée"
            },
            "es": {
                "success": "Idea generada exitosamente",
                "error": "Error generando idea",
                "not_found": "Idea no encontrada",
                "invalid_rating": "Calificación inválida (1-5)",
                "database_error": "Error de base de datos",
                "invalid_language": "Idioma no soportado"
            }
        }

    def get_supported_languages(self) -> List[str]:
        """Gibt unterstützte Sprachen zurück"""
        return self.supported_languages

    def validate_language(self, language: str) -> str:
        """Validiert und normalisiert Sprache"""
        if language not in self.supported_languages:
            return self.default_language
        return language

    def get_category_name(self, category: str, language: str) -> str:
        """Gibt lokalisierten Kategorienamen zurück"""
        language = self.validate_language(language)
        return self.category_mappings[language].get(category, category)

    def get_prompt_template(self, template_type: str, language: str, topic: str = "") -> str:
        """Gibt lokalisiertes Prompt-Template zurück"""
        language = self.validate_language(language)
        template = self.prompt_templates[language].get(template_type, "{topic}")
        return template.format(topic=topic)

    def get_response_message(self, message_type: str, language: str) -> str:
        """Gibt lokalisierte Antwortnachricht zurück"""
        language = self.validate_language(language)
        return self.response_templates[language].get(message_type, message_type)

    def enhance_idea_content(self, base_content: str, prompt: str, category: str, 
                           creativity_level: int, language: str) -> str:
        """Erweitert Ideeninhalt mit sprachspezifischen Verbesserungen"""
        language = self.validate_language(language)
        
        enhancement_templates = {
            "de": [
                f"Diese innovative Lösung verbindet {category} mit modernsten Ansätzen. "
                f"Inspiriert von '{prompt}', entsteht eine Idee mit Kreativitätslevel {creativity_level}, "
                f"die bestehende Grenzen überschreitet und neue Möglichkeiten eröffnet.",
                
                f"Basierend auf dem Konzept '{prompt}' entwickelt sich eine bahnbrechende "
                f"{category}-Innovation. Mit einem Fokus auf Nachhaltigkeit und Benutzerfreundlichkeit "
                f"entstehen völlig neue Perspektiven für die Zukunft.",
                
                f"Die Inspiration '{prompt}' führt zu einer revolutionären Idee im {category}-Bereich. "
                f"Durch die Kombination von Kreativität und praktischer Umsetzbarkeit entsteht "
                f"eine Lösung, die sowohl innovativ als auch realisierbar ist."
            ],
            "en": [
                f"This innovative solution connects {category} with cutting-edge approaches. "
                f"Inspired by '{prompt}', an idea emerges with creativity level {creativity_level}, "
                f"that transcends existing boundaries and opens new possibilities.",
                
                f"Based on the concept '{prompt}', a groundbreaking {category} innovation develops. "
                f"With a focus on sustainability and user-friendliness, completely new perspectives "
                f"for the future emerge.",
                
                f"The inspiration '{prompt}' leads to a revolutionary idea in the {category} field. "
                f"Through the combination of creativity and practical feasibility, a solution emerges "
                f"that is both innovative and achievable."
            ],
            "it": [
                f"Questa soluzione innovativa collega {category} con approcci all'avanguardia. "
                f"Ispirata da '{prompt}', emerge un'idea con livello di creatività {creativity_level}, "
                f"che trascende i confini esistenti e apre nuove possibilità.",
                
                f"Basandosi sul concetto '{prompt}', si sviluppa un'innovazione rivoluzionaria nel {category}. "
                f"Con un focus su sostenibilità e user-friendliness, emergono prospettive completamente "
                f"nuove per il futuro.",
                
                f"L'ispirazione '{prompt}' porta a un'idea rivoluzionaria nel campo {category}. "
                f"Attraverso la combinazione di creatività e fattibilità pratica, emerge una soluzione "
                f"che è sia innovativa che realizzabile."
            ],
            "fr": [
                f"Cette solution innovante connecte {category} avec des approches de pointe. "
                f"Inspirée par '{prompt}', une idée émerge avec un niveau de créativité {creativity_level}, "
                f"qui transcende les frontières existantes et ouvre de nouvelles possibilités.",
                
                f"Basée sur le concept '{prompt}', une innovation révolutionnaire {category} se développe. "
                f"Avec un focus sur la durabilité et la convivialité, des perspectives complètement "
                f"nouvelles pour l'avenir émergent.",
                
                f"L'inspiration '{prompt}' mène à une idée révolutionnaire dans le domaine {category}. "
                f"Grâce à la combinaison de créativité et de faisabilité pratique, une solution émerge "
                f"qui est à la fois innovante et réalisable."
            ],
            "es": [
                f"Esta solución innovadora conecta {category} con enfoques de vanguardia. "
                f"Inspirada por '{prompt}', emerge una idea con nivel de creatividad {creativity_level}, "
                f"que trasciende las fronteras existentes y abre nuevas posibilidades.",
                
                f"Basándose en el concepto '{prompt}', se desarrolla una innovación revolucionaria en {category}. "
                f"Con un enfoque en sostenibilidad y facilidad de uso, emergen perspectivas completamente "
                f"nuevas para el futuro.",
                
                f"La inspiración '{prompt}' lleva a una idea revolucionaria en el campo {category}. "
                f"A través de la combinación de creatividad y factibilidad práctica, emerge una solución "
                f"que es tanto innovadora como alcanzable."
            ]
        }
        
        enhanced_content = random.choice(enhancement_templates[language])
        return f"{base_content}\n\n{enhanced_content}"

# Globale Instanz
multilingual = MultilingualSupport()