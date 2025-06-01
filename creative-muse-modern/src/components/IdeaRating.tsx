'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { apiService } from '@/lib/api'
import { useLanguage } from '@/contexts/LanguageContext'

interface IdeaRatingProps {
  ideaId: string
  currentRating?: number
  onRatingChange?: (rating: number) => void
}

export function IdeaRating({ ideaId, currentRating = 0, onRatingChange }: IdeaRatingProps) {
  const { t } = useLanguage()
  const [rating, setRating] = useState(currentRating)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRating = async (newRating: number) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    const result = await apiService.rateIdea(ideaId, newRating)
    
    if (result.data) {
      setRating(newRating)
      onRatingChange?.(newRating)
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm text-slate-600 mr-2">{t('rating.label')}:</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          className="focus:outline-none"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => handleRating(star)}
          disabled={isSubmitting}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hoveredRating || rating)
                ? 'text-yellow-400 fill-current'
                : 'text-slate-300'
            }`}
          />
        </motion.button>
      ))}
      {rating > 0 && (
        <span className="text-sm text-slate-500 ml-2">
          ({rating}/5)
        </span>
      )}
    </div>
  )
}