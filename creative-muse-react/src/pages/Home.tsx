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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 transition-colors duration-200">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-400/5 dark:to-blue-400/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <div className="text-8xl mb-6 animate-bounce">🎨</div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              {t.app.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {t.app.subtitle}
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`mb-6 p-4 rounded-xl shadow-lg ${
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
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20 transition-colors duration-200"
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">
                {t.results.title}
              </h2>

              <div className="space-y-6">
                {/* Typing Animation */}
                {showTyping && (
                  <TypingAnimation
                    isVisible={showTyping}
                    onComplete={() => setShowTyping(false)}
                  />
                )}

                {/* Recent Ideas */}
                {recentIdeas.length > 0 ? (
                  recentIdeas.map((idea, index) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <IdeaCard
                        idea={idea}
                        onRatingChange={handleRatingChange}
                      />
                    </motion.div>
                  ))
                ) : !showTyping ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="text-8xl mb-6 animate-pulse">💡</div>
                    <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">
                      {t.results.empty}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                      Starte mit der Ideengenerierung links!
                    </p>
                  </motion.div>
                ) : null}

                {/* Show more link */}
                {recentIdeas.length >= 5 && (
                  <div className="text-center pt-6">
                    <motion.a
                      href="/ideas"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t.pages.ideaList.title} →
                    </motion.a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: "🤖",
              title: t.form.useLLM,
              description: "Nutze echte KI-Modelle für authentische Ideengenerierung",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              icon: "⌨️",
              title: t.form.useTyping,
              description: "Erlebe immersive Typing-Animationen beim Generieren",
              gradient: "from-purple-500 to-pink-500"
            },
            {
              icon: "🎲",
              title: t.form.random,
              description: "Entdecke zufällige Ideen für kreative Inspiration",
              gradient: "from-green-500 to-teal-500"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                   style={{background: `linear-gradient(to right, var(--tw-gradient-stops))`}}></div>
              <div className="relative text-center p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 transition-all duration-300 group-hover:shadow-2xl">
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold mb-4 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;