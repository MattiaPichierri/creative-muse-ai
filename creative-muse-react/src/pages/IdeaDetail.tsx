import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, Brain, Shuffle, Code, Star, Share2, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { ideaService } from '../services/api';
import type { Idea } from '../types';

const IdeaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, ideas, setIdeas } = useApp();
  const t = translations[language];

  const [idea, setIdea] = useState<Idea | null>(null);
  const [isRating, setIsRating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      const foundIdea = ideas.find(i => i.id === id);
      setIdea(foundIdea || null);
    }
  }, [id, ideas]);

  const handleRating = async (rating: number) => {
    if (!idea || isRating) return;
    
    setIsRating(true);
    try {
      await ideaService.rateIdea(idea.id, { rating });
      const updatedIdea = { ...idea, rating };
      setIdea(updatedIdea);
      
      // Update ideas in context
      const updatedIdeas = ideas.map(i => 
        i.id === idea.id ? updatedIdea : i
      );
      setIdeas(updatedIdeas);
    } catch (error) {
      console.error('Failed to rate idea:', error);
    } finally {
      setIsRating(false);
    }
  };

  const handleShare = async () => {
    if (!idea) return;

    const shareData = {
      title: idea.title,
      text: idea.content,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${idea.title}\n\n${idea.content}\n\n${window.location.href}`
        );
        alert('Link in die Zwischenablage kopiert!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleDelete = () => {
    if (!idea) return;

    const updatedIdeas = ideas.filter(i => i.id !== idea.id);
    setIdeas(updatedIdeas);
    navigate('/ideas');
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
        return <Brain className="w-4 h-4" />;
      case 'random':
        return <Shuffle className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString(
      language === 'de' ? 'de-DE' : language === 'it' ? 'it-IT' : 'en-US',
      options
    );
  };

  if (!idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Idee nicht gefunden
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Die angeforderte Idee existiert nicht oder wurde gelöscht.
            </p>
            <Link
              to="/ideas"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t.pages.ideaDetail.backToList}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            to="/ideas"
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t.pages.ideaDetail.backToList}
          </Link>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(idea.generation_method)}`}>
                  {getBadgeIcon(idea.generation_method)}
                  <span className="ml-2">{t.badges[idea.generation_method as keyof typeof t.badges]}</span>
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  <Tag className="w-4 h-4 mr-1" />
                  {t.categories[idea.category as keyof typeof t.categories]}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                {t.pages.ideaDetail.generatedOn}: {formatDate(idea.created_at)}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {idea.title}
            </h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {idea.content}
              </p>
            </div>

            {/* Rating Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.pages.ideaDetail.rateIdea}
              </h3>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    disabled={isRating}
                    className={`transition-all duration-200 ${
                      star <= (idea.rating || 0)
                        ? 'text-yellow-400 hover:text-yellow-500 scale-110'
                        : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
                    } ${isRating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-125'}`}
                  >
                    <Star 
                      className={`w-8 h-8 ${star <= (idea.rating || 0) ? 'fill-current' : ''}`} 
                    />
                  </button>
                ))}
                {idea.rating && (
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 ml-4">
                    {idea.rating}/5
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {t.pages.ideaDetail.shareIdea}
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 rounded-md text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t.pages.ideaDetail.deleteIdea}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Idee löschen?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  Löschen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default IdeaDetail;