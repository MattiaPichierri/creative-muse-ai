'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiService, type Stats } from '@/lib/api'
import { 
  BarChart3,
  TrendingUp,
  Lightbulb,
  Star,
  ArrowLeft,
  Activity,
  Target,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setIsLoading(true)
    const result = await apiService.getStats()
    
    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setStats(result.data)
    }
    
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <BarChart3 className="h-12 w-12 text-blue-500" />
          </motion.div>
          <p className="mt-4 text-slate-600">Caricamento statistiche...</p>
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
              <h1 className="text-2xl font-bold gradient-text">Statistiche</h1>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Activity className="h-3 w-3 mr-1" />
              Aggiornato ora
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {stats && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="card-gradient card-hover shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Idee Totali</CardTitle>
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.total_ideas}</div>
                    <p className="text-xs text-slate-600">
                      Idee generate finora
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="card-gradient card-hover shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Valutazione Media</CardTitle>
                    <Star className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.average_rating ? stats.average_rating.toFixed(1) : 'N/A'}
                    </div>
                    <p className="text-xs text-slate-600">
                      Su 5 stelle
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="card-gradient card-hover shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attività Recente</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.recent_ideas}</div>
                    <p className="text-xs text-slate-600">
                      Idee questa settimana
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="card-gradient card-hover shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Categorie</CardTitle>
                    <Target className="h-4 w-4 text-indigo-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-indigo-600">
                      {stats.categories ? Object.keys(stats.categories).length : 0}
                    </div>
                    <p className="text-xs text-slate-600">
                      Categorie diverse
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Categories Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="card-gradient shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <span>Distribuzione per Categoria</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.categories ? Object.entries(stats.categories).map(([category, count], index) => {
                      const percentage = ((count as number) / stats.total_ideas) * 100
                      return (
                        <motion.div
                          key={category}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="capitalize">
                              {category}
                            </Badge>
                            <span className="text-sm text-slate-600">{count as number} idee</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-slate-200 rounded-full h-2">
                              <motion.div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </motion.div>
                      )
                    }) : (
                      <div className="text-center py-4 text-slate-500">
                        Nessuna categoria disponibile
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8"
            >
              <Card className="card-gradient shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span>Azioni Rapide</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Link href="/">
                      <Button className="btn-hover bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Genera Nuova Idea
                      </Button>
                    </Link>
                    <Link href="/ideas">
                      <Button variant="outline" className="btn-hover">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Visualizza Tutte le Idee
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="btn-hover"
                      onClick={loadStats}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Aggiorna Statistiche
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* Empty State */}
        {!stats && !error && !isLoading && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="p-6 card-gradient rounded-2xl shadow-sm max-w-md mx-auto">
              <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">
                Nessuna statistica disponibile
              </h3>
              <p className="text-slate-500 text-sm">
                Genera alcune idee per vedere le statistiche
              </p>
              <Link href="/">
                <Button className="mt-4 btn-hover">
                  Inizia ora
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}