'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { apiService, type Stats } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Star,
  Brain,
  Target,
  Clock,
  Award,
  Zap,
  RefreshCw,
} from 'lucide-react';

interface AdvancedStatsProps {
  onRefresh?: () => void;
}

interface ExtendedStats extends Stats {
  productivity_score: number;
  creativity_trend: 'up' | 'down' | 'stable';
  peak_hours: string[];
  favorite_categories: string[];
  weekly_progress: number;
}

export function AdvancedStats({ onRefresh }: AdvancedStatsProps) {
  const { t } = useLanguage();
  const [stats, setStats] = useState<ExtendedStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiService.getStats();
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        // Extend basic stats with calculated metrics
        const extendedStats: ExtendedStats = {
          ...result.data,
          productivity_score: calculateProductivityScore(result.data),
          creativity_trend: calculateCreativityTrend(result.data),
          peak_hours: ['14:00-16:00', '20:00-22:00'], // Mock data
          favorite_categories: Object.entries(result.data.categories)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([category]) => category),
          weekly_progress: Math.min(100, (result.data.recent_ideas / 7) * 100),
        };
        setStats(extendedStats);
      }
    } catch {
      setError('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProductivityScore = (stats: Stats): number => {
    const baseScore = Math.min(100, stats.total_ideas * 2);
    const ratingBonus = stats.average_rating * 10;
    const recentBonus = stats.recent_ideas * 5;
    return Math.min(100, baseScore + ratingBonus + recentBonus);
  };

  const calculateCreativityTrend = (stats: Stats): 'up' | 'down' | 'stable' => {
    // Mock calculation - in real app, this would compare with previous periods
    if (stats.recent_ideas > 5) return 'up';
    if (stats.recent_ideas < 2) return 'down';
    return 'stable';
  };

  useEffect(() => {
    loadStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    loadStats();
    onRefresh?.();
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">{t('stats.error')}</CardTitle>
          <CardDescription>{error || t('stats.noData')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('stats.retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProductivityLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { level: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const productivityLevel = getProductivityLevel(stats.productivity_score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('stats.advanced')}</h2>
          <p className="text-gray-600">{t('stats.detailedAnalysis')}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('stats.refresh')}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Productivity Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="card-gradient">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Target className="h-5 w-5 text-blue-600" />
                <Badge className={`${productivityLevel.bg} ${productivityLevel.color}`}>
                  {productivityLevel.level}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{stats.productivity_score}%</CardTitle>
              <CardDescription>{t('stats.productivityScore')}</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Creativity Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="card-gradient">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Brain className="h-5 w-5 text-purple-600" />
                {getTrendIcon(stats.creativity_trend)}
              </div>
              <CardTitle className="text-lg capitalize">{stats.creativity_trend}</CardTitle>
              <CardDescription>{t('stats.creativityTrend')}</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="card-gradient">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Calendar className="h-5 w-5 text-green-600" />
                <div className="text-right">
                  <div className="text-sm text-gray-500">{stats.recent_ideas}/7</div>
                </div>
              </div>
              <CardTitle className="text-2xl">{Math.round(stats.weekly_progress)}%</CardTitle>
              <CardDescription>{t('stats.weeklyProgress')}</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Average Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="card-gradient">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Star className="h-5 w-5 text-yellow-600" />
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= stats.average_rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <CardTitle className="text-2xl">{stats.average_rating.toFixed(1)}</CardTitle>
              <CardDescription>{t('stats.averageRating')}</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                {t('stats.categoryDistribution')}
              </CardTitle>
              <CardDescription>{t('stats.categoryDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.categories)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([category, count]) => {
                    const percentage = (count / stats.total_ideas) * 100;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{category}</span>
                          <span className="text-gray-500">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights & Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                {t('stats.insights')}
              </CardTitle>
              <CardDescription>{t('stats.insightsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Peak Hours */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">{t('stats.peakHours')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stats.peak_hours.map((hour) => (
                      <Badge key={hour} variant="secondary" className="bg-blue-100 text-blue-700">
                        {hour}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Favorite Categories */}
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Award className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-900">{t('stats.favoriteCategories')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stats.favorite_categories.map((category) => (
                      <Badge key={category} variant="secondary" className="bg-purple-100 text-purple-700">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Model Performance */}
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Brain className="h-4 w-4 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">{t('stats.modelPerformance')}</span>
                  </div>
                  <div className="text-sm text-green-700">
                    {stats.model_stats.current_model ? (
                      <span>Current: {stats.model_stats.current_model}</span>
                    ) : (
                      <span>{t('stats.noModelLoaded')}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}