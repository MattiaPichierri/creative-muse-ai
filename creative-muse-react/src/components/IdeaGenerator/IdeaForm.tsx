import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
      className="card glass-card hover-lift-lg"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-xl animate-glow"
        >
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </motion.div>
        <h2 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          {t.form.title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
          Lass deine Kreativität durch KI-gestützte Ideengenerierung fließen
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Prompt Input */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <label htmlFor="prompt" className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-4">
            {t.form.prompt.label}
          </label>
          <div className="relative group">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.form.prompt.placeholder}
              rows={5}
              className="form-input text-base leading-relaxed group-hover:shadow-lg transition-all duration-300"
              disabled={isGenerating}
              maxLength={500}
            />
            <div className="absolute bottom-4 right-4 text-sm text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-lg backdrop-blur-sm">
              {prompt.length}/500
            </div>
          </div>
        </motion.div>

        {/* Category Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div>
            <label htmlFor="category" className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-4">
              {t.form.category.label}
            </label>
            <div className="relative group">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="form-input text-base cursor-pointer group-hover:shadow-lg transition-all duration-300 appearance-none"
                disabled={isGenerating}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {t.categories[cat]}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Prompt Suggestions */}
          <div>
            <label htmlFor="suggestions" className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-4">
              {t.form.suggestions.label}
            </label>
            <div className="relative group">
              <select
                id="suggestions"
                onChange={(e) => e.target.value && fillPrompt(e.target.value)}
                className="form-input text-base cursor-pointer group-hover:shadow-lg transition-all duration-300 appearance-none"
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Creativity Level */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="card-glass p-8 hover-lift-lg"
        >
          <label htmlFor="creativity" className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-6">
            {t.form.creativity.label}
          </label>
          <div className="flex items-center space-x-8">
            <div className="flex-1">
              <input
                type="range"
                id="creativity"
                min="1"
                max="10"
                value={creativityLevel}
                onChange={(e) => setCreativityLevel(parseInt(e.target.value))}
                className="w-full h-4 bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-700 dark:to-blue-700 rounded-lg appearance-none cursor-pointer slider hover:shadow-lg transition-all duration-300"
                disabled={isGenerating}
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #3b82f6 ${creativityLevel * 10}%, #e5e7eb ${creativityLevel * 10}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400 mt-3">
                <span>Konservativ</span>
                <span>Kreativ</span>
                <span>Innovativ</span>
              </div>
            </div>
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400 min-w-[3rem] text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {creativityLevel}
            </div>
          </div>
        </motion.div>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="checkbox"
              id="useLLM"
              checked={useLLM}
              onChange={(e) => setUseLLM(e.target.checked)}
              className="sr-only"
              disabled={isGenerating}
            />
            <label
              htmlFor="useLLM"
              className={`flex items-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover-lift-lg ${
                useLLM
                  ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 shadow-lg'
                  : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 bg-white/50 dark:bg-gray-800/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl border-2 mr-4 flex items-center justify-center transition-all duration-300 ${
                useLLM ? 'border-purple-500 bg-purple-500 shadow-lg' : 'border-gray-300 dark:border-gray-600'
              }`}>
                {useLLM && (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <div className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center">
                  <span className="text-2xl mr-2">🤖</span>
                  {t.form.useLLM}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Echte KI verwenden</div>
              </div>
            </label>
          </motion.div>

          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="checkbox"
              id="useTyping"
              checked={useTyping}
              onChange={(e) => setUseTyping(e.target.checked)}
              className="sr-only"
              disabled={isGenerating}
            />
            <label
              htmlFor="useTyping"
              className={`flex items-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover-lift-lg ${
                useTyping
                  ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-lg'
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 bg-white/50 dark:bg-gray-800/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl border-2 mr-4 flex items-center justify-center transition-all duration-300 ${
                useTyping ? 'border-blue-500 bg-blue-500 shadow-lg' : 'border-gray-300 dark:border-gray-600'
              }`}>
                {useTyping && (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <div className="text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center">
                  <span className="text-2xl mr-2">⌨️</span>
                  {t.form.useTyping}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Typing-Animation</div>
              </div>
            </label>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="space-y-6"
        >
          <motion.button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary w-full text-lg py-6 rounded-2xl shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-7 h-7 mr-4 animate-spin" />
                <span className="text-xl font-bold">{t.messages.generating}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-7 h-7 mr-4 animate-pulse" />
                <span className="text-xl font-bold">{t.form.generate}</span>
              </>
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={handleRandomGenerate}
            disabled={isGenerating}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-secondary w-full text-lg py-6 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-600 hover:border-purple-500 dark:hover:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-7 h-7 mr-4 animate-spin" />
                <span className="text-xl font-bold">{t.messages.generating}</span>
              </>
            ) : (
              <>
                <Dice6 className="w-7 h-7 mr-4 animate-bounce" />
                <span className="text-xl font-bold">{t.form.random}</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default IdeaForm;
