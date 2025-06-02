'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService, type Idea } from '@/lib/api';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import { IdeaRating } from '@/components/IdeaRating';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIdeasStorage } from '@/hooks/useLocalStorage';
import {
  Lightbulb,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function IdeasPage() {
  const { t } = useLanguage();
  const [localIdeas, setLocalIdeas] = useIdeasStorage();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIdeas = async () => {
    setIsLoading(true);
    const result = await apiService.getAllIdeas();

    if (result.error) {
      setError(result.error);
      // Fallback al localStorage se l'API fallisce
      if (localIdeas && Array.isArray(localIdeas)) {
        setIdeas(localIdeas);
      } else {
        setIdeas([]); // Assicurati che sia sempre un array
      }
    } else if (result.data) {
      // La API restituisce {ideas: [...], total: number}
      if (result.data.ideas && Array.isArray(result.data.ideas)) {
        setIdeas(result.data.ideas);
        setLocalIdeas(result.data.ideas); // Sincronizza con localStorage
      } else {
        setIdeas([]);
        setError('Formato dati non valido ricevuto dal server');
      }
    } else {
      setIdeas([]);
    }

    setIsLoading(false);
  };

  const filterAndSortIdeas = () => {
    // Stelle sicher, dass ideas ein Array ist
    if (!Array.isArray(ideas)) {
      setFilteredIdeas([]);
      return;
    }

    let filtered = [...ideas];

    // Filtro per ricerca testuale
    if (searchTerm) {
      filtered = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro per categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((idea) => idea.category === selectedCategory);
    }

    // Filtro per rating
    if (selectedRating > 0) {
      filtered = filtered.filter(
        (idea) => (idea.rating || 0) >= selectedRating
      );
    }

    // Ordinamento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    setFilteredIdeas(filtered);
  };

  // Carica idee dal localStorage all'avvio
  useEffect(() => {
    if (localIdeas && Array.isArray(localIdeas)) {
      setIdeas(localIdeas);
      setIsLoading(false);
    }
  }, [localIdeas]);

  // Carica dall'API solo una volta al mount
  useEffect(() => {
    loadIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Esegui solo una volta

  // Filtra e ordina le idee quando cambiano i filtri
  useEffect(() => {
    filterAndSortIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideas, searchTerm, selectedCategory, selectedRating, sortBy]);

  const handleRatingChange = (ideaId: string, newRating: number) => {
    const updatedIdeas = ideas.map((idea) =>
      idea.id === ideaId ? { ...idea, rating: newRating } : idea
    );
    setIdeas(updatedIdeas);
    setLocalIdeas(updatedIdeas);
  };

  // Estrai categorie uniche
  const categories = Array.from(
    new Set(Array.isArray(ideas) ? ideas.map((idea) => idea.category) : [])
  );

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">{t('ideas.loading')}</p>
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
                {t('ideas.title')}
              </h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {filteredIdeas.length} {t('ideas.count')}
              </Badge>
            </div>
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Search and Filter */}
        {ideas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <SearchAndFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedRating={selectedRating}
              onRatingChange={setSelectedRating}
              sortBy={sortBy}
              onSortChange={setSortBy}
              categories={categories}
            />
          </motion.div>
        )}

        {/* Ideas Grid */}
        {filteredIdeas.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredIdeas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full card-gradient card-hover shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        <Badge variant="outline" className="text-xs">
                          {idea.category}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(idea.created_at).toLocaleDateString()}
                      </div>
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

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{idea.generation_method}</span>
                      <span>
                        {new Date(idea.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : ideas.length > 0 ? (
          // No results found
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="p-6 card-gradient rounded-2xl shadow-sm max-w-md mx-auto">
              <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">
                {t('ideas.noResults')}
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                {t('ideas.noResultsDescription')}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedRating(0);
                  setSortBy('newest');
                }}
                variant="outline"
                size="sm"
              >
                {t('filter.clear')}
              </Button>
            </div>
          </motion.div>
        ) : (
          // Empty state
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="p-6 card-gradient rounded-2xl shadow-sm max-w-md mx-auto">
              <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">
                {t('ideas.empty')}
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                {t('ideas.emptyDescription')}
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                  {t('home.generateFirst')}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
