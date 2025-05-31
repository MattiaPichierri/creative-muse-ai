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
    <header className="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-3xl">🎨</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Creative Muse AI
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.app.subtitle}
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              {t.navigation.home}
            </Link>
            <Link
              to="/ideas"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/ideas') 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              {t.navigation.ideas}
            </Link>
            <Link
              to="/stats"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/stats') 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              {t.navigation.stats}
            </Link>
            <Link
              to="/about"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/about') 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              {t.navigation.about}
            </Link>
          </nav>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={`${t.controls.language} (${languageNames[language]})`}
            >
              <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={t.controls.darkMode}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* Export Button */}
            <button
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={t.controls.export}
            >
              <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Save Button */}
            <button
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={t.controls.save}
            >
              <Save className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 pt-4 pb-2">
          <nav className="flex space-x-4 overflow-x-auto">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive('/') 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {t.navigation.home}
            </Link>
            <Link
              to="/ideas"
              className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive('/ideas') 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {t.navigation.ideas}
            </Link>
            <Link
              to="/stats"
              className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive('/stats') 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {t.navigation.stats}
            </Link>
            <Link
              to="/about"
              className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive('/about') 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {t.navigation.about}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;