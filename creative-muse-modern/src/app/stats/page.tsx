'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService, type Stats, type ModelInfo } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIdeasStorage } from '@/hooks/useLocalStorage';
import {
  BarChart3,
  Lightbulb,
  Star,
  ArrowLeft,
  Activity,
  Target,
  Zap,
  RefreshCw,
  AlertCircle,
  Loader2,
  Calendar,
  Hash,
} from 'lucide-react';
import Link from 'next/link';

export default function StatsPage() {
  const { t } = useLanguage();
  const [localIdeas] = useIdeasStorage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const calculateLocalStats = useCallback(() => {
    if (!localIdeas || !Array.isArray(localIdeas)) return;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentIdeas = localIdeas.filter(
      (idea) => new Date(idea.created_at) >= oneWeekAgo
    );

    const ratedIdeas = localIdeas.filter(
      (idea) => idea.rating && idea.rating > 0
    );
    const averageRating =
      ratedIdeas.length > 0
        ? ratedIdeas.reduce((sum, idea) => sum + (idea.rating || 0), 0) /
          ratedIdeas.length
        : 0;

    const categories = localIdeas.reduce(
      (acc, idea) => {
        acc[idea.category] = (acc[idea.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const llmIdeas = localIdeas.filter(
      (idea) =>
        idea.generation_method === 'llm' || idea.generation_method === 'mistral'
    ).length;

    const mockIdeas = localIdeas.filter(
      (idea) => idea.generation_method === 'mock'
    ).length;

    setStats({
      total_ideas: localIdeas.length,
      recent_ideas: recentIdeas.length,
      average_rating: averageRating,
      categories,
      llm_ideas: llmIdeas,
      mock_ideas: mockIdeas,
      model_stats: {
        total_models: 0,
        available_models: 0,
        loaded_models: 0,
        current_model: null,
        model_status: {},
        memory_usage: {}
      }
    });

    setLastUpdated(new Date());
    setIsLoading(false);
  }, [localIdeas]);

  useEffect(() => {
    loadStats();
  }, []);

  // Calcola statistiche dal localStorage se l'API fallisce
  useEffect(() => {
    if (error && localIdeas && Array.isArray(localIdeas)) {
      calculateLocalStats();
    }
  }, [error, localIdeas, calculateLocalStats]);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    const result = await apiService.getStats();

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setStats(result.data);
      setLastUpdated(new Date());
    }

    setIsLoading(false);
  };

  const refreshStats = () => {
    if (error) {
      calculateLocalStats();
    } else {
      loadStats();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">{t('stats.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('header.back')}
                </Button>
              </Link>
              <h1 className="text-2xl font-bold gradient-text">
                {t('stats.title')}
              </h1>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                {t('stats.updatedNow')}
              </Badge>
            </div>
            <Button
              onClick={refreshStats}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>{t('stats.refresh')}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-yellow-700 text-sm font-medium">
                  {t('common.error')}: {error}
                </p>
                <p className="text-yellow-600 text-xs">
                  Zeige lokale Statistiken aus dem Browser-Speicher
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {stats ? (
          <>
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="card-gradient card-hover shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('stats.totalIdeas')}
                    </CardTitle>
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.total_ideas}
                    </div>
                    <p className="text-xs text-slate-500">
                      {t('stats.totalDescription')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="card-gradient card-hover shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('stats.averageRating')}
                    </CardTitle>
                    <Star className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.average_rating.toFixed(1)}
                    </div>
                    <p className="text-xs text-slate-500">
                      {t('stats.ratingDescription')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="card-gradient card-hover shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('stats.recentActivity')}
                    </CardTitle>
                    <Activity className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {stats.recent_ideas}
                    </div>
                    <p className="text-xs text-slate-500">
                      {t('stats.recentDescription')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="card-gradient card-hover shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('stats.categories')}
                    </CardTitle>
                    <Hash className="h-4 w-4 text-indigo-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-indigo-600">
                      {Object.keys(stats.categories).length}
                    </div>
                    <p className="text-xs text-slate-500">
                      {t('stats.categoriesDescription')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Category Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <Card className="card-gradient shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <CardTitle>{t('stats.distribution')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {Object.keys(stats.categories).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(stats.categories)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, count], index) => {
                          const percentage = (count / stats.total_ideas) * 100;
                          return (
                            <motion.div
                              key={category}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 + index * 0.1 }}
                              className="flex items-center space-x-4"
                            >
                              <div className="w-24 text-sm font-medium text-slate-700">
                                {category}
                              </div>
                              <div className="flex-1">
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <motion.div
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{
                                      delay: 0.8 + index * 0.1,
                                      duration: 0.8,
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="w-16 text-sm text-slate-600 text-right">
                                {count} ({percentage.toFixed(1)}%)
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">
                      {t('stats.noCategories')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="card-gradient shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <CardTitle>{t('stats.quickActions')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                        <Zap className="h-4 w-4 mr-2" />
                        {t('stats.generateNew')}
                      </Button>
                    </Link>
                    <Link href="/ideas">
                      <Button variant="outline" className="w-full">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        {t('stats.viewAll')}
                      </Button>
                    </Link>
                    <Button
                      onClick={refreshStats}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {t('stats.refresh')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Last Updated */}
            <div className="text-center mt-8">
              <p className="text-sm text-slate-500 flex items-center justify-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {t('stats.updatedNow')}: {lastUpdated.toLocaleString()}
                </span>
              </p>
            </div>
          </>
        ) : (
          // Empty state
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="p-6 card-gradient rounded-2xl shadow-sm max-w-md mx-auto">
              <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">
                {t('stats.noStats')}
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                {t('stats.noStatsDescription')}
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                  {t('stats.startNow')}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
