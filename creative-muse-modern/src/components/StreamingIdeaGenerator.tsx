'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  apiService,
  type Idea,
  type IdeaRequest,
  type StreamChunk,
} from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2,
  Brain,
} from 'lucide-react';

interface StreamingIdeaGeneratorProps {
  onIdeaGenerated: (idea: Idea) => void;
  className?: string;
}

export function StreamingIdeaGenerator({
  onIdeaGenerated,
  className,
}: StreamingIdeaGeneratorProps) {
  const { language } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('general');
  const [creativityLevel, setCreativityLevel] = useState(7);
  const [selectedModel, setSelectedModel] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [streamingComplete, setStreamingComplete] = useState(false);

  const categories = [
    { value: 'general', label: 'Allgemein' },
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Technologie' },
    { value: 'sustainability', label: 'Nachhaltigkeit' },
    { value: 'health', label: 'Gesundheit' },
    { value: 'education', label: 'Bildung' },
    { value: 'entertainment', label: 'Unterhaltung' },
  ];

  const models = [
    { value: '', label: 'Auto-Auswahl' },
    { value: 'mistral-7b-instruct-v0.3', label: 'Mistral 7B v0.3' },
    { value: 'microsoft-dialoGPT-medium', label: 'DialoGPT Medium' },
    { value: 'microsoft-dialoGPT-large', label: 'DialoGPT Large' },
  ];

  const handleStreamChunk = useCallback((chunk: StreamChunk) => {
    console.log('📡 Streaming chunk:', chunk);

    switch (chunk.type) {
      case 'start':
        setStreamContent('');
        setProgress(0);
        setError(null);
        setStreamingComplete(false);
        break;

      case 'chunk':
        if (chunk.content) {
          setStreamContent((prev) => prev + chunk.content);
        }
        if (chunk.progress !== undefined) {
          setProgress(chunk.progress * 100);
        }
        break;

      case 'complete':
        setProgress(100);
        setStreamingComplete(true);
        break;

      case 'error':
        setError(chunk.error || 'Streaming-Fehler aufgetreten');
        setIsStreaming(false);
        break;
    }
  }, []);

  const handleStreamComplete = useCallback(
    (idea: Idea) => {
      console.log('✅ Streaming complete:', idea);
      onIdeaGenerated(idea);
      setIsStreaming(false);

      // Reset nach kurzer Verzögerung
      setTimeout(() => {
        setStreamContent('');
        setProgress(0);
        setStreamingComplete(false);
      }, 2000);
    },
    [onIdeaGenerated]
  );

  const handleStreamError = useCallback((errorMessage: string) => {
    console.error('❌ Streaming error:', errorMessage);
    setError(errorMessage);
    setIsStreaming(false);
  }, []);

  const startStreaming = async () => {
    if (!prompt.trim()) {
      setError('Bitte geben Sie einen Prompt ein!');
      return;
    }

    setIsStreaming(true);
    setError(null);

    const request: IdeaRequest = {
      prompt,
      category,
      creativity_level: creativityLevel,
      language,
      model: selectedModel || undefined,
      stream: true,
    };

    try {
      await apiService.generateStreamingIdea(
        request,
        handleStreamChunk,
        handleStreamComplete,
        handleStreamError
      );
    } catch (error) {
      console.error('❌ Failed to start streaming:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Streaming konnte nicht gestartet werden'
      );
      setIsStreaming(false);
    }
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    setStreamContent('');
    setProgress(0);
    setStreamingComplete(false);
  };

  return (
    <Card className={`card-gradient card-hover shadow-lg ${className}`}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Radio className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-xl">📡 Echtzeit-Streaming</CardTitle>
        </div>
        <CardDescription>
          Erleben Sie die Ideengenerierung in Echtzeit mit Live-Updates
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

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Prompt:</label>
          <Textarea
            placeholder="Beschreiben Sie Ihre Idee für Echtzeit-Generierung..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[80px] border-blue-200 focus:border-blue-400"
            disabled={isStreaming}
          />
        </div>

        {/* Settings Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Kategorie:
            </label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isStreaming}
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
              disabled={isStreaming}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Modell:</label>
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
              disabled={isStreaming}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div className="flex items-center space-x-2">
                      {model.value && <Brain className="h-3 w-3" />}
                      <span>{model.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={startStreaming}
            disabled={isStreaming || !prompt.trim()}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            {isStreaming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Streaming läuft...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Streaming starten
              </>
            )}
          </Button>

          {isStreaming && (
            <Button
              onClick={stopStreaming}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Stoppen
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {(isStreaming || streamingComplete) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Fortschritt:
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {Math.round(progress)}%
                  </span>
                  {streamingComplete && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streaming Output */}
        <AnimatePresence>
          {streamContent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Live-Output:
                </span>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  <Radio className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[120px] max-h-[300px] overflow-y-auto">
                <motion.div
                  className="whitespace-pre-wrap text-sm text-gray-800 font-mono"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {streamContent}
                  {isStreaming && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-2 h-4 bg-blue-500 ml-1"
                    />
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {streamingComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-green-700 text-sm font-medium">
                ✅ Streaming erfolgreich abgeschlossen! Idee wurde hinzugefügt.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
