'use client'

import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Filter, X, Calendar, Star } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface SearchAndFilterProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedRating: number
  onRatingChange: (rating: number) => void
  sortBy: string
  onSortChange: (sort: string) => void
  categories: string[]
}

export function SearchAndFilter({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedRating,
  onRatingChange,
  sortBy,
  onSortChange,
  categories
}: SearchAndFilterProps) {
  const { t } = useLanguage()

  const clearFilters = () => {
    onSearchChange('')
    onCategoryChange('all')
    onRatingChange(0)
    onSortChange('newest')
  }

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedRating > 0 || sortBy !== 'newest'

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder={t('search.placeholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-4 w-4 mr-2" />
              {selectedCategory === 'all' ? t('filter.allCategories') : selectedCategory}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onCategoryChange('all')}>
              {t('filter.allCategories')}
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem key={category} onClick={() => onCategoryChange(category)}>
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Rating Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Star className="h-4 w-4 mr-2" />
              {selectedRating === 0 ? t('filter.allRatings') : `${selectedRating}+ ⭐`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onRatingChange(0)}>
              {t('filter.allRatings')}
            </DropdownMenuItem>
            {[5, 4, 3, 2, 1].map((rating) => (
              <DropdownMenuItem key={rating} onClick={() => onRatingChange(rating)}>
                {rating}+ ⭐
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Calendar className="h-4 w-4 mr-2" />
              {t(`sort.${sortBy}`)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onSortChange('newest')}>
              {t('sort.newest')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('oldest')}>
              {t('sort.oldest')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('rating')}>
              {t('sort.rating')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('alphabetical')}>
              {t('sort.alphabetical')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4 mr-1" />
            {t('filter.clear')}
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {searchTerm && (
            <Badge variant="secondary" className="text-xs">
              {t('filter.search')}: &ldquo;{searchTerm}&rdquo;
            </Badge>
          )}
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              {t('filter.category')}: {selectedCategory}
            </Badge>
          )}
          {selectedRating > 0 && (
            <Badge variant="secondary" className="text-xs">
              {t('filter.rating')}: {selectedRating}+ ⭐
            </Badge>
          )}
          {sortBy !== 'newest' && (
            <Badge variant="secondary" className="text-xs">
              {t('filter.sortBy')}: {t(`sort.${sortBy}`)}
            </Badge>
          )}
        </motion.div>
      )}
    </div>
  )
}