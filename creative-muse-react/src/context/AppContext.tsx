import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Language, AppContextType, Idea, Stats } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('creative-muse-language');
    return (saved as Language) || 'de';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('creative-muse-dark-mode');
    return saved === 'true';
  });

  const [ideas, setIdeas] = useState<Idea[]>(() => {
    const saved = localStorage.getItem('creative-muse-ideas');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<Stats | null>(null);

  // Persist language changes
  useEffect(() => {
    localStorage.setItem('creative-muse-language', language);
    document.documentElement.lang = language;
  }, [language]);

  // Persist dark mode changes
  useEffect(() => {
    localStorage.setItem('creative-muse-dark-mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist ideas changes
  useEffect(() => {
    localStorage.setItem('creative-muse-ideas', JSON.stringify(ideas));
  }, [ideas]);

  const value: AppContextType = {
    language,
    setLanguage,
    darkMode,
    setDarkMode,
    ideas,
    setIdeas,
    stats,
    setStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { language } = useApp();
  
  const t = (key: string, params: Record<string, string | number> = {}): string => {
    // This will be implemented with the translations
    // For now, return the key as fallback
    let result = key;
    
    // Replace parameters
    Object.entries(params).forEach(([param, value]) => {
      result = result.replace(`{${param}}`, value.toString());
    });
    
    return result;
  };

  return { t, language };
};