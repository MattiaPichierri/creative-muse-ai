'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AdvancedPromptSettings } from '@/components/AdvancedPromptSettings';
import { ExportButton } from '@/components/ExportButton';
import { IdeaRating } from '@/components/IdeaRating';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ModelSelector } from '@/components/ModelSelector';
import { DesktopNavigation, MobileNavigation } from '@/components/Navigation';
import { PredefinedPrompts } from '@/components/PredefinedPrompts';
import { ThemeToggle } from '@/components/ThemeToggle';
import AuthNavigation from '@/components/AuthNavigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIdeasStorage } from '@/hooks/useLocalStorage';
import { apiService, type Idea } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Brain,
  Lightbulb,
  Plus,
  Shuffle,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface AdvancedSettings {
  defaultCategory: string;
  defaultCreativityLevel: number;
  enableAutoSuggestions: boolean;
  maxSuggestions: number;
  preferredTags: string[];
  customPrompts: Array<{
    id: string;
    text: string;
    category: string;
    creativityLevel: number;
    tags: string[];
  }>;
}

export default function Home() {
  const { t, language } = useLanguage();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [localIdeas, setLocalIdeas] = useIdeasStorage();
  const [ideas, setIdeas] = useState<Idea[]>(localIdeas || []);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    defaultCategory: 'general',
    defaultCreativityLevel: 5,
    enableAutoSuggestions: true,
    maxSuggestions: 5,
    preferredTags: [],
    customPrompts: []
  });

  // Reindirizza alla landing page se l'utente non è autenticato
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/landing');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mostra loading se sta verificando l'autenticazione
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  // Non mostrare nulla se l'utente non è autenticato (verrà reindirizzato)
  if (!user) {
    return null;
  }

  // Verhindere Hydration-Mismatch für framer-motion
  if (!isMounted) {
    return (
      <div className="min-h-screen gradient-bg">
        <header className="border-b glass sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">
                  {t('header.title')}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <DesktopNavigation />
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700"
                  >
                    {t('header.aiPowered')}
                  </Badge>
                  <ModelSelector />
                  <ExportButton ideas={ideas} />
                  <LanguageSelector />
                  <ThemeToggle />
                </div>
                <AuthNavigation />
                <MobileNavigation />
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <section className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 gradient-text">
              {t('home.title')}
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              {t('home.subtitle')}
            </p>
          </section>
        </main>
      </div>
    );
  }

  const generateRandomIdea = async () => {
    setIsGenerating(true);
    setError(null);

    const result = await apiService.generateRandomIdea(undefined, language);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      const newIdeas = [result.data!, ...ideas];
      setIdeas(newIdeas);
      setLocalIdeas(newIdeas);
    }

    setIsGenerating(false);
  };

  const generateCustomIdea = async () => {
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    const ideaRequest = {
      prompt: customPrompt,
      category: advancedSettings.defaultCategory,
      creativity_level: advancedSettings.defaultCreativityLevel,
      language: language,
    };

    const result = await apiService.generateCustomIdea(ideaRequest);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      const newIdeas = [result.data!, ...ideas];
      setIdeas(newIdeas);
      setLocalIdeas(newIdeas);
      setCustomPrompt('');
    }

    setIsGenerating(false);
  };

  const handleAdvancedSettingsChange = (settings: AdvancedSettings) => {
    setAdvancedSettings(settings);
  };

  const handlePromptSelect = (prompt: string, category: string, creativityLevel: number) => {
    setCustomPrompt(prompt);
    // Aggiorna le impostazioni per usare la categoria e il livello di creatività selezionati
    setAdvancedSettings(prev => ({
      ...prev,
      defaultCategory: category,
      defaultCreativityLevel: creativityLevel
    }));
  };

  const handleRatingChange = (ideaId: string, newRating: number) => {
    const updatedIdeas = ideas.map((idea) =>
      idea.id === ideaId ? { ...idea, rating: newRating } : idea
    );
    setIdeas(updatedIdeas);
    setLocalIdeas(updatedIdeas);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">
                {t('header.title')}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <DesktopNavigation />
              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  {t('header.aiPowered')}
                </Badge>
                <ModelSelector />
                <ExportButton ideas={ideas} />
                <LanguageSelector />
                <ThemeToggle />
              </div>
              <AuthNavigation />
              <MobileNavigation />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.section
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4 gradient-text">
            {t('home.title')}
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
        </motion.section>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Random Idea Generator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full card-gradient card-hover shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shuffle className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-xl">
                    {t('home.randomIdea')}
                  </CardTitle>
                </div>
                <CardDescription>{t('home.randomDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={generateRandomIdea}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white btn-hover shadow-glow"
                  size="lg"
                >
                  {isGenerating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                    </motion.div>
                  ) : (
                    <Zap className="h-5 w-5 mr-2" />
                  )}
                  {isGenerating ? t('home.generating') : t('home.generateIdea')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Custom Prompt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full card-gradient card-hover shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Plus className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-xl">
                    {t('home.customIdea')}
                  </CardTitle>
                </div>
                <CardDescription>{t('home.customDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center mb-2 gap-2">
                  <PredefinedPrompts onSelectPrompt={setCustomPrompt} />
                  <AdvancedPromptSettings
                    onSettingsChange={handleAdvancedSettingsChange}
                    onPromptSelect={handlePromptSelect}
                  />
                </div>
                <Textarea
                  placeholder={t('home.customPlaceholder')}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="min-h-[100px] border-purple-200 focus:border-purple-400"
                />
                <Button
                  onClick={generateCustomIdea}
                  disabled={isGenerating || !customPrompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white btn-hover shadow-glow"
                  size="lg"
                >
                  {isGenerating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                    </motion.div>
                  ) : (
                    <ArrowRight className="h-5 w-5 mr-2" />
                  )}
                  {isGenerating ? t('home.generating') : t('home.developIdea')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Ideas Grid */}
        {ideas.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">
                {t('home.yourIdeas')}
              </h3>
              {ideas.length > 3 && (
                <a
                  href="/ideas"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {t('home.viewAll')}
                </a>
              )}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ideas.slice(0, 6).map((idea, index) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full card-gradient card-hover shadow-md">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Lightbulb className="h-5 w-5 text-yellow-500" />
                          <Badge variant="outline" className="text-xs">
                            {idea.category}
                          </Badge>
                          {idea.model_used && idea.model_used !== 'mock' && (
                            <Badge variant="secondary" className="text-xs">
                              <Brain className="h-3 w-3 mr-1" />
                              {idea.model_used}
                            </Badge>
                          )}
                        </div>
                        {idea.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-slate-600">
                              {idea.rating}
                            </span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {idea.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {idea.content}
                      </p>

                      {/* Rating Component */}
                      <div className="pt-2 border-t border-slate-100">
                        <IdeaRating
                          ideaId={idea.id}
                          currentRating={idea.rating || 0}
                          onRatingChange={(rating) =>
                            handleRatingChange(idea.id, rating)
                          }
                        />
                      </div>

                      <div className="text-xs text-slate-400">
                        {new Date(idea.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty State */}
        {ideas.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="p-6 card-gradient rounded-2xl shadow-sm max-w-md mx-auto">
              <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">
                {t('home.startGenerating')}
              </h3>
              <p className="text-slate-500 text-sm">
                {t('home.startDescription')}
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
