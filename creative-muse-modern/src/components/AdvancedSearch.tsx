'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Search,
  Filter,
  X,
  Calendar,
  Star,
  Brain,
  Tag,
  SortAsc,
  SortDesc,
} from 'lucide-react';

export interface SearchFilters {
  query: string;
  category: string;
  rating: string;
  dateRange: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  modelUsed: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  totalResults: number;
}

export function AdvancedSearch({
  onSearch,
  onClear,
  totalResults,
}: AdvancedSearchProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    rating: '',
    dateRange: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    modelUsed: '',
  });

  const categories = [
    'general',
    'business',
    'technology',
    'art',
    'science',
    'health',
    'education',
    'entertainment',
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleClear = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      category: '',
      rating: '',
      dateRange: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      modelUsed: '',
    };
    setFilters(clearedFilters);
    onClear();
  };

  const hasActiveFilters = Object.values(filters).some((value, index) => {
    if (index === 4) return false; // Skip sortBy
    if (index === 5) return filters.sortOrder !== 'desc'; // Check sortOrder
    return value !== '';
  });

  return (
    <Card className="mb-6 card-gradient shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{t('search.title')}</CardTitle>
            {totalResults > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalResults} {t('search.results')}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                {t('search.clear')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-1" />
              {t('search.filters')}
            </Button>
          </div>
        </div>
        <CardDescription>{t('search.description')}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hauptsuchfeld */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('search.placeholder')}
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Erweiterte Filter */}
        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {/* Kategorie */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                {t('search.category')}
              </label>
              <Select
                value={filters.category}
                onValueChange={(value: string) =>
                  handleFilterChange('category', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('search.allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('search.allCategories')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {t(`categories.${category}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bewertung */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Star className="h-4 w-4 mr-1" />
                {t('search.rating')}
              </label>
              <Select
                value={filters.rating}
                onValueChange={(value: string) =>
                  handleFilterChange('rating', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('search.anyRating')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('search.anyRating')}</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ (4+)</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ (3+)</SelectItem>
                  <SelectItem value="2">⭐⭐ (2+)</SelectItem>
                  <SelectItem value="1">⭐ (1+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Zeitraum */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {t('search.dateRange')}
              </label>
              <Select
                value={filters.dateRange}
                onValueChange={(value: string) =>
                  handleFilterChange('dateRange', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('search.anyTime')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('search.anyTime')}</SelectItem>
                  <SelectItem value="today">{t('search.today')}</SelectItem>
                  <SelectItem value="week">{t('search.thisWeek')}</SelectItem>
                  <SelectItem value="month">{t('search.thisMonth')}</SelectItem>
                  <SelectItem value="year">{t('search.thisYear')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Modell */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Brain className="h-4 w-4 mr-1" />
                {t('search.model')}
              </label>
              <Select
                value={filters.modelUsed}
                onValueChange={(value: string) =>
                  handleFilterChange('modelUsed', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('search.anyModel')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('search.anyModel')}</SelectItem>
                  <SelectItem value="mock">{t('search.mockModel')}</SelectItem>
                  <SelectItem value="microsoft-dialoGPT-medium">
                    DialoGPT Medium
                  </SelectItem>
                  <SelectItem value="microsoft-dialoGPT-large">
                    DialoGPT Large
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sortierung */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                {filters.sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4 mr-1" />
                ) : (
                  <SortDesc className="h-4 w-4 mr-1" />
                )}
                {t('search.sortBy')}
              </label>
              <div className="flex space-x-2">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: string) =>
                    handleFilterChange('sortBy', value)
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">
                      {t('search.sortDate')}
                    </SelectItem>
                    <SelectItem value="title">
                      {t('search.sortTitle')}
                    </SelectItem>
                    <SelectItem value="rating">
                      {t('search.sortRating')}
                    </SelectItem>
                    <SelectItem value="category">
                      {t('search.sortCategory')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleFilterChange(
                      'sortOrder',
                      filters.sortOrder === 'asc' ? 'desc' : 'asc'
                    )
                  }
                >
                  {filters.sortOrder === 'asc' ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
