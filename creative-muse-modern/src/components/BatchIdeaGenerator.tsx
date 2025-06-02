'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  apiService,
  type Idea,
  type BatchIdeaRequest,
  type BatchIdeaResponse,
} from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2,
  Brain,
  Clock,
  TrendingUp,
  Users,
} from 'lucide-react';

interface BatchIdeaGeneratorProps {
  onIdeasGenerated: (ideas: Idea[]) => void;
  className?: string;
}

export function BatchIdeaGenerator({
  onIdeasGenerated,
  className,
}: BatchIdeaGeneratorProps) {
  const { language } = useLanguage();
  const [prompts, setPrompts] = useState(
    'KI-gestützte Bildung\nNachhaltige Mobilität\nDigitale Gesundheit'
  );
  const [category, setCategory] = useState('technology');
  const [creativityLevel, setCreativityLevel] = useState(7);
  const [parallelProcessing, setParallelProcessing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BatchIdeaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'general', label: 'Allgemein' },
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Technologie' },
    { value: 'sustainability', label: 'Nachhaltigkeit' },
    { value: 'health', label: 'Gesundheit' },
    { value: 'education', label: 'Bildung' },
    { value: 'entertainment', label: 'Unterhaltung' },
  ];

  const startBatchProcessing = async () => {
    const promptList = prompts.split('\n').filter((p) => p.trim());

    if (promptList.length === 0) {
      setError('Bitte geben Sie mindestens einen Prompt ein!');
      return;
    }

    if (promptList.length > 10) {
      setError('Maximal 10 Prompts gleichzeitig möglich!');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    const request: BatchIdeaRequest = {
      prompts: promptList,
      category,
      creativity_level: creativityLevel,
      language,
      parallel: parallelProcessing,
    };

    try {
      const response = await apiService.generateBatchIdeas(request);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setResult(response.data);
        onIdeasGenerated(response.data.ideas);
      }
    } catch (error) {
      console.error('❌ Batch processing failed:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Batch-Verarbeitung fehlgeschlagen'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getPromptCount = () => {
    return prompts.split('\n').filter((p) => p.trim()).length;
  };

  return (
    <Card className={`card-gradient card-hover shadow-lg ${className}`}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-purple-600" />
          <CardTitle className="text-xl">⚡ Batch-Processing</CardTitle>
        </div>
        <CardDescription>
          Generieren Sie mehrere Ideen gleichzeitig mit paralleler Verarbeitung
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2"
            >
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prompts Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Prompts (einer pro Zeile):
            </label>
            <Badge variant="outline" className="text-xs">
              {getPromptCount()} Prompts
            </Badge>
          </div>
          <Textarea
            placeholder="KI-gestützte Bildung&#10;Nachhaltige Mobilität&#10;Digitale Gesundheit"
            value={prompts}
            onChange={(e) => setPrompts(e.target.value)}
            className="min-h-[120px] border-purple-200 focus:border-purple-400 font-mono text-sm"
            disabled={isProcessing}
          />
          <p className="text-xs text-gray-500">
            Maximal 10 Prompts gleichzeitig. Jeder Prompt in einer neuen Zeile.
          </p>
        </div>

        {/* Settings Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Kategorie:
            </label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Kreativität: {creativityLevel}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={creativityLevel}
              onChange={(e) => setCreativityLevel(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Parallel Processing Option */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="parallel"
            checked={parallelProcessing}
            onCheckedChange={(checked) =>
              setParallelProcessing(checked as boolean)
            }
            disabled={isProcessing}
          />
          <label
            htmlFor="parallel"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            Parallele Verarbeitung aktivieren
          </label>
          <Badge variant="secondary" className="text-xs">
            {parallelProcessing ? 'Schneller' : 'Sequenziell'}
          </Badge>
        </div>

        {/* Control Button */}
        <Button
          onClick={startBatchProcessing}
          disabled={isProcessing || getPromptCount() === 0}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verarbeitung läuft...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Batch-Verarbeitung starten
            </>
          )}
        </Button>

        {/* Results Display */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* Summary Stats */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium text-green-800">
                    Batch-Verarbeitung abgeschlossen
                  </h4>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">{result.total_count}</div>
                      <div className="text-gray-600">Gesamt</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="font-medium">{result.success_count}</div>
                      <div className="text-gray-600">Erfolgreich</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="font-medium">
                        {result.total_time.toFixed(1)}s
                      </div>
                      <div className="text-gray-600">Gesamtzeit</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="font-medium">
                        {result.average_time.toFixed(1)}s
                      </div>
                      <div className="text-gray-600">Durchschnitt</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated Ideas Preview */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">
                  Generierte Ideen ({result.ideas.length}):
                </h4>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {result.ideas.map((idea, index) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm text-gray-800 line-clamp-1">
                          {idea.title}
                        </h5>
                        <div className="flex items-center space-x-1">
                          <Brain className="h-3 w-3 text-gray-400" />
                          <Badge variant="outline" className="text-xs">
                            {idea.model_used}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {idea.content}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Failed Count */}
              {result.failed_count > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <p className="text-yellow-700 text-sm">
                      {result.failed_count} Idee(n) konnten nicht generiert
                      werden.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
