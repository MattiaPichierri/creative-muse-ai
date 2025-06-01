'use client';

import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find((lang) => lang.code === language);

  const handleLanguageSelect = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center space-x-2"
        title="Select language"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline text-sm">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
        <span className="sm:hidden text-sm">{currentLanguage?.flag}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span>{lang.flag}</span>
                <span className="text-sm text-gray-800 dark:text-gray-200">{lang.name}</span>
              </div>
              {language === lang.code && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
      
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
