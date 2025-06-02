'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DesktopNavigation, MobileNavigation } from '@/components/Navigation';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ModelSelector } from '@/components/ModelSelector';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StreamingIdeaGenerator } from '@/components/StreamingIdeaGenerator';
import { BatchIdeaGenerator } from '@/components/BatchIdeaGenerator';
import AuthNavigation from '@/components/AuthNavigation';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIdeasStorage } from '@/hooks/useLocalStorage';
import { apiService, type Idea } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  Brain,
  Radio,
  Zap,
  TrendingUp,
  Users,
  Clock,
  Sparkles,
  ArrowLeft,
  Settings,
  BarChart3,
} from 'lucide-react';

export default function StreamingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [localIdeas, setLocalIdeas] = useIdeasStorage();
  const [ideas, setIdeas] = useState<Idea[]>(localIdeas || []);
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState<{
    total_ideas: number;
    streaming_stats?: { active_sessions: number };
    batch_stats?: { total_batch_requests: number };
    model_stats?: { loaded_models: number };
  } | null>(null);
  const [modelUsageStats, setModelUsageStats] = useState<{
    usage_stats: Record<
      string,
      {
        usage_count: number;
        average_time: number;
        last_used: string;
        priority_score: number;
      }
    >;
  } | null>(null);

  // Redirect zur Landing Page wenn nicht authentifiziert
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/landing');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    setIsMounted(true);
    loadStats();
    loadModelUsageStats();
  }, []);

  // Loading state
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

  // Nicht authentifiziert
  if (!user) {
    return null;
  }

  // Hydration-Schutz
  if (!isMounted) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const loadStats = async () => {
    try {
      const response = await apiService.getStats();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadModelUsageStats = async () => {
    try {
      const response = await apiService.getModelUsageStats();
      if (response.data) {
        setModelUsageStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load model usage stats:', error);
    }
  };

  const handleIdeaGenerated = (idea: Idea) => {
    const newIdeas = [idea, ...ideas];
    setIdeas(newIdeas);
    setLocalIdeas(newIdeas);
    // Aktualisiere Statistiken
    loadStats();
    loadModelUsageStats();
  };

  const handleIdeasGenerated = (newIdeas: Idea[]) => {
    const allIdeas = [...newIdeas, ...ideas];
    setIdeas(allIdeas);
    setLocalIdeas(allIdeas);
    // Aktualisiere Statistiken
    loadStats();
    loadModelUsageStats();
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Zurück</span>
              </Button>

              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Radio className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">
                  Erweiterte Features
                </h1>
              </div>
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
                  className="bg-purple-100 text-purple-700"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Beta
                </Badge>
                <ModelSelector />
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            🚀 Erweiterte AI-Features
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Erleben Sie die Zukunft der Ideengenerierung mit Echtzeit-Streaming,
            Batch-Processing und intelligenten Vorladen-Funktionen.
          </p>
        </motion.section>

        {/* Stats Overview */}
        {stats && (
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="card-gradient">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {stats.total_ideas}
                  </div>
                  <div className="text-sm text-gray-600">Gesamte Ideen</div>
                </CardContent>
              </Card>

              <Card className="card-gradient">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Radio className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {stats.streaming_stats?.active_sessions || 0}
                  </div>
                  <div className="text-sm text-gray-600">Aktive Streams</div>
                </CardContent>
              </Card>

              <Card className="card-gradient">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {stats.batch_stats?.total_batch_requests || 0}
                  </div>
                  <div className="text-sm text-gray-600">Batch-Requests</div>
                </CardContent>
              </Card>

              <Card className="card-gradient">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Brain className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {stats.model_stats?.loaded_models || 0}
                  </div>
                  <div className="text-sm text-gray-600">Geladene Modelle</div>
                </CardContent>
              </Card>
            </div>
          </motion.section>
        )}

        {/* Feature Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Streaming Generator */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <StreamingIdeaGenerator onIdeaGenerated={handleIdeaGenerated} />
          </motion.div>

          {/* Batch Generator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <BatchIdeaGenerator onIdeasGenerated={handleIdeasGenerated} />
          </motion.div>
        </div>

        {/* Model Usage Stats */}
        {modelUsageStats && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="card-gradient">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <CardTitle>📈 Modell-Nutzungsstatistiken</CardTitle>
                </div>
                <CardDescription>
                  Intelligente Vorladen-Empfehlungen basierend auf
                  Nutzungsmustern
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(modelUsageStats.usage_stats).map(
                    ([model, stats]) => (
                      <div
                        key={model}
                        className="bg-white rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800">{model}</h4>
                          <Badge variant="outline" className="text-xs">
                            Score: {stats.priority_score.toFixed(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{stats.usage_count} Nutzungen</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{stats.average_time.toFixed(1)}s Ø</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>
                              {new Date(stats.last_used).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Recent Ideas Preview */}
        {ideas.length > 0 && (
          <motion.section
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">
                🎯 Neueste Ideen
              </h3>
              <Button
                variant="outline"
                onClick={() => router.push('/ideas')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Alle anzeigen</span>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ideas.slice(0, 6).map((idea, index) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full card-gradient card-hover">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {idea.category}
                        </Badge>
                        {idea.generation_method.includes('streaming') && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-700"
                          >
                            <Radio className="h-3 w-3 mr-1" />
                            Stream
                          </Badge>
                        )}
                        {idea.generation_method.includes('batch') && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-purple-100 text-purple-700"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Batch
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {idea.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                        {idea.content}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span>
                          {new Date(idea.created_at).toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          <Brain className="h-3 w-3 mr-1" />
                          {idea.model_used}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
