'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Lightbulb,
  ChevronDown,
  Rocket,
  Palette,
  Code,
  Music,
  Heart,
  Smartphone,
  Wrench,
  BookOpen,
  Camera,
  Gamepad2,
  Utensils,
  Filter,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptConfig {
  id: string;
  category: string;
  title: string;
  prompt: string;
  icon: React.ReactNode;
  color: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags: string[];
  creativityLevel: number;
  targetCategory: string;
}

interface PredefinedPromptsProps {
  onSelectPrompt: (prompt: string, config?: Partial<PromptConfig>) => void;
}

export function PredefinedPrompts({ onSelectPrompt }: PredefinedPromptsProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const predefinedPrompts = useMemo(
    (): PromptConfig[] => [
      {
        id: 'startup-sustainability',
        category: 'business',
        title: t('prompts.startup'),
        prompt: t('prompts.startupDesc'),
        icon: <Rocket className="h-4 w-4" />,
        color: 'bg-blue-500',
        difficulty: 'intermediate',
        estimatedTime: '15-30 min',
        tags: ['business', 'sustainability', 'innovation'],
        creativityLevel: 7,
        targetCategory: 'business',
      },
      {
        id: 'scifi-story',
        category: 'entertainment',
        title: t('prompts.scifi'),
        prompt: t('prompts.scifiDesc'),
        icon: <BookOpen className="h-4 w-4" />,
        color: 'bg-purple-500',
        difficulty: 'advanced',
        estimatedTime: '30-60 min',
        tags: ['storytelling', 'future', 'technology'],
        creativityLevel: 9,
        targetCategory: 'entertainment',
      },
      {
        id: 'tech-product',
        category: 'technology',
        title: t('prompts.tech'),
        prompt: t('prompts.techDesc'),
        icon: <Code className="h-4 w-4" />,
        color: 'bg-green-500',
        difficulty: 'intermediate',
        estimatedTime: '20-40 min',
        tags: ['technology', 'product', 'innovation'],
        creativityLevel: 8,
        targetCategory: 'technology',
      },
      {
        id: 'music-concept',
        category: 'art',
        title: t('prompts.music'),
        prompt: t('prompts.musicDesc'),
        icon: <Music className="h-4 w-4" />,
        color: 'bg-pink-500',
        difficulty: 'beginner',
        estimatedTime: '10-20 min',
        tags: ['music', 'creativity', 'composition'],
        creativityLevel: 8,
        targetCategory: 'art',
      },
      {
        id: 'wellness-app',
        category: 'health',
        title: t('prompts.wellness'),
        prompt: t('prompts.wellnessDesc'),
        icon: <Heart className="h-4 w-4" />,
        color: 'bg-red-500',
        difficulty: 'intermediate',
        estimatedTime: '25-45 min',
        tags: ['health', 'wellness', 'app'],
        creativityLevel: 6,
        targetCategory: 'health',
      },
      {
        id: 'app-naming',
        category: 'business',
        title: t('prompts.appName'),
        prompt: t('prompts.appNameDesc'),
        icon: <Smartphone className="h-4 w-4" />,
        color: 'bg-indigo-500',
        difficulty: 'beginner',
        estimatedTime: '5-15 min',
        tags: ['naming', 'branding', 'mobile'],
        creativityLevel: 7,
        targetCategory: 'business',
      },
      {
        id: 'everyday-solution',
        category: 'general',
        title: t('prompts.everyday'),
        prompt: t('prompts.everydayDesc'),
        icon: <Wrench className="h-4 w-4" />,
        color: 'bg-orange-500',
        difficulty: 'beginner',
        estimatedTime: '10-25 min',
        tags: ['problem-solving', 'innovation', 'daily-life'],
        creativityLevel: 6,
        targetCategory: 'general',
      },
      // Neue Prompts
      {
        id: 'game-concept',
        category: 'entertainment',
        title: 'Game Concept',
        prompt:
          'Design an innovative video game concept that combines education with entertainment, targeting a specific age group.',
        icon: <Gamepad2 className="h-4 w-4" />,
        color: 'bg-cyan-500',
        difficulty: 'advanced',
        estimatedTime: '30-50 min',
        tags: ['gaming', 'education', 'entertainment'],
        creativityLevel: 9,
        targetCategory: 'entertainment',
      },
      {
        id: 'food-innovation',
        category: 'general',
        title: 'Food Innovation',
        prompt:
          'Create a revolutionary food product or dining experience that addresses modern dietary needs and sustainability concerns.',
        icon: <Utensils className="h-4 w-4" />,
        color: 'bg-yellow-500',
        difficulty: 'intermediate',
        estimatedTime: '20-35 min',
        tags: ['food', 'sustainability', 'innovation'],
        creativityLevel: 7,
        targetCategory: 'general',
      },
      {
        id: 'art-installation',
        category: 'art',
        title: 'Art Installation',
        prompt:
          'Design an interactive art installation that uses technology to create an immersive experience addressing social issues.',
        icon: <Palette className="h-4 w-4" />,
        color: 'bg-rose-500',
        difficulty: 'advanced',
        estimatedTime: '40-60 min',
        tags: ['art', 'technology', 'social-impact'],
        creativityLevel: 10,
        targetCategory: 'art',
      },
      {
        id: 'photography-project',
        category: 'art',
        title: 'Photography Project',
        prompt:
          'Conceptualize a photography project that tells a compelling story about your community or a global issue.',
        icon: <Camera className="h-4 w-4" />,
        color: 'bg-slate-500',
        difficulty: 'intermediate',
        estimatedTime: '25-40 min',
        tags: ['photography', 'storytelling', 'community'],
        creativityLevel: 8,
        targetCategory: 'art',
      },
    ],
    [t]
  );

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(predefinedPrompts.map((p) => p.category))];
    return cats;
  }, [predefinedPrompts]);

  const filteredPrompts = useMemo(() => {
    if (selectedCategory === 'all') return predefinedPrompts;
    return predefinedPrompts.filter((p) => p.category === selectedCategory);
  }, [predefinedPrompts, selectedCategory]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSelectPrompt = (config: PromptConfig) => {
    onSelectPrompt(config.prompt, config);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm"
      >
        <Lightbulb className="h-4 w-4" />
        <span>{t('prompts.predefined')}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="shadow-lg border-2 max-h-96 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  {t('prompts.selectPrompt')}
                </CardTitle>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-xs"
                    >
                      {category === 'all'
                        ? t('prompts.allCategories')
                        : t(`categories.${category}`)}
                    </Button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="max-h-64 overflow-y-auto">
                <div className="grid gap-3">
                  {filteredPrompts.map((config, index) => (
                    <motion.div
                      key={config.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSelectPrompt(config)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`p-1 rounded ${config.color} text-white`}
                          >
                            {config.icon}
                          </div>
                          <h4 className="font-medium text-sm">
                            {config.title}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge
                            className={getDifficultyColor(config.difficulty)}
                            variant="secondary"
                          >
                            {config.difficulty}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {config.prompt}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>⏱️ {config.estimatedTime}</span>
                        <span>🎨 {config.creativityLevel}/10</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {config.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
