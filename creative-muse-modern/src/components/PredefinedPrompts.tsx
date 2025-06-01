'use client';

import { Button } from '@/components/ui/button';
import { Lightbulb, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useMemo } from 'react';

interface PredefinedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export function PredefinedPrompts({ onSelectPrompt }: PredefinedPromptsProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const predefinedPrompts = useMemo(() => [
    {
      category: t('prompts.startup'),
      prompt: t('prompts.startupDesc'),
    },
    {
      category: t('prompts.scifi'),
      prompt: t('prompts.scifiDesc'),
    },
    {
      category: t('prompts.tech'),
      prompt: t('prompts.techDesc'),
    },
    {
      category: t('prompts.music'),
      prompt: t('prompts.musicDesc'),
    },
    {
      category: t('prompts.wellness'),
      prompt: t('prompts.wellnessDesc'),
    },
    {
      category: t('prompts.appName'),
      prompt: t('prompts.appNameDesc'),
    },
    {
      category: t('prompts.everyday'),
      prompt: t('prompts.everydayDesc'),
    },
  ], [t]);

  const handleSelectPrompt = (prompt: string) => {
    onSelectPrompt(prompt);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Lightbulb className="h-4 w-4 mr-2" />
        {t('prompts.title')}
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>
      
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl z-[100] max-h-64 overflow-y-auto">
          {predefinedPrompts.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSelectPrompt(item.prompt)}
              className="w-full flex flex-col items-start p-3 hover:bg-blue-50 dark:hover:bg-gray-700 text-left border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-sm text-gray-800 dark:text-gray-100 mb-1">{item.category}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {item.prompt.length > 60 ? `${item.prompt.substring(0, 60)}...` : item.prompt}
              </div>
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
