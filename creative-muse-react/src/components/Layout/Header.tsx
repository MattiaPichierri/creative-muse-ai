import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Moon, Sun, Download, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations, languageNames } from '../../i18n/translations';
import type { Language } from '../../types';

const Header: React.FC = () => {
  const { language, setLanguage, darkMode, setDarkMode } = useApp();
  const location = useLocation();
  const t = translations[language];

  const toggleLanguage = () => {
    const languages: Language[] = ['de', 'en', 'it'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-xl border-b border-white/20 dark:border-gray-700/20 transition-colors duration-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">🎨</div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Creative Muse AI
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {t.app.subtitle}
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-2">
            {[
              { path: '/', label: t.navigation.home },
              { path: '/ideas', label: t.navigation.ideas },
              { path: '/stats', label: t.navigation.stats },
              { path: '/about', label: t.navigation.about }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                {isActive(item.path) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-50"></div>
                )}
                <span className="relative">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="group relative p-3 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all duration-300 hover:scale-105"
              title={`${t.controls.language} (${languageNames[language]})`}
            >
              <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
              <span className="absolute -top-1 -right-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                {language.toUpperCase()}
              </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="group p-3 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all duration-300 hover:scale-105"
              title={t.controls.darkMode}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 group-hover:text-purple-600 transition-colors" />
              )}
            </button>

            {/* Export Button */}
            <button
              className="group p-3 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-green-100 dark:hover:bg-green-900/50 transition-all duration-300 hover:scale-105"
              title={t.controls.export}
            >
              <Download className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
            </button>

            {/* Save Button */}
            <button
              className="group p-3 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-300 hover:scale-105"
              title={t.controls.save}
            >
              <Save className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-white/20 dark:border-gray-700/20 pt-4 pb-2">
          <nav className="flex space-x-2 overflow-x-auto">
            {[
              { path: '/', label: t.navigation.home },
              { path: '/ideas', label: t.navigation.ideas },
              { path: '/stats', label: t.navigation.stats },
              { path: '/about', label: t.navigation.about }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;