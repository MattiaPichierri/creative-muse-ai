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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-16 max-w-7xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.div
            className="text-8xl mb-6 animate-float"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🎨
          </motion.div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl xl-text-8xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
            {t.app.title}
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto font-light leading-relaxed"
          >
            {t.app.subtitle}
          </motion.p>
        </motion.div>

        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-xl shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-900 dark:border-green-600 dark:text-green-300'
                : 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:border-red-600 dark:text-red-300'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
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
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/20 h-fit"
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
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
                    className="text-center py-12"
                  >
                    <div className="text-6xl mb-4">💡</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {t.results.empty}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                      Starte mit der Ideengenerierung!
                    </p>
                  </motion.div>
                ) : null}

                {/* Show more link */}
                {recentIdeas.length >= 5 && (
                  <div className="text-center pt-4">
                    <motion.a
                      href="/ideas"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: "🤖",
              title: "KI-Powered",
              description: "Nutze echte KI-Modelle für authentische Ideengenerierung"
            },
            {
              icon: "⌨️",
              title: "Typing Animation",
              description: "Erlebe immersive Typing-Animationen beim Generieren"
            },
            {
              icon: "🎲",
              title: "Zufällige Ideen",
              description: "Entdecke zufällige Ideen für kreative Inspiration"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;