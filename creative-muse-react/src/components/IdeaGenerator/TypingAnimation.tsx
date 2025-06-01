import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { translations } from '../../i18n/translations';

interface TypingAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({ isVisible, onComplete }) => {
  const { language } = useApp();
  const t = translations[language];
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!isVisible) {
      setDisplayText('');
      return;
    }

    const message = t.messages.generating;
    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayText(message.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [isVisible, t.messages.generating, onComplete]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-l-purple-500 p-6 transition-colors duration-200"
    >
      <div className="space-y-4">
        {/* Title area */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        
        {/* Content area with typing effect */}
        <div className="min-h-[4rem]">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {displayText}
            {showCursor && (
              <span className="typing-cursor"></span>
            )}
          </p>
        </div>

        {/* Placeholder for meta info */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingAnimation;