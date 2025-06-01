'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { apiService, type ModelInfo } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Brain,
  Cpu,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
  HardDrive,
  Key,
} from 'lucide-react';

export function ModelSelector() {
  const { t } = useLanguage();
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const loadModels = async () => {
    setLoading(true);
    setError(null);

    const result = await apiService.getModels();

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setModels(result.data);
    }

    setLoading(false);
  };

  const switchModel = async (modelKey: string) => {
    setSwitching(modelKey);
    setError(null);

    const result = await apiService.switchModel(modelKey);

    if (result.error) {
      setError(result.error);
    } else {
      // Aktualisiere Modell-Status
      await loadModels();
    }

    setSwitching(null);
  };

  useEffect(() => {
    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  const currentModel = models.find(m => m.current);
  const availableModels = models.filter(m => m.available);
  const unavailableModels = models.filter(m => !m.available);

  const getStatusIcon = (model: ModelInfo) => {
    if (model.current) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (!model.available) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (model.loaded) {
      return <Cpu className="h-4 w-4 text-blue-500" />;
    }
    return <Brain className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = (model: ModelInfo) => {
    if (model.current) return 'Aktiv';
    if (!model.available) return 'Nicht verfügbar';
    if (model.loaded) return 'Geladen';
    return 'Verfügbar';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Brain className="h-4 w-4" />
          {currentModel ? currentModel.key : 'Modell wählen'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Modell Auswahl
          </DialogTitle>
          <DialogDescription>
            Wählen Sie ein AI-Modell für die Ideengenerierung. Empfohlene Modelle sind mit einem Stern markiert.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Lade Modelle...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Verfügbare Modelle */}
            {availableModels.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Verfügbare Modelle ({availableModels.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {availableModels.map((model) => (
                    <Card key={model.key} className={`transition-all ${
                      model.current ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(model)}
                            <CardTitle className="text-base">
                              {model.key}
                              {model.recommended && (
                                <Star className="h-4 w-4 text-yellow-500 ml-1 inline" />
                              )}
                            </CardTitle>
                          </div>
                          <Badge variant={model.current ? 'default' : 'secondary'}>
                            {getStatusText(model)}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {model.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              {model.size_gb.toFixed(1)}GB
                            </span>
                            {model.requires_token && (
                              <span className="flex items-center gap-1">
                                <Key className="h-3 w-3" />
                                Token
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {!model.current && (
                          <Button
                            onClick={() => switchModel(model.key)}
                            disabled={switching === model.key}
                            className="w-full"
                            size="sm"
                          >
                            {switching === model.key ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Wechsle...
                              </>
                            ) : (
                              <>
                                <Zap className="h-4 w-4 mr-2" />
                                Aktivieren
                              </>
                            )}
                          </Button>
                        )}
                        
                        {model.current && (
                          <div className="text-center text-sm text-green-600 font-medium">
                            ✓ Aktuell aktiv
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Nicht verfügbare Modelle */}
            {unavailableModels.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Nicht verfügbare Modelle ({unavailableModels.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {unavailableModels.map((model) => (
                    <Card key={model.key} className="opacity-60">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(model)}
                            <CardTitle className="text-base">
                              {model.key}
                              {model.recommended && (
                                <Star className="h-4 w-4 text-yellow-500 ml-1 inline" />
                              )}
                            </CardTitle>
                          </div>
                          <Badge variant="destructive">
                            Nicht verfügbar
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {model.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              {model.size_gb.toFixed(1)}GB
                            </span>
                            {model.requires_token && (
                              <span className="flex items-center gap-1">
                                <Key className="h-3 w-3" />
                                Token
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-center text-sm text-gray-500">
                          💡 Verwenden Sie: <br />
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            python scripts/download_models.py --download {model.key}
                          </code>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {models.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Modelle gefunden</p>
                <p className="text-sm">Stellen Sie sicher, dass das Backend läuft</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}