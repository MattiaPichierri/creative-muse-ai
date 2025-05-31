import React, { useState } from 'react';
import { Star, Calendar, Tag, Brain, Shuffle, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';
import { ideaService } from '../../services/api';
import type { Idea } from '../../types';

interface IdeaCardProps {
  idea: Idea;
  onRatingChange?: (ideaId: string, rating: number) => void;
  showActions?: boolean;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onRatingChange, showActions = true }) => {
  const { language } = useApp();
  const t = translations[language];
  const [currentRating, setCurrentRating] = useState(idea.rating || 0);
  const [isRating, setIsRating] = useState(false);

  const handleRating = async (rating: number) => {
    if (isRating) return;
    
    setIsRating(true);
    try {
      await ideaService.rateIdea(idea.id, { rating });
      setCurrentRating(rating);
      onRatingChange?.(idea.id, rating);
    } catch (error) {
      console.error('Failed to rate idea:', error);
    } finally {
      setIsRating(false);
    }
  };

  const getBadgeColor = (method: string) => {
    switch (method) {
      case 'llm':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'random':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getBadgeIcon = (method: string) => {
    switch (method) {
      case 'llm':
        return <Brain className="w-3 h-3" />;
      case 'random':
        return <Shuffle className="w-3 h-3" />;
      default:
        return <Code className="w-3 h-3" />;
    }
  };

  const getBorderColor = (method: string) => {
    switch (method) {
      case 'llm':
        return 'border-l-green-500';
      case 'random':
        return 'border-l-orange-500';
      default:
        return 'border-l-purple-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'de' ? 'de-DE' : language === 'it' ? 'it-IT' : 'en-US');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 ${getBorderColor(idea.generation_method)} p-6 transition-colors duration-200`}
    >
      {/* Header with badges */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(idea.generation_method)}`}>
            {getBadgeIcon(idea.generation_method)}
            <span className="ml-1">{t.badges[idea.generation_method as keyof typeof t.badges]}</span>
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            <Tag className="w-3 h-3 mr-1" />
            {t.categories[idea.category as keyof typeof t.categories]}
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(idea.created_at)}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {idea.title}
      </h3>

      {/* Content */}
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {idea.content}
      </p>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Rating */}
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              {t.pages.ideaDetail.rateIdea}:
            </span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                disabled={isRating}
                className={`transition-colors duration-200 ${
                  star <= currentRating
                    ? 'text-yellow-400 hover:text-yellow-500'
                    : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
                } ${isRating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <Star 
                  className={`w-5 h-5 ${star <= currentRating ? 'fill-current' : ''}`} 
                />
              </button>
            ))}
            {currentRating > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                ({currentRating}/5)
              </span>
            )}
          </div>

          {/* Language indicator */}
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
            {idea.language}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default IdeaCard;