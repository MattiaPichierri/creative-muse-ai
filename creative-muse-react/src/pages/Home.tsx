import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { ideaService, StreamingParser } from '../services/api';
import IdeaForm from '../components/IdeaGenerator/IdeaForm';
import IdeaCard from '../components/IdeaGenerator/IdeaCard';
import TypingAnimation from '../components/IdeaGenerator/TypingAnimation';
import type { Idea, IdeaRequest, RandomIdeaRequest, StreamingData } from '../types';

const Home: React.FC = () => {
  const { language, ideas, setIdeas, setStats } = useApp();
  const t = translations[language];
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Load recent ideas (last 5)
    setRecentIdeas(ideas.slice(0, 5));
  }, [ideas]);

  useEffect(() => {
    // Load stats on mount
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stats = await ideaService.getStats();
      setStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleGenerate = async (request: IdeaRequest) => {
    setIsGenerating(true);
    setShowTyping(true);

    try {
      if (request.use_llm) {
        // Try streaming first for typing animation
        try {
          const stream = await ideaService.generateIdeaStream(request);
          const reader = stream.getReader();
          const parser = new StreamingParser();

          let generatedIdea: Idea | null = null;

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const events = parser.parseChunk(value);
              
              for (const event of events) {
                await handleStreamingEvent(event);
                if (event.type === 'complete' && event.idea) {
                  generatedIdea = event.idea;
                }
              }
            }
          } finally {
            reader.releaseLock();
            parser.reset();
          }

          if (generatedIdea) {
            addNewIdea(generatedIdea);
            showNotification('success', t.messages.ideaGenerated);
          }
        } catch (streamError) {
          console.warn('Streaming failed, falling back to regular generation:', streamError);
          // Fallback to regular generation
          const idea = await ideaService.generateIdea(request);
          addNewIdea(idea);
          showNotification('success', t.messages.ideaGenerated);
        }
      } else {
        // Regular generation without streaming
        const idea = await ideaService.generateIdea(request);
        addNewIdea(idea);
        showNotification('success', t.messages.ideaGenerated);
      }

      await loadStats();
    } catch (error) {
      console.error('Generation failed:', error);
      showNotification('error', `${t.messages.ratingError}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
      setShowTyping(false);
    }
  };

  const handleGenerateRandom = async (request: RandomIdeaRequest) => {
    setIsGenerating(true);

    try {
      const idea = await ideaService.generateRandomIdea(request);
      addNewIdea(idea);
      showNotification('success', t.messages.randomGenerated);
      await loadStats();
    } catch (error) {
      console.error('Random generation failed:', error);
      showNotification('error', `${t.messages.ratingError}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStreamingEvent = async (event: StreamingData) => {
    // Handle streaming events for typing animation
    // This could be enhanced to show real-time typing
    console.log('Streaming event:', event);
  };

  const addNewIdea = (idea: Idea) => {
    const updatedIdeas = [idea, ...ideas];
    setIdeas(updatedIdeas);
    setRecentIdeas(updatedIdeas.slice(0, 5));
  };

  const handleRatingChange = (ideaId: string, rating: number) => {
    const updatedIdeas = ideas.map(idea => 
      idea.id === ideaId ? { ...idea, rating } : idea
    );
    setIdeas(updatedIdeas);
    setRecentIdeas(updatedIdeas.slice(0, 5));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`mb-6 p-4 rounded-md ${
              notification.type === 'success'
                ? 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-900 dark:border-green-600 dark:text-green-300'
                : 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:border-red-600 dark:text-red-300'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div>
            <IdeaForm
              onGenerate={handleGenerate}
              onGenerateRandom={handleGenerateRandom}
              isGenerating={isGenerating}
            />
          </div>

          {/* Right Column - Results */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t.results.title}
              </h2>

              <div className="space-y-4">
                {/* Typing Animation */}
                {showTyping && (
                  <TypingAnimation
                    isVisible={showTyping}
                    onComplete={() => setShowTyping(false)}
                  />
                )}

                {/* Recent Ideas */}
                {recentIdeas.length > 0 ? (
                  recentIdeas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onRatingChange={handleRatingChange}
                    />
                  ))
                ) : !showTyping ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {t.results.empty}
                    </p>
                  </div>
                ) : null}

                {/* Show more link */}
                {recentIdeas.length >= 5 && (
                  <div className="text-center pt-4">
                    <motion.a
                      href="/ideas"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-600 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t.pages.ideaList.title} →
                    </motion.a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            {t.app.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t.app.subtitle}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-200">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t.form.useLLM}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Nutze echte KI-Modelle für authentische Ideengenerierung
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-200">
            <div className="text-4xl mb-4">⌨️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t.form.useTyping}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Erlebe immersive Typing-Animationen beim Generieren
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-200">
            <div className="text-4xl mb-4">🎲</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t.form.random}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Entdecke zufällige Ideen für kreative Inspiration
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;