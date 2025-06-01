'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'it' | 'en' | 'de' | 'fr' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Traduzioni
const translations = {
  it: {
    // Header
    'header.title': 'Creative Muse',
    'header.aiPowered': 'AI-Powered',
    'header.ideas': 'Le tue idee',
    'header.stats': 'Statistiche',
    'header.back': 'Indietro',

    // Theme
    'theme.light': 'Attiva modalità chiara',
    'theme.dark': 'Attiva modalità scura',

    // Home page
    'home.title': 'Libera la tua creatività',
    'home.subtitle':
      "Genera idee innovative con l'intelligenza artificiale. Trasforma i tuoi pensieri in progetti straordinari.",
    'home.randomIdea': 'Idea Casuale',
    'home.randomDescription':
      "Lascia che l'AI generi un'idea completamente nuova per te",
    'home.customIdea': 'Idea Personalizzata',
    'home.customDescription':
      "Descrivi quello che hai in mente e lascia che l'AI lo sviluppi",
    'home.generateIdea': 'Genera Idea',
    'home.developIdea': 'Sviluppa Idea',
    'home.generating': 'Generando...',
    'home.yourIdeas': 'Le tue idee',
    'home.viewAll': 'Visualizza tutte →',
    'home.noIdeas': 'Inizia a generare idee',
    'home.noIdeasDescription':
      'Clicca su uno dei pulsanti sopra per iniziare il tuo viaggio creativo',
    'home.generateFirst': 'Genera la prima idea',
    'home.placeholder': 'Descrivi la tua idea o il tema che ti interessa...',

    // Predefined prompts
    'prompts.title': 'Prompt Predefiniti',
    'prompts.startup': 'Startup Sostenibile',
    'prompts.scifi': 'Storia Sci-Fi',
    'prompts.tech': 'Prodotto Tech',
    'prompts.music': 'Concetto Musicale',
    'prompts.wellness': 'App Wellness',
    'prompts.appName': 'Nome App',
    'prompts.everyday': 'Problema Quotidiano',

    // Export
    'export.json': 'Esporta JSON',
    'export.markdown': 'Esporta Markdown',
    'export.noIdeas': 'Nessuna idea da esportare',
    'export.title': 'Esporta idee',

    // Ideas page
    'ideas.title': 'Le tue idee',
    'ideas.search': 'Cerca nelle tue idee...',
    'ideas.allCategories': 'Tutte le categorie',
    'ideas.loading': 'Caricamento idee...',
    'ideas.noResults': 'Nessuna idea trovata',
    'ideas.noResultsDescription': 'Prova a modificare i filtri di ricerca',
    'ideas.empty': 'Nessuna idea ancora',
    'ideas.emptyDescription': 'Inizia a generare le tue prime idee creative',
    'ideas.count': 'idee',

    // Stats page
    'stats.title': 'Statistiche',
    'stats.updatedNow': 'Aggiornato ora',
    'stats.totalIdeas': 'Idee Totali',
    'stats.totalDescription': 'Idee generate finora',
    'stats.averageRating': 'Valutazione Media',
    'stats.ratingDescription': 'Su 5 stelle',
    'stats.recentActivity': 'Attività Recente',
    'stats.recentDescription': 'Idee questa settimana',
    'stats.categories': 'Categorie',
    'stats.categoriesDescription': 'Categorie diverse',
    'stats.distribution': 'Distribuzione per Categoria',
    'stats.quickActions': 'Azioni Rapide',
    'stats.generateNew': 'Genera Nuova Idea',
    'stats.viewAll': 'Visualizza Tutte le Idee',
    'stats.refresh': 'Aggiorna Statistiche',
    'stats.loading': 'Caricamento statistiche...',
    'stats.noStats': 'Nessuna statistica disponibile',
    'stats.noStatsDescription': 'Genera alcune idee per vedere le statistiche',
    'stats.startNow': 'Inizia ora',
    'stats.noCategories': 'Nessuna categoria disponibile',

    // Common
    'common.category': 'Categoria',
    'common.date': 'Data',
    'common.rating': 'Valutazione',
    'common.method': 'Metodo',
    'common.general': 'generale',
    'common.error': 'Errore',
    'common.retry': 'Riprova',
    'common.close': 'Chiudi',
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
    'language.select': 'Seleziona lingua',

    // Rating
    'rating.label': 'Valutazione',
    'rating.rate': 'Valuta questa idea',

    // Search and Filter
    'search.placeholder': 'Cerca idee...',
    'filter.allCategories': 'Tutte le categorie',
    'filter.allRatings': 'Tutte le valutazioni',
    'filter.category': 'Categoria',
    'filter.rating': 'Valutazione',
    'filter.sortBy': 'Ordina per',
    'filter.search': 'Ricerca',
    'filter.clear': 'Cancella filtri',
    'sort.newest': 'Più recenti',
    'sort.oldest': 'Più vecchi',
    'sort.rating': 'Valutazione',
    'sort.alphabetical': 'Alfabetico',

    // Home page additions
    'home.customPlaceholder':
      'Descrivi la tua idea o il tema che ti interessa...',
    'home.startGenerating': 'Inizia a generare idee',
    'home.startDescription':
      'Clicca su uno dei pulsanti sopra per iniziare il tuo viaggio creativo',

    // Navigation
    'nav.ideas': 'Le tue idee',
    'nav.stats': 'Statistiche',
    'nav.home': 'Home',

    // Prompt descriptions
    'prompts.startupDesc':
      "Sviluppa un'idea di startup innovativa che si concentri sulla sostenibilità e la protezione ambientale",
    'prompts.scifiDesc':
      'Crea una storia di fantascienza avvincente ambientata nel prossimo futuro',
    'prompts.techDesc':
      'Progetta un prodotto tecnologico innovativo che migliori la vita quotidiana delle persone',
    'prompts.musicDesc':
      'Sviluppa un progetto musicale creativo o un concetto per diversi generi o strumenti',
    'prompts.wellnessDesc':
      "Concepisci un'app per la salute e il benessere che offra soluzioni personalizzate agli utenti",
    'prompts.appNameDesc':
      "Genera un nome creativo e memorabile per un'app mobile, inclusa una breve descrizione",
    'prompts.everydayDesc':
      'Identifica un problema quotidiano e sviluppa una soluzione pratica e innovativa',
  },

  en: {
    // Header
    'header.title': 'Creative Muse',
    'header.aiPowered': 'AI-Powered',
    'header.ideas': 'Your Ideas',
    'header.stats': 'Statistics',
    'header.back': 'Back',

    // Theme
    'theme.light': 'Enable light mode',
    'theme.dark': 'Enable dark mode',

    // Home page
    'home.title': 'Unleash Your Creativity',
    'home.subtitle':
      'Generate innovative ideas with artificial intelligence. Transform your thoughts into extraordinary projects.',
    'home.randomIdea': 'Random Idea',
    'home.randomDescription': 'Let AI generate a completely new idea for you',
    'home.customIdea': 'Custom Idea',
    'home.customDescription':
      'Describe what you have in mind and let AI develop it',
    'home.generateIdea': 'Generate Idea',
    'home.developIdea': 'Develop Idea',
    'home.generating': 'Generating...',
    'home.yourIdeas': 'Your Ideas',
    'home.viewAll': 'View All →',
    'home.noIdeas': 'Start generating ideas',
    'home.noIdeasDescription':
      'Click one of the buttons above to start your creative journey',
    'home.generateFirst': 'Generate first idea',
    'home.placeholder': 'Describe your idea or the topic that interests you...',

    // Predefined prompts
    'prompts.title': 'Predefined Prompts',
    'prompts.startup': 'Sustainable Startup',
    'prompts.scifi': 'Sci-Fi Story',
    'prompts.tech': 'Tech Product',
    'prompts.music': 'Music Concept',
    'prompts.wellness': 'Wellness App',
    'prompts.appName': 'App Name',
    'prompts.everyday': 'Everyday Problem',

    // Export
    'export.json': 'Export JSON',
    'export.markdown': 'Export Markdown',
    'export.noIdeas': 'No ideas to export',
    'export.title': 'Export ideas',

    // Ideas page
    'ideas.title': 'Your Ideas',
    'ideas.search': 'Search in your ideas...',
    'ideas.allCategories': 'All categories',
    'ideas.loading': 'Loading ideas...',
    'ideas.noResults': 'No ideas found',
    'ideas.noResultsDescription': 'Try modifying the search filters',
    'ideas.empty': 'No ideas yet',
    'ideas.emptyDescription': 'Start generating your first creative ideas',
    'ideas.count': 'ideas',

    // Stats page
    'stats.title': 'Statistics',
    'stats.updatedNow': 'Updated now',
    'stats.totalIdeas': 'Total Ideas',
    'stats.totalDescription': 'Ideas generated so far',
    'stats.averageRating': 'Average Rating',
    'stats.ratingDescription': 'Out of 5 stars',
    'stats.recentActivity': 'Recent Activity',
    'stats.recentDescription': 'Ideas this week',
    'stats.categories': 'Categories',
    'stats.categoriesDescription': 'Different categories',
    'stats.distribution': 'Distribution by Category',
    'stats.quickActions': 'Quick Actions',
    'stats.generateNew': 'Generate New Idea',
    'stats.viewAll': 'View All Ideas',
    'stats.refresh': 'Refresh Statistics',
    'stats.loading': 'Loading statistics...',
    'stats.noStats': 'No statistics available',
    'stats.noStatsDescription': 'Generate some ideas to see statistics',
    'stats.startNow': 'Start now',
    'stats.noCategories': 'No categories available',

    // Common
    'common.category': 'Category',
    'common.date': 'Date',
    'common.rating': 'Rating',
    'common.method': 'Method',
    'common.general': 'general',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'language.select': 'Select language',

    // Rating
    'rating.label': 'Rating',
    'rating.rate': 'Rate this idea',

    // Search and Filter
    'search.placeholder': 'Search ideas...',
    'filter.allCategories': 'All categories',
    'filter.allRatings': 'All ratings',
    'filter.category': 'Category',
    'filter.rating': 'Rating',
    'filter.sortBy': 'Sort by',
    'filter.search': 'Search',
    'filter.clear': 'Clear filters',
    'sort.newest': 'Newest',
    'sort.oldest': 'Oldest',
    'sort.rating': 'Rating',
    'sort.alphabetical': 'Alphabetical',

    // Home page additions
    'home.customPlaceholder':
      'Describe your idea or the topic that interests you...',
    'home.startGenerating': 'Start generating ideas',
    'home.startDescription':
      'Click one of the buttons above to start your creative journey',

    // Navigation
    'nav.ideas': 'Your Ideas',
    'nav.stats': 'Statistics',
    'nav.home': 'Home',

    // Prompt descriptions
    'prompts.startupDesc':
      'Develop an innovative startup idea that focuses on sustainability and environmental protection',
    'prompts.scifiDesc':
      'Create a compelling science fiction story set in the near future',
    'prompts.techDesc':
      "Design an innovative technology product that improves people's daily lives",
    'prompts.musicDesc':
      'Develop a creative music project or concept for different genres or instruments',
    'prompts.wellnessDesc':
      'Conceive a health and wellness app that offers personalized solutions for users',
    'prompts.appNameDesc':
      'Generate a creative and memorable name for a mobile app, including a brief description',
    'prompts.everydayDesc':
      'Identify an everyday problem and develop a practical, innovative solution',
  },

  de: {
    // Header
    'header.title': 'Creative Muse',
    'header.aiPowered': 'KI-Unterstützt',
    'header.ideas': 'Deine Ideen',
    'header.stats': 'Statistiken',
    'header.back': 'Zurück',

    // Theme
    'theme.light': 'Hellen Modus aktivieren',
    'theme.dark': 'Dunklen Modus aktivieren',

    // Home page
    'home.title': 'Entfessle deine Kreativität',
    'home.subtitle':
      'Generiere innovative Ideen mit künstlicher Intelligenz. Verwandle deine Gedanken in außergewöhnliche Projekte.',
    'home.randomIdea': 'Zufällige Idee',
    'home.randomDescription':
      'Lass die KI eine völlig neue Idee für dich generieren',
    'home.customIdea': 'Benutzerdefinierte Idee',
    'home.customDescription':
      'Beschreibe was du im Kopf hast und lass die KI es entwickeln',
    'home.generateIdea': 'Idee Generieren',
    'home.developIdea': 'Idee Entwickeln',
    'home.generating': 'Generiere...',
    'home.yourIdeas': 'Deine Ideen',
    'home.viewAll': 'Alle Anzeigen →',
    'home.noIdeas': 'Beginne Ideen zu generieren',
    'home.noIdeasDescription':
      'Klicke auf einen der Buttons oben um deine kreative Reise zu beginnen',
    'home.generateFirst': 'Erste Idee generieren',
    'home.placeholder':
      'Beschreibe deine Idee oder das Thema das dich interessiert...',

    // Predefined prompts
    'prompts.title': 'Prompt Predefiniti',
    'prompts.startup': 'Nachhaltiges Startup',
    'prompts.scifi': 'Sci-Fi Story',
    'prompts.tech': 'Tech-Produkt',
    'prompts.music': 'Musik-Konzept',
    'prompts.wellness': 'Wellness-App',
    'prompts.appName': 'App-Name',
    'prompts.everyday': 'Alltagsproblem',

    // Export
    'export.json': 'JSON Exportieren',
    'export.markdown': 'Markdown Exportieren',
    'export.noIdeas': 'Keine Ideen zum Exportieren',
    'export.title': 'Ideen exportieren',

    // Ideas page
    'ideas.title': 'Deine Ideen',
    'ideas.search': 'In deinen Ideen suchen...',
    'ideas.allCategories': 'Alle Kategorien',
    'ideas.loading': 'Lade Ideen...',
    'ideas.noResults': 'Keine Ideen gefunden',
    'ideas.noResultsDescription': 'Versuche die Suchfilter zu ändern',
    'ideas.empty': 'Noch keine Ideen',
    'ideas.emptyDescription':
      'Beginne deine ersten kreativen Ideen zu generieren',
    'ideas.count': 'Ideen',

    // Stats page
    'stats.title': 'Statistiken',
    'stats.updatedNow': 'Jetzt aktualisiert',
    'stats.totalIdeas': 'Gesamte Ideen',
    'stats.totalDescription': 'Bisher generierte Ideen',
    'stats.averageRating': 'Durchschnittsbewertung',
    'stats.ratingDescription': 'Von 5 Sternen',
    'stats.recentActivity': 'Letzte Aktivität',
    'stats.recentDescription': 'Ideen diese Woche',
    'stats.categories': 'Kategorien',
    'stats.categoriesDescription': 'Verschiedene Kategorien',
    'stats.distribution': 'Verteilung nach Kategorie',
    'stats.quickActions': 'Schnelle Aktionen',
    'stats.generateNew': 'Neue Idee Generieren',
    'stats.viewAll': 'Alle Ideen Anzeigen',
    'stats.refresh': 'Statistiken Aktualisieren',
    'stats.loading': 'Lade Statistiken...',
    'stats.noStats': 'Keine Statistiken verfügbar',
    'stats.noStatsDescription':
      'Generiere einige Ideen um Statistiken zu sehen',
    'stats.startNow': 'Jetzt starten',
    'stats.noCategories': 'Keine Kategorien verfügbar',

    // Common
    'common.category': 'Kategorie',
    'common.date': 'Datum',
    'common.rating': 'Bewertung',
    'common.method': 'Methode',
    'common.general': 'allgemein',
    'common.error': 'Fehler',
    'common.retry': 'Wiederholen',
    'common.close': 'Schließen',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',

    // Language
    'language.select': 'Sprache auswählen',

    // Rating
    'rating.label': 'Bewertung',
    'rating.rate': 'Diese Idee bewerten',

    // Search and Filter
    'search.placeholder': 'Ideen suchen...',
    'filter.allCategories': 'Alle Kategorien',
    'filter.allRatings': 'Alle Bewertungen',
    'filter.category': 'Kategorie',
    'filter.rating': 'Bewertung',
    'filter.sortBy': 'Sortieren nach',
    'filter.search': 'Suche',
    'filter.clear': 'Filter löschen',
    'sort.newest': 'Neueste',
    'sort.oldest': 'Älteste',
    'sort.rating': 'Bewertung',
    'sort.alphabetical': 'Alphabetisch',

    // Home page additions
    'home.customPlaceholder':
      'Beschreibe deine Idee oder das Thema das dich interessiert...',
    'home.startGenerating': 'Beginne Ideen zu generieren',
    'home.startDescription':
      'Klicke auf einen der Buttons oben um deine kreative Reise zu beginnen',

    // Navigation
    'nav.ideas': 'Deine Ideen',
    'nav.stats': 'Statistiken',
    'nav.home': 'Startseite',

    // Prompt descriptions
    'prompts.startupDesc':
      'Entwickle eine innovative Startup-Idee, die sich auf Nachhaltigkeit und Umweltschutz konzentriert',
    'prompts.scifiDesc':
      'Erstelle eine fesselnde Science-Fiction-Geschichte, die in der nahen Zukunft spielt',
    'prompts.techDesc':
      'Entwirf ein innovatives Technologieprodukt, das den Alltag der Menschen verbessert',
    'prompts.musicDesc':
      'Entwickle ein kreatives Musikprojekt oder -konzept für verschiedene Genres oder Instrumente',
    'prompts.wellnessDesc':
      'Konzipiere eine App für Gesundheit und Wohlbefinden, die personalisierte Lösungen für Nutzer bietet',
    'prompts.appNameDesc':
      'Generiere einen kreativen und einprägsamen Namen für eine mobile App, inklusive einer kurzen Beschreibung',
    'prompts.everydayDesc':
      'Identifiziere ein alltägliches Problem und entwickle eine praktische, innovative Lösung',
  },

  fr: {
    // Header
    'header.title': 'Creative Muse',
    'header.aiPowered': 'Alimenté par IA',
    'header.ideas': 'Vos Idées',
    'header.stats': 'Statistiques',
    'header.back': 'Retour',

    // Theme
    'theme.light': 'Activer le mode clair',
    'theme.dark': 'Activer le mode sombre',

    // Home page
    'home.title': 'Libérez votre créativité',
    'home.subtitle':
      "Générez des idées innovantes avec l'intelligence artificielle. Transformez vos pensées en projets extraordinaires.",
    'home.randomIdea': 'Idée Aléatoire',
    'home.randomDescription':
      "Laissez l'IA générer une idée complètement nouvelle pour vous",
    'home.customIdea': 'Idée Personnalisée',
    'home.customDescription':
      "Décrivez ce que vous avez en tête et laissez l'IA le développer",
    'home.generateIdea': 'Générer Idée',
    'home.developIdea': 'Développer Idée',
    'home.generating': 'Génération...',
    'home.yourIdeas': 'Vos Idées',
    'home.viewAll': 'Voir Tout →',
    'home.noIdeas': 'Commencez à générer des idées',
    'home.noIdeasDescription':
      "Cliquez sur l'un des boutons ci-dessus pour commencer votre voyage créatif",
    'home.generateFirst': 'Générer la première idée',
    'home.placeholder': 'Décrivez votre idée ou le sujet qui vous intéresse...',

    // Predefined prompts
    'prompts.title': 'Prompts Prédéfinis',
    'prompts.startup': 'Startup Durable',
    'prompts.scifi': 'Histoire Sci-Fi',
    'prompts.tech': 'Produit Tech',
    'prompts.music': 'Concept Musical',
    'prompts.wellness': 'App Bien-être',
    'prompts.appName': "Nom d'App",
    'prompts.everyday': 'Problème Quotidien',

    // Export
    'export.json': 'Exporter JSON',
    'export.markdown': 'Exporter Markdown',
    'export.noIdeas': 'Aucune idée à exporter',
    'export.title': 'Exporter les idées',

    // Ideas page
    'ideas.title': 'Vos Idées',
    'ideas.search': 'Rechercher dans vos idées...',
    'ideas.allCategories': 'Toutes les catégories',
    'ideas.loading': 'Chargement des idées...',
    'ideas.noResults': 'Aucune idée trouvée',
    'ideas.noResultsDescription':
      'Essayez de modifier les filtres de recherche',
    'ideas.empty': 'Aucune idée encore',
    'ideas.emptyDescription':
      'Commencez à générer vos premières idées créatives',
    'ideas.count': 'idées',

    // Stats page
    'stats.title': 'Statistiques',
    'stats.updatedNow': 'Mis à jour maintenant',
    'stats.totalIdeas': 'Idées Totales',
    'stats.totalDescription': "Idées générées jusqu'à présent",
    'stats.averageRating': 'Note Moyenne',
    'stats.ratingDescription': 'Sur 5 étoiles',
    'stats.recentActivity': 'Activité Récente',
    'stats.recentDescription': 'Idées cette semaine',
    'stats.categories': 'Catégories',
    'stats.categoriesDescription': 'Catégories différentes',
    'stats.distribution': 'Distribution par Catégorie',
    'stats.quickActions': 'Actions Rapides',
    'stats.generateNew': 'Générer Nouvelle Idée',
    'stats.viewAll': 'Voir Toutes les Idées',
    'stats.refresh': 'Actualiser Statistiques',
    'stats.loading': 'Chargement des statistiques...',
    'stats.noStats': 'Aucune statistique disponible',
    'stats.noStatsDescription':
      'Générez quelques idées pour voir les statistiques',
    'stats.startNow': 'Commencer maintenant',
    'stats.noCategories': 'Aucune catégorie disponible',

    // Common
    'common.category': 'Catégorie',
    'common.date': 'Date',
    'common.rating': 'Note',
    'common.method': 'Méthode',
    'common.general': 'général',
    'common.error': 'Erreur',
    'common.retry': 'Réessayer',
    'common.close': 'Fermer',
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',

    // Language
    'language.select': 'Sélectionner la langue',

    // Rating
    'rating.label': 'Note',
    'rating.rate': 'Noter cette idée',

    // Search and Filter
    'search.placeholder': 'Rechercher des idées...',
    'filter.allCategories': 'Toutes les catégories',
    'filter.allRatings': 'Toutes les notes',
    'filter.category': 'Catégorie',
    'filter.rating': 'Note',
    'filter.sortBy': 'Trier par',
    'filter.search': 'Recherche',
    'filter.clear': 'Effacer les filtres',
    'sort.newest': 'Plus récents',
    'sort.oldest': 'Plus anciens',
    'sort.rating': 'Note',
    'sort.alphabetical': 'Alphabétique',

    // Home page additions
    'home.customPlaceholder':
      'Décrivez votre idée ou le sujet qui vous intéresse...',
    'home.startGenerating': 'Commencer à générer des idées',
    'home.startDescription':
      "Cliquez sur l'un des boutons ci-dessus pour commencer votre voyage créatif",

    // Navigation
    'nav.ideas': 'Vos Idées',
    'nav.stats': 'Statistiques',
    'nav.home': 'Accueil',

    // Prompt descriptions
    'prompts.startupDesc':
      "Développez une idée de startup innovante qui se concentre sur la durabilité et la protection de l'environnement",
    'prompts.scifiDesc':
      'Créez une histoire de science-fiction captivante se déroulant dans un futur proche',
    'prompts.techDesc':
      'Concevez un produit technologique innovant qui améliore la vie quotidienne des gens',
    'prompts.musicDesc':
      'Développez un projet musical créatif ou un concept pour différents genres ou instruments',
    'prompts.wellnessDesc':
      'Concevez une application de santé et bien-être qui offre des solutions personnalisées aux utilisateurs',
    'prompts.appNameDesc':
      'Générez un nom créatif et mémorable pour une application mobile, incluant une brève description',
    'prompts.everydayDesc':
      'Identifiez un problème quotidien et développez une solution pratique et innovante',
  },

  es: {
    // Header
    'header.title': 'Creative Muse',
    'header.aiPowered': 'Impulsado por IA',
    'header.ideas': 'Tus Ideas',
    'header.stats': 'Estadísticas',
    'header.back': 'Atrás',

    // Theme
    'theme.light': 'Activar modo claro',
    'theme.dark': 'Activar modo oscuro',

    // Home page
    'home.title': 'Libera tu creatividad',
    'home.subtitle':
      'Genera ideas innovadoras con inteligencia artificial. Transforma tus pensamientos en proyectos extraordinarios.',
    'home.randomIdea': 'Idea Aleatoria',
    'home.randomDescription':
      'Deja que la IA genere una idea completamente nueva para ti',
    'home.customIdea': 'Idea Personalizada',
    'home.customDescription':
      'Describe lo que tienes en mente y deja que la IA lo desarrolle',
    'home.generateIdea': 'Generar Idea',
    'home.developIdea': 'Desarrollar Idea',
    'home.generating': 'Generando...',
    'home.yourIdeas': 'Tus Ideas',
    'home.viewAll': 'Ver Todas →',
    'home.noIdeas': 'Comienza a generar ideas',
    'home.noIdeasDescription':
      'Haz clic en uno de los botones de arriba para comenzar tu viaje creativo',
    'home.generateFirst': 'Generar primera idea',
    'home.placeholder': 'Describe tu idea o el tema que te interesa...',

    // Predefined prompts
    'prompts.title': 'Prompts Predefinidos',
    'prompts.startup': 'Startup Sostenible',
    'prompts.scifi': 'Historia Sci-Fi',
    'prompts.tech': 'Producto Tech',
    'prompts.music': 'Concepto Musical',
    'prompts.wellness': 'App Bienestar',
    'prompts.appName': 'Nombre de App',
    'prompts.everyday': 'Problema Cotidiano',

    // Export
    'export.json': 'Exportar JSON',
    'export.markdown': 'Exportar Markdown',
    'export.noIdeas': 'No hay ideas para exportar',
    'export.title': 'Exportar ideas',

    // Ideas page
    'ideas.title': 'Tus Ideas',
    'ideas.search': 'Buscar en tus ideas...',
    'ideas.allCategories': 'Todas las categorías',
    'ideas.loading': 'Cargando ideas...',
    'ideas.noResults': 'No se encontraron ideas',
    'ideas.noResultsDescription': 'Intenta modificar los filtros de búsqueda',
    'ideas.empty': 'Aún no hay ideas',
    'ideas.emptyDescription': 'Comienza a generar tus primeras ideas creativas',
    'ideas.count': 'ideas',

    // Stats page
    'stats.title': 'Estadísticas',
    'stats.updatedNow': 'Actualizado ahora',
    'stats.totalIdeas': 'Ideas Totales',
    'stats.totalDescription': 'Ideas generadas hasta ahora',
    'stats.averageRating': 'Calificación Promedio',
    'stats.ratingDescription': 'De 5 estrellas',
    'stats.recentActivity': 'Actividad Reciente',
    'stats.recentDescription': 'Ideas esta semana',
    'stats.categories': 'Categorías',
    'stats.categoriesDescription': 'Categorías diferentes',
    'stats.distribution': 'Distribución por Categoría',
    'stats.quickActions': 'Acciones Rápidas',
    'stats.generateNew': 'Generar Nueva Idea',
    'stats.viewAll': 'Ver Todas las Ideas',
    'stats.refresh': 'Actualizar Estadísticas',
    'stats.loading': 'Cargando estadísticas...',
    'stats.noStats': 'No hay estadísticas disponibles',
    'stats.noStatsDescription': 'Genera algunas ideas para ver estadísticas',
    'stats.startNow': 'Comenzar ahora',
    'stats.noCategories': 'No hay categorías disponibles',

    // Common
    'common.category': 'Categoría',
    'common.date': 'Fecha',
    'common.rating': 'Calificación',
    'common.method': 'Método',
    'common.general': 'general',
    'common.error': 'Error',
    'common.retry': 'Reintentar',
    'common.close': 'Cerrar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',

    // Language
    'language.select': 'Seleccionar idioma',

    // Rating
    'rating.label': 'Calificación',
    'rating.rate': 'Calificar esta idea',

    // Search and Filter
    'search.placeholder': 'Buscar ideas...',
    'filter.allCategories': 'Todas las categorías',
    'filter.allRatings': 'Todas las calificaciones',
    'filter.category': 'Categoría',
    'filter.rating': 'Calificación',
    'filter.sortBy': 'Ordenar por',
    'filter.search': 'Búsqueda',
    'filter.clear': 'Limpiar filtros',
    'sort.newest': 'Más nuevos',
    'sort.oldest': 'Más antiguos',
    'sort.rating': 'Calificación',
    'sort.alphabetical': 'Alfabético',

    // Home page additions
    'home.customPlaceholder': 'Describe tu idea o el tema que te interesa...',
    'home.startGenerating': 'Comenzar a generar ideas',
    'home.startDescription':
      'Haz clic en uno de los botones de arriba para comenzar tu viaje creativo',

    // Navigation
    'nav.ideas': 'Tus Ideas',
    'nav.stats': 'Estadísticas',
    'nav.home': 'Inicio',

    // Prompt descriptions
    'prompts.startupDesc':
      'Desarrolla una idea de startup innovadora que se enfoque en la sostenibilidad y protección ambiental',
    'prompts.scifiDesc':
      'Crea una historia de ciencia ficción cautivadora ambientada en el futuro cercano',
    'prompts.techDesc':
      'Diseña un producto tecnológico innovador que mejore la vida diaria de las personas',
    'prompts.musicDesc':
      'Desarrolla un proyecto musical creativo o concepto para diferentes géneros o instrumentos',
    'prompts.wellnessDesc':
      'Concibe una app de salud y bienestar que ofrezca soluciones personalizadas para usuarios',
    'prompts.appNameDesc':
      'Genera un nombre creativo y memorable para una aplicación móvil, incluyendo una breve descripción',
    'prompts.everydayDesc':
      'Identifica un problema cotidiano y desarrolla una solución práctica e innovadora',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('it');

  useEffect(() => {
    // Carica la lingua salvata dal localStorage
    const savedLanguage = localStorage.getItem(
      'creativeMuseLanguage'
    ) as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    } else {
      // Usa la lingua del browser se disponibile
      const browserLang = navigator.language.split('-')[0] as Language;
      if (translations[browserLang]) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('creativeMuseLanguage', lang);
    // Aggiorna anche l'attributo lang del documento
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    const translation = translations[language] as Record<string, string>;
    return translation[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
