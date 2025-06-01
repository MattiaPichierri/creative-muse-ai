'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

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
    
    // New prompt features
    'prompts.predefined': 'Prompt Predefiniti',
    'prompts.selectPrompt': 'Seleziona un Prompt',
    'prompts.allCategories': 'Tutte le Categorie',
    
    // Advanced Prompt Settings
    'advanced.settings': 'Impostazioni Avanzate',
    'advanced.basicSettings': 'Impostazioni Base',
    'advanced.defaultCategory': 'Categoria Predefinita',
    'advanced.defaultCreativity': 'Livello Creatività Predefinito',
    'advanced.preferredTags': 'Tag Preferiti',
    'advanced.addTag': 'Aggiungi Tag',
    'advanced.promptSuggestions': 'Suggerimenti Prompt',
    'advanced.addCustomPrompt': 'Aggiungi Prompt Personalizzato',
    'advanced.promptText': 'Testo del Prompt',
    'advanced.saveSettings': 'Salva Impostazioni',
    'advanced.close': 'Chiudi',
    
    // Categories
    'categories.general': 'Generale',
    'categories.business': 'Business',
    'categories.technology': 'Tecnologia',
    'categories.art': 'Arte',
    'categories.science': 'Scienza',
    'categories.health': 'Salute',
    'categories.education': 'Educazione',
    'categories.entertainment': 'Intrattenimento',

    // Prompt predefiniti
    'prompts.1.text': 'Sviluppa una soluzione innovativa per il trasporto sostenibile nelle città',
    'prompts.1.tags': 'sostenibilità,trasporto,città,innovazione',
    'prompts.2.text': 'Progetta un progetto artistico che unisce tecnologia e natura',
    'prompts.2.tags': 'arte,tecnologia,natura,connessione',
    'prompts.3.text': 'Crea un modello di business per un\'app che rafforza le comunità locali',
    'prompts.3.tags': 'app,comunità,locale,business',
    'prompts.4.text': 'Sviluppa un concetto educativo per la risoluzione creativa dei problemi',
    'prompts.4.tags': 'educazione,creatività,problem-solving,apprendimento',
    'prompts.5.text': 'Progetta un programma di benessere per nomadi digitali',
    'prompts.5.tags': 'benessere,digitale,nomadi,salute',

    // Authentication
    'auth.login': 'Accedi',
    'auth.register': 'Registrati',
    'auth.logout': 'Esci',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Conferma Password',
    'auth.username': 'Username',
    'auth.loginTitle': 'Accedi a Creative Muse',
    'auth.loginSubtitle': 'Inserisci le tue credenziali per accedere',
    'auth.registerTitle': 'Registrati a Creative Muse',
    'auth.registerSubtitle': 'Crea il tuo account per iniziare a generare idee creative',
    'auth.loginButton': 'Accedi',
    'auth.registerButton': 'Registrati',
    'auth.loggingIn': 'Accesso in corso...',
    'auth.registering': 'Registrazione in corso...',
    'auth.noAccount': 'Non hai un account?',
    'auth.hasAccount': 'Hai già un account?',
    'auth.passwordMinLength': 'Minimo 8 caratteri',
    'auth.passwordMismatch': 'Le password non corrispondono',
    'auth.passwordTooShort': 'La password deve essere di almeno 8 caratteri',
    'auth.usernameOptional': 'Username (opzionale)',
    'auth.emailRequired': 'Email *',
    'auth.passwordRequired': 'Password *',
    'auth.confirmPasswordRequired': 'Conferma Password *',
    'auth.loading': 'Caricamento...',
    'auth.redirecting': 'Reindirizzamento...',

    // Subscription
    'subscription.title': 'Dashboard Sottoscrizione',
    'subscription.subtitle': 'Gestisci il tuo piano e monitora l\'utilizzo',
    'subscription.loading': 'Caricamento informazioni sottoscrizione...',
    'subscription.plan': 'Piano',
    'subscription.usage': 'Utilizzo',
    'subscription.limits': 'Limiti',
    'subscription.features': 'Funzionalità',
    'subscription.upgrade': 'Aggiorna Piano',
    'subscription.viewPlans': 'Visualizza piani disponibili',
    'subscription.teamMembers': 'Membri Team',
    'subscription.maxProjects': 'Progetti Max',
    'subscription.aiModels': 'AI',
    'subscription.dailyUsage': 'Utilizzo Giornaliero',
    'subscription.monthlyUsage': 'Utilizzo Mensile',
    'subscription.ideasToday': 'Idee generate oggi',
    'subscription.ideasMonth': 'Idee generate questo mese',
    'subscription.unlimited': '∞',
    'subscription.warningDaily': '⚠️ Stai raggiungendo il limite giornaliero',
    'subscription.warningMonthly': '⚠️ Stai raggiungendo il limite mensile',
    'subscription.planFeatures': 'Funzionalità del tuo piano',
    'subscription.aiModelsAvailable': 'Modelli AI disponibili:',
    'subscription.exportFormats': 'Formati di esportazione:',
    'subscription.advancedFeatures': 'Funzionalità avanzate:',
    'subscription.collaboration': 'Collaborazione team',
    'subscription.prioritySupport': 'Supporto prioritario',
    'subscription.apiAccess': 'Accesso API',
    'subscription.analytics': 'Analytics avanzate',
    'subscription.upgradeTitle': 'Aggiorna il tuo piano',
    'subscription.upgradeDescription': 'Sblocca più funzionalità e aumenta i tuoi limiti',

    // Plans
    'plans.free': 'Free',
    'plans.creator': 'Creator',
    'plans.pro': 'Pro',
    'plans.enterprise': 'Enterprise',
    'plans.freePrice': 'Piano gratuito',
    'plans.monthly': '/mese',

    // Navigation
    'nav.subscription': 'Sottoscrizione',
    'nav.settings': 'Impostazioni',
    'nav.user': 'Utente',
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
    'search.title': 'Ricerca Avanzata',
    'search.description': 'Trova le tue idee usando filtri avanzati',
    'search.placeholder': 'Cerca nelle tue idee...',
    'search.results': 'risultati',
    'search.clear': 'Cancella filtri',
    'search.filters': 'Filtri',
    'search.category': 'Categoria',
    'search.allCategories': 'Tutte le categorie',
    'search.rating': 'Valutazione',
    'search.anyRating': 'Qualsiasi valutazione',
    'search.dateRange': 'Periodo',
    'search.anyTime': 'Qualsiasi momento',
    'search.today': 'Oggi',
    'search.thisWeek': 'Questa settimana',
    'search.thisMonth': 'Questo mese',
    'search.thisYear': 'Quest\'anno',
    'search.model': 'Modello AI',
    'search.anyModel': 'Qualsiasi modello',
    'search.mockModel': 'Modello Mock',
    'search.sortBy': 'Ordina per',
    'search.sortDate': 'Data',
    'search.sortTitle': 'Titolo',
    'search.sortRating': 'Valutazione',
    'search.sortCategory': 'Categoria',
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
    
    // New prompt features
    'prompts.predefined': 'Predefined Prompts',
    'prompts.selectPrompt': 'Select a Prompt',
    'prompts.allCategories': 'All Categories',
    
    // Advanced Prompt Settings
    'advanced.settings': 'Advanced Settings',
    'advanced.basicSettings': 'Basic Settings',
    'advanced.defaultCategory': 'Default Category',
    'advanced.defaultCreativity': 'Default Creativity Level',
    'advanced.preferredTags': 'Preferred Tags',
    'advanced.addTag': 'Add Tag',
    'advanced.promptSuggestions': 'Prompt Suggestions',
    'advanced.addCustomPrompt': 'Add Custom Prompt',
    'advanced.promptText': 'Prompt Text',
    'advanced.saveSettings': 'Save Settings',
    'advanced.close': 'Close',

    // Categories
    'categories.general': 'General',
    'categories.business': 'Business',
    'categories.technology': 'Technology',
    'categories.art': 'Art',
    'categories.science': 'Science',
    'categories.health': 'Health',
    'categories.education': 'Education',
    'categories.entertainment': 'Entertainment',

    // Prompt predefiniti
    'prompts.1.text': 'Develop an innovative solution for sustainable urban transportation',
    'prompts.1.tags': 'sustainability,transport,cities,innovation',
    'prompts.2.text': 'Design an art project that connects technology and nature',
    'prompts.2.tags': 'art,technology,nature,connection',
    'prompts.3.text': 'Create a business model for an app that strengthens local communities',
    'prompts.3.tags': 'app,community,local,business',
    'prompts.4.text': 'Develop an educational concept for creative problem solving',
    'prompts.4.tags': 'education,creativity,problem-solving,learning',
    'prompts.5.text': 'Design a wellness program for digital nomads',
    'prompts.5.tags': 'wellness,digital,nomads,health',

    // Bulk Actions
    'bulk.selected': 'selezionati',
    'bulk.actions': 'Azioni di Gruppo',
    'bulk.description': 'Gestisci più idee contemporaneamente',
    'bulk.export': 'Esporta',
    'bulk.rate': 'Valuta',
    'bulk.archive': 'Archivia',
    'bulk.copy': 'Copia',
    'bulk.delete': 'Elimina',
    'bulk.items': 'elementi',
    'bulk.rateTitle': 'Valuta Idee Selezionate',
    'bulk.rateDescription': 'Assegna una valutazione a tutte le idee selezionate',
    'bulk.deleteTitle': 'Elimina Idee Selezionate',
    'bulk.deleteDescription': 'Sei sicuro di voler eliminare le idee selezionate?',
    'bulk.confirmDelete': 'Elimina Definitivamente',

    // Templates
    'templates.title': 'Modelli di Idee',
    'templates.description': 'Usa modelli strutturati per organizzare le tue idee',
    'templates.sections': 'sezioni',
    'templates.fillSections': 'Compila le sezioni del modello per creare la tua idea',
    'templates.useTemplate': 'Usa Modello',

    // Advanced Stats
    'stats.advanced': 'Statistiche Avanzate',
    'stats.detailedAnalysis': 'Analisi dettagliata delle tue idee creative',
    'stats.productivityScore': 'Punteggio Produttività',
    'stats.creativityTrend': 'Tendenza Creatività',
    'stats.weeklyProgress': 'Progresso Settimanale',
    'stats.categoryDistribution': 'Distribuzione Categorie',
    'stats.categoryDescription': 'Come sono distribuite le tue idee',
    'stats.insights': 'Insights e Raccomandazioni',
    'stats.insightsDescription': 'Analisi personalizzate del tuo comportamento creativo',
    'stats.peakHours': 'Ore di Picco',
    'stats.favoriteCategories': 'Categorie Preferite',
    'stats.modelPerformance': 'Performance Modello',
    'stats.noModelLoaded': 'Nessun modello caricato',
    'stats.error': 'Errore nel caricamento',
    'stats.noData': 'Nessun dato disponibile',
    'stats.retry': 'Riprova',

    // Authentication
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.username': 'Username',
    'auth.loginTitle': 'Login to Creative Muse',
    'auth.loginSubtitle': 'Enter your credentials to access',
    'auth.registerTitle': 'Register to Creative Muse',
    'auth.registerSubtitle': 'Create your account to start generating creative ideas',
    'auth.loginButton': 'Login',
    'auth.registerButton': 'Register',
    'auth.loggingIn': 'Logging in...',
    'auth.registering': 'Registering...',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.hasAccount': 'Already have an account?',
    'auth.passwordMinLength': 'Minimum 8 characters',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.passwordTooShort': 'Password must be at least 8 characters',
    'auth.usernameOptional': 'Username (optional)',
    'auth.emailRequired': 'Email *',
    'auth.passwordRequired': 'Password *',
    'auth.confirmPasswordRequired': 'Confirm Password *',
    'auth.loading': 'Loading...',
    'auth.redirecting': 'Redirecting...',

    // Subscription
    'subscription.title': 'Subscription Dashboard',
    'subscription.subtitle': 'Manage your plan and monitor usage',
    'subscription.loading': 'Loading subscription information...',
    'subscription.plan': 'Plan',
    'subscription.usage': 'Usage',
    'subscription.limits': 'Limits',
    'subscription.features': 'Features',
    'subscription.upgrade': 'Upgrade Plan',
    'subscription.viewPlans': 'View available plans',
    'subscription.teamMembers': 'Team Members',
    'subscription.maxProjects': 'Max Projects',
    'subscription.aiModels': 'AI',
    'subscription.dailyUsage': 'Daily Usage',
    'subscription.monthlyUsage': 'Monthly Usage',
    'subscription.ideasToday': 'Ideas generated today',
    'subscription.ideasMonth': 'Ideas generated this month',
    'subscription.unlimited': '∞',
    'subscription.warningDaily': '⚠️ You are reaching the daily limit',
    'subscription.warningMonthly': '⚠️ You are reaching the monthly limit',
    'subscription.planFeatures': 'Your plan features',
    'subscription.aiModelsAvailable': 'Available AI models:',
    'subscription.exportFormats': 'Export formats:',
    'subscription.advancedFeatures': 'Advanced features:',
    'subscription.collaboration': 'Team collaboration',
    'subscription.prioritySupport': 'Priority support',
    'subscription.apiAccess': 'API access',
    'subscription.analytics': 'Advanced analytics',
    'subscription.upgradeTitle': 'Upgrade your plan',
    'subscription.upgradeDescription': 'Unlock more features and increase your limits',

    // Plans
    'plans.free': 'Free',
    'plans.creator': 'Creator',
    'plans.pro': 'Pro',
    'plans.enterprise': 'Enterprise',
    'plans.freePrice': 'Free plan',
    'plans.monthly': '/month',

    // Navigation
    'nav.subscription': 'Subscription',
    'nav.settings': 'Settings',
    'nav.user': 'User',
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
    
    // New prompt features
    'prompts.predefined': 'Vordefinierte Prompts',
    'prompts.selectPrompt': 'Prompt Auswählen',
    'prompts.allCategories': 'Alle Kategorien',
    
    // Advanced Prompt Settings
    'advanced.settings': 'Erweiterte Einstellungen',
    'advanced.basicSettings': 'Grundeinstellungen',
    'advanced.defaultCategory': 'Standard-Kategorie',
    'advanced.defaultCreativity': 'Standard-Kreativitätslevel',
    'advanced.preferredTags': 'Bevorzugte Tags',
    'advanced.addTag': 'Tag hinzufügen',
    'advanced.promptSuggestions': 'Prompt-Vorschläge',
    'advanced.addCustomPrompt': 'Eigenen Prompt hinzufügen',
    'advanced.promptText': 'Prompt-Text',
    'advanced.saveSettings': 'Einstellungen speichern',
    'advanced.close': 'Schließen',

    // Categories
    'categories.general': 'Allgemein',
    'categories.business': 'Business',
    'categories.technology': 'Technologie',
    'categories.art': 'Kunst',
    'categories.science': 'Wissenschaft',
    'categories.health': 'Gesundheit',
    'categories.education': 'Bildung',
    'categories.entertainment': 'Unterhaltung',

    // Prompt predefiniti
    'prompts.1.text': 'Entwickle eine innovative Lösung für nachhaltigen Transport in Städten',
    'prompts.1.tags': 'nachhaltigkeit,transport,städte,innovation',
    'prompts.2.text': 'Entwirf ein Kunstprojekt, das Technologie und Natur verbindet',
    'prompts.2.tags': 'kunst,technologie,natur,verbindung',
    'prompts.3.text': 'Kreiere ein Geschäftsmodell für eine App, die lokale Gemeinschaften stärkt',
    'prompts.3.tags': 'app,gemeinschaft,lokal,geschäft',
    'prompts.4.text': 'Entwickle ein Bildungskonzept für kreatives Problemlösen',
    'prompts.4.tags': 'bildung,kreativität,problemlösung,lernen',
    'prompts.5.text': 'Entwirf ein Wellness-Programm für digitale Nomaden',
    'prompts.5.tags': 'wellness,digital,nomaden,gesundheit',

    // Authentication
    'auth.login': 'Anmelden',
    'auth.register': 'Registrieren',
    'auth.logout': 'Abmelden',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.confirmPassword': 'Passwort bestätigen',
    'auth.username': 'Benutzername',
    'auth.loginTitle': 'Bei Creative Muse anmelden',
    'auth.loginSubtitle': 'Gib deine Anmeldedaten ein',
    'auth.registerTitle': 'Bei Creative Muse registrieren',
    'auth.registerSubtitle': 'Erstelle dein Konto um kreative Ideen zu generieren',
    'auth.loginButton': 'Anmelden',
    'auth.registerButton': 'Registrieren',
    'auth.loggingIn': 'Anmeldung läuft...',
    'auth.registering': 'Registrierung läuft...',
    'auth.noAccount': 'Noch kein Konto?',
    'auth.hasAccount': 'Bereits ein Konto?',
    'auth.passwordMinLength': 'Mindestens 8 Zeichen',
    'auth.passwordMismatch': 'Passwörter stimmen nicht überein',
    'auth.passwordTooShort': 'Passwort muss mindestens 8 Zeichen haben',
    'auth.usernameOptional': 'Benutzername (optional)',
    'auth.emailRequired': 'E-Mail *',
    'auth.passwordRequired': 'Passwort *',
    'auth.confirmPasswordRequired': 'Passwort bestätigen *',
    'auth.loading': 'Lädt...',
    'auth.redirecting': 'Weiterleitung...',

    // Subscription
    'subscription.title': 'Abonnement Dashboard',
    'subscription.subtitle': 'Verwalte dein Abo und überwache die Nutzung',
    'subscription.loading': 'Lade Abonnement-Informationen...',
    'subscription.plan': 'Plan',
    'subscription.usage': 'Nutzung',
    'subscription.limits': 'Limits',
    'subscription.features': 'Funktionen',
    'subscription.upgrade': 'Plan upgraden',
    'subscription.viewPlans': 'Verfügbare Pläne anzeigen',
    'subscription.teamMembers': 'Team-Mitglieder',
    'subscription.maxProjects': 'Max. Projekte',
    'subscription.aiModels': 'KI',
    'subscription.dailyUsage': 'Tägliche Nutzung',
    'subscription.monthlyUsage': 'Monatliche Nutzung',
    'subscription.ideasToday': 'Heute generierte Ideen',
    'subscription.ideasMonth': 'Diesen Monat generierte Ideen',
    'subscription.unlimited': '∞',
    'subscription.warningDaily': '⚠️ Du erreichst das tägliche Limit',
    'subscription.warningMonthly': '⚠️ Du erreichst das monatliche Limit',
    'subscription.planFeatures': 'Funktionen deines Plans',
    'subscription.aiModelsAvailable': 'Verfügbare KI-Modelle:',
    'subscription.exportFormats': 'Export-Formate:',
    'subscription.advancedFeatures': 'Erweiterte Funktionen:',
    'subscription.collaboration': 'Team-Zusammenarbeit',
    'subscription.prioritySupport': 'Prioritäts-Support',
    'subscription.apiAccess': 'API-Zugang',
    'subscription.analytics': 'Erweiterte Analysen',
    'subscription.upgradeTitle': 'Deinen Plan upgraden',
    'subscription.upgradeDescription': 'Schalte mehr Funktionen frei und erhöhe deine Limits',

    // Plans
    'plans.free': 'Kostenlos',
    'plans.creator': 'Creator',
    'plans.pro': 'Pro',
    'plans.enterprise': 'Enterprise',
    'plans.freePrice': 'Kostenloser Plan',
    'plans.monthly': '/Monat',

    // Navigation
    'nav.subscription': 'Abonnement',
    'nav.settings': 'Einstellungen',
    'nav.user': 'Benutzer',

    // Model Selector
    'models.title': 'KI-Modell Auswahl',
    'models.description': 'Wählen Sie ein KI-Modell für die Ideengenerierung. Empfohlene Modelle sind mit einem Stern markiert.',
    'models.selectModel': 'Modell wählen',
    'models.loading': 'Lade Modelle...',
    'models.noModels': 'Keine Modelle gefunden',
    'models.noModelsDescription': 'Stellen Sie sicher, dass das Backend läuft',
    'models.available': 'Verfügbare Modelle',
    'models.unavailable': 'Nicht verfügbare Modelle',
    'models.status.active': 'Aktiv',
    'models.status.available': 'Verfügbar',
    'models.status.loaded': 'Geladen',
    'models.status.unavailable': 'Nicht verfügbar',
    'models.activate': 'Aktivieren',
    'models.activating': 'Wechsle...',
    'models.currentlyActive': '✓ Aktuell aktiv',
    'models.deactivate': 'Deaktivieren',
    'models.deactivating': 'Deaktiviere...',
    'models.downloadHint': '💡 Verwenden Sie:',
    'models.requiresToken': 'Token',

    // Advanced Search
    'search.title': 'Erweiterte Suche',
    'search.description': 'Finde deine Ideen mit erweiterten Filtern',
    'search.results': 'Ergebnisse',
    'search.clear': 'Filter löschen',
    'search.filters': 'Filter',
    'search.category': 'Kategorie',
    'search.allCategories': 'Alle Kategorien',
    'search.rating': 'Bewertung',
    'search.anyRating': 'Jede Bewertung',
    'search.dateRange': 'Zeitraum',
    'search.anyTime': 'Jederzeit',
    'search.today': 'Heute',
    'search.thisWeek': 'Diese Woche',
    'search.thisMonth': 'Diesen Monat',
    'search.thisYear': 'Dieses Jahr',
    'search.model': 'KI-Modell',
    'search.anyModel': 'Jedes Modell',
    'search.mockModel': 'Mock-Modell',
    'search.sortBy': 'Sortieren nach',
    'search.sortDate': 'Datum',
    'search.sortTitle': 'Titel',
    'search.sortRating': 'Bewertung',
    'search.sortCategory': 'Kategorie',

    // Advanced Stats
    'stats.advanced': 'Erweiterte Statistiken',
    'stats.detailedAnalysis': 'Detaillierte Analyse deiner kreativen Ideen',
    'stats.productivityScore': 'Produktivitätswert',
    'stats.creativityTrend': 'Kreativitätstrend',
    'stats.weeklyProgress': 'Wöchentlicher Fortschritt',
    'stats.categoryDistribution': 'Kategorienverteilung',
    'stats.categoryDescription': 'Wie deine Ideen verteilt sind',
    'stats.insights': 'Einblicke und Empfehlungen',
    'stats.insightsDescription': 'Personalisierte Analyse deines kreativen Verhaltens',
    'stats.peakHours': 'Spitzenzeiten',
    'stats.favoriteCategories': 'Lieblingskategorien',
    'stats.modelPerformance': 'Modell-Performance',
    'stats.noModelLoaded': 'Kein Modell geladen',
    'stats.error': 'Fehler beim Laden',
    'stats.noData': 'Keine Daten verfügbar',
    'stats.retry': 'Wiederholen',

    // Bulk Actions
    'bulk.selected': 'ausgewählt',
    'bulk.actions': 'Gruppenaktionen',
    'bulk.description': 'Verwalte mehrere Ideen gleichzeitig',
    'bulk.export': 'Exportieren',
    'bulk.rate': 'Bewerten',
    'bulk.archive': 'Archivieren',
    'bulk.copy': 'Kopieren',
    'bulk.delete': 'Löschen',
    'bulk.items': 'Elemente',
    'bulk.rateTitle': 'Ausgewählte Ideen bewerten',
    'bulk.rateDescription': 'Weise allen ausgewählten Ideen eine Bewertung zu',
    'bulk.deleteTitle': 'Ausgewählte Ideen löschen',
    'bulk.deleteDescription': 'Bist du sicher, dass du die ausgewählten Ideen löschen möchtest?',
    'bulk.confirmDelete': 'Endgültig löschen',

    // Templates
    'templates.title': 'Ideen-Vorlagen',
    'templates.description': 'Verwende strukturierte Vorlagen um deine Ideen zu organisieren',
    'templates.sections': 'Abschnitte',
    'templates.fillSections': 'Fülle die Abschnitte der Vorlage aus um deine Idee zu erstellen',
    'templates.useTemplate': 'Vorlage verwenden',
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
    
    // New prompt features
    'prompts.predefined': 'Prompts Prédéfinis',
    'prompts.selectPrompt': 'Sélectionner un Prompt',
    'prompts.allCategories': 'Toutes les Catégories',
    
    // Advanced Prompt Settings
    'advanced.settings': 'Paramètres Avancés',
    'advanced.basicSettings': 'Paramètres de Base',
    'advanced.defaultCategory': 'Catégorie par Défaut',
    'advanced.defaultCreativity': 'Niveau de Créativité par Défaut',
    'advanced.preferredTags': 'Tags Préférés',
    'advanced.addTag': 'Ajouter Tag',
    'advanced.promptSuggestions': 'Suggestions de Prompts',
    'advanced.addCustomPrompt': 'Ajouter Prompt Personnalisé',
    'advanced.promptText': 'Texte du Prompt',
    'advanced.saveSettings': 'Sauvegarder Paramètres',
    'advanced.close': 'Fermer',

    // Categories
    'categories.general': 'Général',
    'categories.business': 'Business',
    'categories.technology': 'Technologie',
    'categories.art': 'Art',
    'categories.science': 'Science',
    'categories.health': 'Santé',
    'categories.education': 'Éducation',
    'categories.entertainment': 'Divertissement',

    // Prompt predefiniti
    'prompts.1.text': 'Développez une solution innovante pour le transport durable urbain',
    'prompts.1.tags': 'durabilité,transport,villes,innovation',
    'prompts.2.text': 'Concevez un projet artistique qui connecte technologie et nature',
    'prompts.2.tags': 'art,technologie,nature,connexion',
    'prompts.3.text': 'Créez un modèle d\'affaires pour une app qui renforce les communautés locales',
    'prompts.3.tags': 'app,communauté,local,business',
    'prompts.4.text': 'Développez un concept éducatif pour la résolution créative de problèmes',
    'prompts.4.tags': 'éducation,créativité,résolution-problèmes,apprentissage',
    'prompts.5.text': 'Concevez un programme de bien-être pour nomades numériques',
    'prompts.5.tags': 'bien-être,numérique,nomades,santé',
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
    
    // New prompt features
    'prompts.predefined': 'Prompts Predefinidos',
    'prompts.selectPrompt': 'Seleccionar un Prompt',
    'prompts.allCategories': 'Todas las Categorías',
    
    // Advanced Prompt Settings
    'advanced.settings': 'Configuración Avanzada',
    'advanced.basicSettings': 'Configuración Básica',
    'advanced.defaultCategory': 'Categoría Predeterminada',
    'advanced.defaultCreativity': 'Nivel de Creatividad Predeterminado',
    'advanced.preferredTags': 'Tags Preferidos',
    'advanced.addTag': 'Agregar Tag',
    'advanced.promptSuggestions': 'Sugerencias de Prompts',
    'advanced.addCustomPrompt': 'Agregar Prompt Personalizado',
    'advanced.promptText': 'Texto del Prompt',
    'advanced.saveSettings': 'Guardar Configuración',
    'advanced.close': 'Cerrar',

    // Categories
    'categories.general': 'General',
    'categories.business': 'Negocios',
    'categories.technology': 'Tecnología',
    'categories.art': 'Arte',
    'categories.science': 'Ciencia',
    'categories.health': 'Salud',
    'categories.education': 'Educación',
    'categories.entertainment': 'Entretenimiento',

    // Prompt predefiniti
    'prompts.1.text': 'Desarrolla una solución innovadora para transporte sostenible urbano',
    'prompts.1.tags': 'sostenibilidad,transporte,ciudades,innovación',
    'prompts.2.text': 'Diseña un proyecto artístico que conecte tecnología y naturaleza',
    'prompts.2.tags': 'arte,tecnología,naturaleza,conexión',
    'prompts.3.text': 'Crea un modelo de negocio para una app que fortalezca comunidades locales',
    'prompts.3.tags': 'app,comunidad,local,negocio',
    'prompts.4.text': 'Desarrolla un concepto educativo para resolución creativa de problemas',
    'prompts.4.tags': 'educación,creatividad,resolución-problemas,aprendizaje',
    'prompts.5.text': 'Diseña un programa de bienestar para nómadas digitales',
    'prompts.5.tags': 'bienestar,digital,nómadas,salud',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('it');

  useEffect(() => {
    // Carica la lingua salvata dal localStorage
    if (typeof window !== 'undefined') {
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
    }
  }, []); // Empty dependency array to run only once

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('creativeMuseLanguage', lang);
      // Aggiorna anche l'attributo lang del documento
      document.documentElement.lang = lang;
    }
  };

  const t = useCallback((key: string): string => {
    const translation = translations[language] as Record<string, string>;
    return translation[key] || key;
  }, [language]);

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
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
