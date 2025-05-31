import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Globe, Smartphone, Code, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';

const About: React.FC = () => {
  const { language } = useApp();
  const t = translations[language];

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Echte KI-Integration",
      description: "Nutzt moderne Transformer-Modelle für authentische Ideengenerierung"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Typing Animation",
      description: "Immersive Echtzeit-Generierung mit charakterweiser Anzeige"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Mehrsprachig",
      description: "Vollständige Unterstützung für Deutsch, Englisch und Italienisch"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "PWA-Ready",
      description: "Installierbar auf Desktop und Mobile mit Offline-Funktionalität"
    }
  ];

  const technologies = [
    { name: "React 18", description: "Moderne UI-Bibliothek mit Hooks" },
    { name: "TypeScript", description: "Typsichere Entwicklung" },
    { name: "Vite", description: "Schneller Build-Tool und Dev-Server" },
    { name: "Tailwind CSS", description: "Utility-first CSS Framework" },
    { name: "Framer Motion", description: "Animationen und Übergänge" },
    { name: "React Router", description: "Client-side Routing" },
    { name: "React Query", description: "Server State Management" },
    { name: "FastAPI", description: "Python Backend Framework" },
    { name: "Transformers", description: "Hugging Face ML-Bibliothek" },
    { name: "SQLite", description: "Leichtgewichtige Datenbank" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="text-6xl mb-6">🎨</div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t.pages.about.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t.pages.about.description}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            {t.pages.about.features}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center transition-colors duration-200"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                  <div className="text-purple-600 dark:text-purple-400">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            {t.pages.about.technology}
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {technologies.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <Code className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {tech.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {tech.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Project Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white text-center"
        >
          <Heart className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">
            Open Source & Community
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-6">
            Creative Muse AI ist ein Open-Source-Projekt, das die Kraft der KI für kreative 
            Ideengenerierung demokratisiert. Entwickelt mit modernen Web-Technologien und 
            echten Machine Learning-Modellen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/your-repo/creative-muse-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              <Code className="w-5 h-5 mr-2" />
              GitHub Repository
            </a>
            <a
              href="/ideas"
              className="inline-flex items-center px-6 py-3 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition-colors duration-200"
            >
              <Brain className="w-5 h-5 mr-2" />
              Ideen entdecken
            </a>
          </div>
        </motion.div>

        {/* Version Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-12 text-gray-500 dark:text-gray-400"
        >
          <p>Creative Muse AI v2.0.0 - React Edition</p>
          <p className="text-sm mt-1">
            Entwickelt mit ❤️ für die kreative Community
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;