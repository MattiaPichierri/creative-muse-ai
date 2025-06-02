'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Wand2, 
  Copy, 
  Star, 
  Download,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient, { IdeaResponse, ModelInfo } from '@/lib/api-client';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface IdeaGeneratorProps {
  onIdeaGenerated?: (idea: IdeaResponse) => void;
}

export default function IdeaGenerator({ onIdeaGenerated }: IdeaGeneratorProps) {
  const { subscriptionInfo } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('general');
  const [creativityLevel, setCreativityLevel] = useState(5);
  const [language, setLanguage] = useState('it');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedIdea, setGeneratedIdea] = useState<IdeaResponse | null>(null);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Carica modelli disponibili
  useEffect(() => {
    loadAvailableModels();
  }, []);

  const loadAvailableModels = async () => {
    try {
      const response = await apiClient.getAvailableModels();
      if (response.success && response.data) {
        setAvailableModels(response.data);
        // Seleziona il primo modello raccomandato
        const recommended = response.data.find(m => m.recommended);
        if (recommended) {
          setSelectedModel(recommended.key);
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento dei modelli:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Inserisci un prompt per generare un\'idea');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedIdea(null);

    try {
      const response = await apiClient.generateIdea({
        prompt: prompt.trim(),
        category,
        creativity_level: creativityLevel,
        language,
        model: selectedModel || undefined,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Errore nella generazione dell\'idea');
      }

      setGeneratedIdea(response.data);
      
      if (onIdeaGenerated) {
        onIdeaGenerated(response.data);
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyIdea = async () => {
    if (generatedIdea) {
      try {
        await navigator.clipboard.writeText(generatedIdea.content);
        // Potresti aggiungere un toast di successo qui
      } catch (error) {
        console.error('Errore nella copia:', error);
      }
    }
  };

  const handleRateIdea = async (rating: number) => {
    if (!generatedIdea) return;

    try {
      const response = await apiClient.rateIdea(generatedIdea.id, rating);
      if (response.success) {
        setGeneratedIdea({
          ...generatedIdea,
          rating
        });
      }
    } catch (error) {
      console.error('Errore nella valutazione:', error);
    }
  };

  const categories = [
    { value: 'general', label: 'Generale' },
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Tecnologia' },
    { value: 'creative', label: 'Creativo' },
    { value: 'education', label: 'Educazione' },
    { value: 'health', label: 'Salute' },
    { value: 'entertainment', label: 'Intrattenimento' },
  ];

  const languages = [
    { value: 'it', label: 'Italiano' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
  ];

  // Controlla i limiti di utilizzo
  const canGenerate = subscriptionInfo ? 
    subscriptionInfo.usage.daily_ideas < subscriptionInfo.limits.daily_ideas_limit : 
    true;

  return (
    <div className="space-y-6">
      {/* Form di generazione */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Generatore di Idee AI
          </CardTitle>
          <CardDescription>
            Descrivi quello che stai cercando e lascia che l&apos;AI generi idee creative per te
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!canGenerate && (
            <Alert>
              <AlertDescription>
                Hai raggiunto il limite giornaliero di idee. 
                <Button variant="link" className="p-0 h-auto ml-1">
                  Aggiorna il tuo piano
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Prompt principale */}
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              Descrivi la tua idea o problema
            </label>
            <Textarea
              id="prompt"
              placeholder="Es: Voglio creare un'app per aiutare le persone a..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
              disabled={loading}
            />
          </div>

          {/* Impostazioni base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={category} onValueChange={setCategory}>
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
              <label className="text-sm font-medium">Lingua</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Impostazioni avanzate */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Impostazioni avanzate
            </Button>

            {showAdvanced && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Livello di creatività: {creativityLevel}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={creativityLevel}
                    onChange={(e) => setCreativityLevel(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Conservativo</span>
                    <span>Creativo</span>
                  </div>
                </div>

                {availableModels.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Modello AI</label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona modello" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model.key} value={model.key}>
                            <div className="flex items-center gap-2">
                              {model.name}
                              {model.recommended && (
                                <Badge variant="secondary" className="text-xs">
                                  Raccomandato
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pulsante genera */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !canGenerate || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Generazione in corso...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Genera Idea
              </>
            )}
          </Button>

          {/* Statistiche utilizzo */}
          {subscriptionInfo && (
            <div className="text-sm text-gray-600 text-center">
              Idee generate oggi: {subscriptionInfo.usage.daily_ideas} / {subscriptionInfo.limits.daily_ideas_limit}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risultato generato */}
      {generatedIdea && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{generatedIdea.title}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{generatedIdea.category}</Badge>
                <Badge variant="secondary">{generatedIdea.model_used}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{generatedIdea.content}</p>
            </div>

            {/* Azioni */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyIdea}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copia
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Esporta
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rigenera
                </Button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600 mr-2">Valuta:</span>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRateIdea(rating)}
                    className="p-1"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        generatedIdea.rating && rating <= generatedIdea.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </Button>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              Generato il {new Date(generatedIdea.created_at).toLocaleString('it-IT')} • 
              Metodo: {generatedIdea.generation_method}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}