import React, { useState } from 'react';
import { Sparkles, Dice6, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import type { Category, IdeaRequest, RandomIdeaRequest } from '../../types';

interface IdeaFormProps {
  onGenerate: (request: IdeaRequest) => Promise<void>;
  onGenerateRandom: (request: RandomIdeaRequest) => Promise<void>;
  isGenerating: boolean;
}

const IdeaForm: React.FC<IdeaFormProps> = ({ onGenerate, onGenerateRandom, isGenerating }) => {
  const { language } = useApp();
  const t = translations[language];

  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<Category>('general');
  const [creativityLevel, setCreativityLevel] = useState(5);
  const [useLLM, setUseLLM] = useState(true);
  const [useTyping, setUseTyping] = useState(false);

  const categories: Category[] = [
    'general', 'business', 'technology', 'art', 'scifi', 
    'music', 'wellness', 'apps', 'solutions'
  ];

  const promptSuggestions = [
    { key: 'startup', value: t.promptSuggestions.startup },
    { key: 'scifi', value: t.promptSuggestions.scifi },
    { key: 'tech', value: t.promptSuggestions.tech },
    { key: 'music', value: t.promptSuggestions.music },
    { key: 'wellness', value: t.promptSuggestions.wellness },
    { key: 'app', value: t.promptSuggestions.app },
    { key: 'solution', value: t.promptSuggestions.solution },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      alert(t.messages.promptRequired);
      return;
    }

    const request: IdeaRequest = {
      prompt: prompt.trim(),
      category,
      creativity_level: creativityLevel,
      language,
      use_llm: useLLM,
    };

    await onGenerate(request);
  };

  const handleRandomGenerate = async () => {
    const request: RandomIdeaRequest = {
      category: category === 'general' ? undefined : category,
      language,
    };

    await onGenerateRandom(request);
  };

  const fillPrompt = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
        {t.form.title}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Prompt Input */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.form.prompt.label}
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.form.prompt.placeholder}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
            disabled={isGenerating}
          />
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.form.category.label}
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
            disabled={isGenerating}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {t.categories[cat]}
              </option>
            ))}
          </select>
        </div>

        {/* Prompt Suggestions */}
        <div>
          <label htmlFor="suggestions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.form.suggestions.label}
          </label>
          <select
            id="suggestions"
            onChange={(e) => e.target.value && fillPrompt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
            disabled={isGenerating}
            defaultValue=""
          >
            <option value="">{t.form.suggestions.placeholder}</option>
            {promptSuggestions.map((suggestion) => (
              <option key={suggestion.key} value={suggestion.value}>
                {t.suggestions[suggestion.key as keyof typeof t.suggestions]}
              </option>
            ))}
          </select>
        </div>

        {/* Creativity Level */}
        <div>
          <label htmlFor="creativity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.form.creativity.label}
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              id="creativity"
              min="1"
              max="10"
              value={creativityLevel}
              onChange={(e) => setCreativityLevel(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              disabled={isGenerating}
            />
            <span className="text-lg font-semibold text-purple-600 dark:text-purple-400 min-w-[2rem] text-center">
              {creativityLevel}
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useLLM"
              checked={useLLM}
              onChange={(e) => setUseLLM(e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              disabled={isGenerating}
            />
            <label htmlFor="useLLM" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {t.form.useLLM}
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="useTyping"
              checked={useTyping}
              onChange={(e) => setUseTyping(e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              disabled={isGenerating}
            />
            <label htmlFor="useTyping" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {t.form.useTyping}
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t.messages.generating}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {t.form.generate}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleRandomGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t.messages.generating}
              </>
            ) : (
              <>
                <Dice6 className="w-5 h-5 mr-2" />
                {t.form.random}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IdeaForm;