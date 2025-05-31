import type { Translation, Language } from '../types';

export const translations: Record<Language, Translation> = {
  de: {
    app: {
      title: "🎨 Creative Muse AI",
      subtitle: "Lass deine Kreativität durch KI-gestützte Ideengenerierung fließen"
    },
    controls: {
      language: "Sprache wechseln",
      darkMode: "Dark Mode umschalten",
      export: "Ideen exportieren",
      save: "Alle Ideen speichern"
    },
    form: {
      title: "💡 Neue Idee generieren",
      prompt: {
        label: "Dein Prompt oder Inspiration:",
        placeholder: "Beschreibe deine Idee, dein Problem oder deine Inspiration..."
      },
      category: {
        label: "Kategorie:"
      },
      suggestions: {
        label: "Oder wähle einen Vorschlag:",
        placeholder: "-- Prompt-Vorschläge --"
      },
      creativity: {
        label: "Kreativitätslevel (1-10):"
      },
      useLLM: "🤖 Echte KI verwenden (falls verfügbar)",
      useTyping: "⌨️ Typing Animation verwenden",
      generate: "🚀 Idee generieren",
      random: "🎲 Zufällige Idee entdecken"
    },
    categories: {
      general: "Allgemein",
      business: "Business & Startups",
      technology: "Technologie",
      art: "Kunst & Design",
      scifi: "Sci-Fi Story",
      music: "Musikprojekt",
      wellness: "Wellness & Gesundheit",
      apps: "App-Namen",
      solutions: "Alltagslösungen"
    },
    suggestions: {
      startup: "Nachhaltiges Startup",
      scifi: "Sci-Fi Story",
      tech: "Tech-Produkt",
      music: "Musik-Konzept",
      wellness: "Wellness-App",
      app: "App-Name",
      solution: "Alltagsproblem"
    },
    results: {
      title: "✨ Generierte Ideen",
      empty: "Noch keine Ideen generiert. Starte mit deinem ersten Prompt!"
    },
    stats: {
      totalIdeas: "Generierte Ideen",
      recentIdeas: "Heute generiert",
      averageRating: "Durchschnittsbewertung",
      categories: "Kategorien",
      llmIdeas: "KI-Ideen",
      mockIdeas: "Mock-Ideen"
    },
    messages: {
      generating: "Generiere...",
      ideaGenerated: "Idee erfolgreich generiert! 🎉",
      randomGenerated: "Zufällige Idee entdeckt! 🎲",
      ratingError: "Fehler beim Speichern der Bewertung",
      ratingSaved: "Bewertung gespeichert: {rating}/5 ⭐",
      darkModeOn: "Dark Mode aktiviert 🌙",
      darkModeOff: "Light Mode aktiviert ☀️",
      noIdeasExport: "Keine Ideen zum Exportieren vorhanden",
      exportSuccess: "{count} Ideen erfolgreich exportiert! 📥",
      exportMarkdown: "Ideen als Markdown exportiert! 📝",
      saveSuccess: "{count} Ideen lokal gespeichert! 💾",
      loadSuccess: "{count} gespeicherte Ideen geladen! 📂",
      backendConnected: "Verbindung zum Backend hergestellt! ✅",
      backendError: "Backend nicht erreichbar. Stelle sicher, dass der Server läuft.",
      languageChanged: "Sprache geändert zu: {language}",
      llmLoading: "KI-Modell wird geladen...",
      typingComplete: "Generierung abgeschlossen!",
      promptRequired: "Bitte gib einen Prompt ein"
    },
    export: {
      json: "📄 Als JSON exportieren",
      markdown: "📝 Als Markdown exportieren"
    },
    promptSuggestions: {
      startup: "Innovative Startup-Idee für nachhaltiges Leben",
      scifi: "Sci-Fi Geschichte über KI und Menschlichkeit",
      tech: "Produktidee für ein Tech-Startup",
      music: "Musikprojekt für entspannende Atmosphäre",
      wellness: "Wellness-App für mentale Gesundheit",
      app: "Kreativer Name für eine Social Media App",
      solution: "Lösung für ein alltägliches Problem"
    },
    badges: {
      llm: "KI",
      mock: "Mock",
      random: "Zufall"
    },
    navigation: {
      home: "Start",
      ideas: "Ideen",
      stats: "Statistiken",
      about: "Über"
    },
    pages: {
      ideaDetail: {
        title: "Idee Details",
        backToList: "Zurück zur Liste",
        generatedOn: "Generiert am",
        rateIdea: "Idee bewerten",
        editIdea: "Idee bearbeiten",
        deleteIdea: "Idee löschen",
        shareIdea: "Idee teilen"
      },
      ideaList: {
        title: "Alle Ideen",
        filterBy: "Filtern nach",
        sortBy: "Sortieren nach",
        newest: "Neueste",
        oldest: "Älteste",
        highestRated: "Beste Bewertung",
        lowestRated: "Niedrigste Bewertung",
        noIdeas: "Keine Ideen gefunden"
      },
      about: {
        title: "Über Creative Muse AI",
        description: "Eine KI-gestützte Plattform für kreative Ideengenerierung",
        features: "Funktionen",
        technology: "Technologie"
      }
    }
  },
  en: {
    app: {
      title: "🎨 Creative Muse AI",
      subtitle: "Let your creativity flow through AI-powered idea generation"
    },
    controls: {
      language: "Switch language",
      darkMode: "Toggle dark mode",
      export: "Export ideas",
      save: "Save all ideas"
    },
    form: {
      title: "💡 Generate New Idea",
      prompt: {
        label: "Your prompt or inspiration:",
        placeholder: "Describe your idea, problem, or inspiration..."
      },
      category: {
        label: "Category:"
      },
      suggestions: {
        label: "Or choose a suggestion:",
        placeholder: "-- Prompt Suggestions --"
      },
      creativity: {
        label: "Creativity Level (1-10):"
      },
      useLLM: "🤖 Use real AI (if available)",
      useTyping: "⌨️ Use typing animation",
      generate: "🚀 Generate Idea",
      random: "🎲 Discover Random Idea"
    },
    categories: {
      general: "General",
      business: "Business & Startups",
      technology: "Technology",
      art: "Art & Design",
      scifi: "Sci-Fi Story",
      music: "Music Project",
      wellness: "Wellness & Health",
      apps: "App Names",
      solutions: "Daily Solutions"
    },
    suggestions: {
      startup: "Sustainable Startup",
      scifi: "Sci-Fi Story",
      tech: "Tech Product",
      music: "Music Concept",
      wellness: "Wellness App",
      app: "App Name",
      solution: "Daily Problem"
    },
    results: {
      title: "✨ Generated Ideas",
      empty: "No ideas generated yet. Start with your first prompt!"
    },
    stats: {
      totalIdeas: "Generated Ideas",
      recentIdeas: "Generated Today",
      averageRating: "Average Rating",
      categories: "Categories",
      llmIdeas: "AI Ideas",
      mockIdeas: "Mock Ideas"
    },
    messages: {
      generating: "Generating...",
      ideaGenerated: "Idea successfully generated! 🎉",
      randomGenerated: "Random idea discovered! 🎲",
      ratingError: "Error saving rating",
      ratingSaved: "Rating saved: {rating}/5 ⭐",
      darkModeOn: "Dark mode activated 🌙",
      darkModeOff: "Light mode activated ☀️",
      noIdeasExport: "No ideas available for export",
      exportSuccess: "{count} ideas successfully exported! 📥",
      exportMarkdown: "Ideas exported as Markdown! 📝",
      saveSuccess: "{count} ideas saved locally! 💾",
      loadSuccess: "{count} saved ideas loaded! 📂",
      backendConnected: "Backend connection established! ✅",
      backendError: "Backend not reachable. Make sure the server is running.",
      languageChanged: "Language changed to: {language}",
      llmLoading: "AI model loading...",
      typingComplete: "Generation complete!",
      promptRequired: "Please enter a prompt"
    },
    export: {
      json: "📄 Export as JSON",
      markdown: "📝 Export as Markdown"
    },
    promptSuggestions: {
      startup: "Innovative startup idea for sustainable living",
      scifi: "Sci-Fi story about AI and humanity",
      tech: "Product idea for a tech startup",
      music: "Music project for relaxing atmosphere",
      wellness: "Wellness app for mental health",
      app: "Creative name for a social media app",
      solution: "Solution for an everyday problem"
    },
    badges: {
      llm: "AI",
      mock: "Mock",
      random: "Random"
    },
    navigation: {
      home: "Home",
      ideas: "Ideas",
      stats: "Statistics",
      about: "About"
    },
    pages: {
      ideaDetail: {
        title: "Idea Details",
        backToList: "Back to List",
        generatedOn: "Generated on",
        rateIdea: "Rate Idea",
        editIdea: "Edit Idea",
        deleteIdea: "Delete Idea",
        shareIdea: "Share Idea"
      },
      ideaList: {
        title: "All Ideas",
        filterBy: "Filter by",
        sortBy: "Sort by",
        newest: "Newest",
        oldest: "Oldest",
        highestRated: "Highest Rated",
        lowestRated: "Lowest Rated",
        noIdeas: "No ideas found"
      },
      about: {
        title: "About Creative Muse AI",
        description: "An AI-powered platform for creative idea generation",
        features: "Features",
        technology: "Technology"
      }
    }
  },
  it: {
    app: {
      title: "🎨 Creative Muse AI",
      subtitle: "Lascia fluire la tua creatività attraverso la generazione di idee basata sull'IA"
    },
    controls: {
      language: "Cambia lingua",
      darkMode: "Attiva/disattiva modalità scura",
      export: "Esporta idee",
      save: "Salva tutte le idee"
    },
    form: {
      title: "💡 Genera Nuova Idea",
      prompt: {
        label: "Il tuo prompt o ispirazione:",
        placeholder: "Descrivi la tua idea, problema o ispirazione..."
      },
      category: {
        label: "Categoria:"
      },
      suggestions: {
        label: "O scegli un suggerimento:",
        placeholder: "-- Suggerimenti Prompt --"
      },
      creativity: {
        label: "Livello di Creatività (1-10):"
      },
      useLLM: "🤖 Usa IA reale (se disponibile)",
      useTyping: "⌨️ Usa animazione digitazione",
      generate: "🚀 Genera Idea",
      random: "🎲 Scopri Idea Casuale"
    },
    categories: {
      general: "Generale",
      business: "Business & Startup",
      technology: "Tecnologia",
      art: "Arte & Design",
      scifi: "Storia Sci-Fi",
      music: "Progetto Musicale",
      wellness: "Benessere & Salute",
      apps: "Nomi App",
      solutions: "Soluzioni Quotidiane"
    },
    suggestions: {
      startup: "Startup Sostenibile",
      scifi: "Storia Sci-Fi",
      tech: "Prodotto Tech",
      music: "Concetto Musicale",
      wellness: "App Benessere",
      app: "Nome App",
      solution: "Problema Quotidiano"
    },
    results: {
      title: "✨ Idee Generate",
      empty: "Nessuna idea generata ancora. Inizia con il tuo primo prompt!"
    },
    stats: {
      totalIdeas: "Idee Generate",
      recentIdeas: "Generate Oggi",
      averageRating: "Valutazione Media",
      categories: "Categorie",
      llmIdeas: "Idee IA",
      mockIdeas: "Idee Mock"
    },
    messages: {
      generating: "Generando...",
      ideaGenerated: "Idea generata con successo! 🎉",
      randomGenerated: "Idea casuale scoperta! 🎲",
      ratingError: "Errore nel salvare la valutazione",
      ratingSaved: "Valutazione salvata: {rating}/5 ⭐",
      darkModeOn: "Modalità scura attivata 🌙",
      darkModeOff: "Modalità chiara attivata ☀️",
      noIdeasExport: "Nessuna idea disponibile per l'esportazione",
      exportSuccess: "{count} idee esportate con successo! 📥",
      exportMarkdown: "Idee esportate come Markdown! 📝",
      saveSuccess: "{count} idee salvate localmente! 💾",
      loadSuccess: "{count} idee salvate caricate! 📂",
      backendConnected: "Connessione al backend stabilita! ✅",
      backendError: "Backend non raggiungibile. Assicurati che il server sia in esecuzione.",
      languageChanged: "Lingua cambiata in: {language}",
      llmLoading: "Modello IA in caricamento...",
      typingComplete: "Generazione completata!",
      promptRequired: "Inserisci un prompt"
    },
    export: {
      json: "📄 Esporta come JSON",
      markdown: "📝 Esporta come Markdown"
    },
    promptSuggestions: {
      startup: "Idea innovativa di startup per la vita sostenibile",
      scifi: "Storia di fantascienza su IA e umanità",
      tech: "Idea di prodotto per una startup tecnologica",
      music: "Progetto musicale per atmosfera rilassante",
      wellness: "App per il benessere e la salute mentale",
      app: "Nome creativo per un'app di social media",
      solution: "Soluzione per un problema quotidiano"
    },
    badges: {
      llm: "IA",
      mock: "Mock",
      random: "Casuale"
    },
    navigation: {
      home: "Home",
      ideas: "Idee",
      stats: "Statistiche",
      about: "Info"
    },
    pages: {
      ideaDetail: {
        title: "Dettagli Idea",
        backToList: "Torna alla Lista",
        generatedOn: "Generato il",
        rateIdea: "Valuta Idea",
        editIdea: "Modifica Idea",
        deleteIdea: "Elimina Idea",
        shareIdea: "Condividi Idea"
      },
      ideaList: {
        title: "Tutte le Idee",
        filterBy: "Filtra per",
        sortBy: "Ordina per",
        newest: "Più Recenti",
        oldest: "Più Vecchie",
        highestRated: "Più Votate",
        lowestRated: "Meno Votate",
        noIdeas: "Nessuna idea trovata"
      },
      about: {
        title: "Su Creative Muse AI",
        description: "Una piattaforma basata su IA per la generazione di idee creative",
        features: "Caratteristiche",
        technology: "Tecnologia"
      }
    }
  }
};

export const languageNames: Record<Language, string> = {
  de: 'Deutsch',
  en: 'English',
  it: 'Italiano'
};