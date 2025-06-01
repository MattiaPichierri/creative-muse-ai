'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { apiService, type Idea } from '@/lib/api'
import { 
  Lightbulb, 
  Star,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  Tag
} from 'lucide-react'
import Link from 'next/link'

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadIdeas()
  }, [])

  useEffect(() => {
    filterIdeas()
  }, [ideas, searchTerm, selectedCategory])

  const loadIdeas = async () => {
    setIsLoading(true)
    const result = await apiService.getAllIdeas()
    
    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setIdeas(result.data)
    }
    
    setIsLoading(false)
  }

  const filterIdeas = () => {
    let filtered = ideas

    if (searchTerm) {
      filtered = filtered.filter(idea => 
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(idea => idea.category === selectedCategory)
    }

    setFilteredIdeas(filtered)
  }

  const rateIdea = async (ideaId: string, rating: number) => {
    const result = await apiService.rateIdea(ideaId, rating)
    
    if (result.data) {
      setIdeas(prev => prev.map(idea => 
        idea.id === ideaId ? result.data! : idea
      ))
    }
  }

  const categories = Array.from(new Set(ideas.map(idea => idea.category)))

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Lightbulb className="h-12 w-12 text-blue-500" />
          </motion.div>
          <p className="mt-4 text-slate-600">Caricamento idee...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Indietro
                </Button>
              </Link>
              <h1 className="text-2xl font-bold gradient-text">Le tue idee</h1>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {filteredIdeas.length} idee
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cerca nelle tue idee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutte le categorie</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Ideas Grid */}
        {filteredIdeas.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredIdeas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="h-full card-gradient card-hover shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        <Badge variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {idea.category}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => rateIdea(idea.id, star)}
                            className="focus:outline-none"
                          >
                            <Star 
                              className={`h-4 w-4 ${
                                idea.rating && star <= idea.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-slate-300'
                              } hover:text-yellow-400 transition-colors`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight">{idea.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {idea.content.length > 150 
                        ? `${idea.content.substring(0, 150)}...` 
                        : idea.content
                      }
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(idea.created_at).toLocaleDateString('it-IT')}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {idea.generation_method}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="p-6 card-gradient rounded-2xl shadow-sm max-w-md mx-auto">
              <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Nessuna idea trovata' 
                  : 'Nessuna idea ancora'
                }
              </h3>
              <p className="text-slate-500 text-sm">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Inizia a generare le tue prime idee creative'
                }
              </p>
              {(!searchTerm && selectedCategory === 'all') && (
                <Link href="/">
                  <Button className="mt-4 btn-hover">
                    Genera la prima idea
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}