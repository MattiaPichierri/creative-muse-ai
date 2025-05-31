export interface Idea {
  id: string;
  title: string;
  content: string;
  category: string;
  rating?: number;
  generation_method: 'llm' | 'mock' | 'random';
  language: string;
  created_at: string;
}

export interface IdeaRequest {
  prompt: string;
  category?: string;
  creativity_level?: number;
  language?: string;
  use_llm?: boolean;
}

export interface RandomIdeaRequest {
  category?: string;
  language?: string;
}

export interface IdeaRating {
  rating: number;
}

export interface Stats {
  total_ideas: number;
  recent_ideas: number;
  average_rating: number;
  categories: Record<string, number>;
  llm_ideas: number;
  mock_ideas: number;
}

export interface StreamingData {
  type: 'title_start' | 'title_char' | 'title_complete' | 'content_start' | 'content_char' | 'complete' | 'error';
  char?: string;
  idea?: Idea;
  message?: string;
}

export type Language = 'de' | 'en' | 'it';

export type Category = 'general' | 'business' | 'technology' | 'art' | 'scifi' | 'music' | 'wellness' | 'apps' | 'solutions';

export interface Translation {
  app: {
    title: string;
    subtitle: string;
  };
  controls: {
    language: string;
    darkMode: string;
    export: string;
    save: string;
  };
  form: {
    title: string;
    prompt: {
      label: string;
      placeholder: string;
    };
    category: {
      label: string;
    };
    suggestions: {
      label: string;
      placeholder: string;
    };
    creativity: {
      label: string;
    };
    useLLM: string;
    useTyping: string;
    generate: string;
    random: string;
  };
  categories: Record<Category, string>;
  suggestions: {
    startup: string;
    scifi: string;
    tech: string;
    music: string;
    wellness: string;
    app: string;
    solution: string;
  };
  results: {
    title: string;
    empty: string;
  };
  stats: {
    totalIdeas: string;
    recentIdeas: string;
    averageRating: string;
    categories: string;
    llmIdeas: string;
    mockIdeas: string;
  };
  messages: {
    generating: string;
    ideaGenerated: string;
    randomGenerated: string;
    ratingError: string;
    ratingSaved: string;
    darkModeOn: string;
    darkModeOff: string;
    noIdeasExport: string;
    exportSuccess: string;
    exportMarkdown: string;
    saveSuccess: string;
    loadSuccess: string;
    backendConnected: string;
    backendError: string;
    languageChanged: string;
    llmLoading: string;
    typingComplete: string;
    promptRequired: string;
  };
  export: {
    json: string;
    markdown: string;
  };
  promptSuggestions: {
    startup: string;
    scifi: string;
    tech: string;
    music: string;
    wellness: string;
    app: string;
    solution: string;
  };
  badges: {
    llm: string;
    mock: string;
    random: string;
  };
  navigation: {
    home: string;
    ideas: string;
    stats: string;
    about: string;
  };
  pages: {
    ideaDetail: {
      title: string;
      backToList: string;
      generatedOn: string;
      rateIdea: string;
      editIdea: string;
      deleteIdea: string;
      shareIdea: string;
    };
    ideaList: {
      title: string;
      filterBy: string;
      sortBy: string;
      newest: string;
      oldest: string;
      highestRated: string;
      lowestRated: string;
      noIdeas: string;
    };
    about: {
      title: string;
      description: string;
      features: string;
      technology: string;
    };
  };
}

export interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  ideas: Idea[];
  setIdeas: (ideas: Idea[]) => void;
  stats: Stats | null;
  setStats: (stats: Stats) => void;
}