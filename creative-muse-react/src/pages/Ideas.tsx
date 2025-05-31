import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import IdeaCard from '../components/IdeaGenerator/IdeaCard';
import type { Idea, Category } from '../types';

type SortOption = 'newest' | 'oldest' | 'highestRated' | 'lowestRated';

const Ideas: React.FC = () => {
  const { language, ideas, setIdeas } = useApp();
  const t = translations[language];

  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>(ideas);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const categories: (Category | 'all')[] = [
    'all', 'general', 'business', 'technology', 'art', 'scifi', 
    'music', 'wellness', 'apps', 'solutions'
  ];

  useEffect(() => {
    let filtered = [...ideas];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(idea => idea.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'highestRated':
          return (b.rating || 0) - (a.rating || 0);
        case 'lowestRated':
          return (a.rating || 0) - (b.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredIdeas(filtered);
  }, [ideas, searchTerm, selectedCategory, sortBy]);

  const handleRatingChange = (ideaId: string, rating: number) => {
    const updatedIdeas = ideas.map(idea => 
      idea.id === ideaId ? { ...idea, rating } : idea
    );
    setIdeas(updatedIdeas);
  };

  const getCategoryLabel = (category: Category | 'all') => {
    if (category === 'all') return 'Alle Kategorien';
    return t.categories[category];
  };

  const getSortLabel = (sort: SortOption) => {
    return t.pages.ideaList[sort];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t.pages.ideaList.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Durchsuche und verwalte alle deine generierten Ideen
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ideen durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filter
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.pages.ideaList.filterBy}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {getCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.pages.ideaList.sortBy}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  >
                    <option value="newest">{getSortLabel('newest')}</option>
                    <option value="oldest">{getSortLabel('oldest')}</option>
                    <option value="highestRated">{getSortLabel('highestRated')}</option>
                    <option value="lowestRated">{getSortLabel('lowestRated')}</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-300">
            {filteredIdeas.length} von {ideas.length} Ideen
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            {sortBy === 'newest' || sortBy === 'oldest' ? (
              <SortDesc className="w-4 h-4" />
            ) : (
              <SortAsc className="w-4 h-4" />
            )}
            <span>{getSortLabel(sortBy)}</span>
          </div>
        </div>

        {/* Ideas Grid */}
        {filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredIdeas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/ideas/${idea.id}`} className="block h-full">
                  <div className="h-full hover:shadow-xl transition-shadow duration-200">
                    <IdeaCard
                      idea={idea}
                      onRatingChange={handleRatingChange}
                      showActions={false}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t.pages.ideaList.noIdeas}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Versuche andere Suchbegriffe oder Filter
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              Neue Idee generieren
            </Link>
          </motion.div>
        )}

        {/* Load More Button (for future pagination) */}
        {filteredIdeas.length > 0 && filteredIdeas.length >= 20 && (
          <div className="text-center mt-12">
            <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              Mehr laden
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ideas;