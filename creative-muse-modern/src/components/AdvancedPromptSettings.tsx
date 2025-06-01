'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Settings,
  Lightbulb,
  Sparkles,
  Target,
  Sliders,
  Plus,
  X,
  Save,
  Wand2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PromptSuggestion {
  id: string;
  text: string;
  category: string;
  creativityLevel: number;
  tags: string[];
}

interface AdvancedSettings {
  defaultCategory: string;
  defaultCreativityLevel: number;
  enableAutoSuggestions: boolean;
  maxSuggestions: number;
  preferredTags: string[];
  customPrompts: PromptSuggestion[];
}

interface AdvancedPromptSettingsProps {
  onSettingsChange: (settings: AdvancedSettings) => void;
  onPromptSelect: (prompt: string, category: string, creativityLevel: number) => void;
}

export function AdvancedPromptSettings({ onSettingsChange, onPromptSelect }: AdvancedPromptSettingsProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AdvancedSettings>({
    defaultCategory: 'general',
    defaultCreativityLevel: 5,
    enableAutoSuggestions: true,
    maxSuggestions: 5,
    preferredTags: [],
    customPrompts: []
  });

  const [newTag, setNewTag] = useState('');
  const [newPrompt, setNewPrompt] = useState({
    text: '',
    category: 'general',
    creativityLevel: 5,
    tags: [] as string[]
  });

  // Predefined prompt suggestions - now localized
  const promptSuggestions: PromptSuggestion[] = [
    {
      id: '1',
      text: t('prompts.1.text'),
      category: 'technology',
      creativityLevel: 7,
      tags: t('prompts.1.tags').split(',')
    },
    {
      id: '2',
      text: t('prompts.2.text'),
      category: 'art',
      creativityLevel: 9,
      tags: t('prompts.2.tags').split(',')
    },
    {
      id: '3',
      text: t('prompts.3.text'),
      category: 'business',
      creativityLevel: 6,
      tags: t('prompts.3.tags').split(',')
    },
    {
      id: '4',
      text: t('prompts.4.text'),
      category: 'education',
      creativityLevel: 8,
      tags: t('prompts.4.tags').split(',')
    },
    {
      id: '5',
      text: t('prompts.5.text'),
      category: 'health',
      creativityLevel: 5,
      tags: t('prompts.5.tags').split(',')
    }
  ];

  const categories = [
    { value: 'general', label: t('categories.general') },
    { value: 'business', label: t('categories.business') },
    { value: 'technology', label: t('categories.technology') },
    { value: 'art', label: t('categories.art') },
    { value: 'science', label: t('categories.science') },
    { value: 'health', label: t('categories.health') },
    { value: 'education', label: t('categories.education') },
    { value: 'entertainment', label: t('categories.entertainment') }
  ];

  const creativityLevels = [
    { value: 1, label: '1 - Sehr konservativ', description: 'Bewährte, sichere Ansätze' },
    { value: 2, label: '2 - Konservativ', description: 'Leichte Variationen bekannter Ideen' },
    { value: 3, label: '3 - Moderat', description: 'Ausgewogene Herangehensweise' },
    { value: 4, label: '4 - Kreativ', description: 'Neue Kombinationen und Ansätze' },
    { value: 5, label: '5 - Ausgewogen', description: 'Standard-Kreativitätslevel' },
    { value: 6, label: '6 - Innovativ', description: 'Unkonventionelle Lösungen' },
    { value: 7, label: '7 - Sehr innovativ', description: 'Mutige, neue Ideen' },
    { value: 8, label: '8 - Experimentell', description: 'Riskante, experimentelle Ansätze' },
    { value: 9, label: '9 - Radikal', description: 'Völlig neue Denkweisen' },
    { value: 10, label: '10 - Revolutionär', description: 'Paradigmenwechsel und Disruption' }
  ];

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('advancedPromptSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('advancedPromptSettings', JSON.stringify(settings));
      onSettingsChange(settings);
    }
  };

  // Memoized callback to prevent infinite loops
  const memoizedOnSettingsChange = useCallback(
    (newSettings: AdvancedSettings) => {
      onSettingsChange(newSettings);
    },
    [onSettingsChange]
  );

  // Call onSettingsChange when settings change
  useEffect(() => {
    memoizedOnSettingsChange(settings);
  }, [settings, memoizedOnSettingsChange]);

  const updateSettings = (updates: Partial<AdvancedSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
  };

  const addTag = () => {
    if (newTag.trim() && !settings.preferredTags.includes(newTag.trim())) {
      updateSettings({
        preferredTags: [...settings.preferredTags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateSettings({
      preferredTags: settings.preferredTags.filter(tag => tag !== tagToRemove)
    });
  };

  const addCustomPrompt = () => {
    if (newPrompt.text.trim()) {
      const prompt: PromptSuggestion = {
        id: Date.now().toString(),
        text: newPrompt.text,
        category: newPrompt.category,
        creativityLevel: newPrompt.creativityLevel,
        tags: newPrompt.tags
      };
      
      updateSettings({
        customPrompts: [...settings.customPrompts, prompt]
      });
      
      setNewPrompt({
        text: '',
        category: 'general',
        creativityLevel: 5,
        tags: []
      });
    }
  };

  const removeCustomPrompt = (id: string) => {
    updateSettings({
      customPrompts: settings.customPrompts.filter(p => p.id !== id)
    });
  };

  const getCreativityColor = (level: number) => {
    if (level <= 3) return 'bg-blue-100 text-blue-700';
    if (level <= 5) return 'bg-green-100 text-green-700';
    if (level <= 7) return 'bg-yellow-100 text-yellow-700';
    if (level <= 9) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const filteredSuggestions = promptSuggestions.filter(suggestion => {
    if (settings.preferredTags.length === 0) return true;
    return suggestion.tags.some(tag => settings.preferredTags.includes(tag));
  });

  const allSuggestions = [...filteredSuggestions, ...settings.customPrompts]
    .slice(0, settings.maxSuggestions);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center space-x-2 text-sm"
        >
          <Settings className="h-4 w-4" />
          <span>Erweiterte Einstellungen</span>
          <Sliders className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Wand2 className="h-6 w-6 mr-2" />
            Prompt & Kreativitäts-Einstellungen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
                {/* Basic Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Grundeinstellungen
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Standard-Kategorie</label>
                      <Select
                        value={settings.defaultCategory}
                        onValueChange={(value: string) => updateSettings({ defaultCategory: value })}
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

                    <div>
                      <label className="text-sm font-medium">Standard-Kreativitätslevel</label>
                      <Select
                        value={settings.defaultCreativityLevel.toString()}
                        onValueChange={(value: string) => updateSettings({ defaultCreativityLevel: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {creativityLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value.toString()}>
                              <div>
                                <div className="font-medium">{level.label}</div>
                                <div className="text-xs text-gray-500">{level.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Preferred Tags */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Bevorzugte Tags
                  </h3>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Neuen Tag hinzufügen..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1"
                    />
                    <Button onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {settings.preferredTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Prompt Suggestions */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Prompt-Vorschläge
                  </h3>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => onPromptSelect(suggestion.text, suggestion.category, suggestion.creativityLevel)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium line-clamp-2">{suggestion.text}</p>
                          <div className="flex items-center gap-1 ml-2">
                            <Badge className={getCreativityColor(suggestion.creativityLevel)} variant="secondary">
                              {suggestion.creativityLevel}
                            </Badge>
                            {settings.customPrompts.some(p => p.id === suggestion.id) && (
                              <X 
                                className="h-3 w-3 cursor-pointer text-red-500" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeCustomPrompt(suggestion.id);
                                }}
                              />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{t(`categories.${suggestion.category}`)}</span>
                          <div className="flex gap-1">
                            {suggestion.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Custom Prompt */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Eigenen Prompt hinzufügen</h3>
                  
                  <div className="space-y-2">
                    <Input
                      placeholder="Prompt-Text eingeben..."
                      value={newPrompt.text}
                      onChange={(e) => setNewPrompt({ ...newPrompt, text: e.target.value })}
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={newPrompt.category}
                        onValueChange={(value: string) => setNewPrompt({ ...newPrompt, category: value })}
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
                      
                      <Select
                        value={newPrompt.creativityLevel.toString()}
                        onValueChange={(value: string) => setNewPrompt({ ...newPrompt, creativityLevel: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {creativityLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value.toString()}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button onClick={addCustomPrompt} className="w-full" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Prompt hinzufügen
                    </Button>
                  </div>
                </div>

                {/* Save Settings */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={saveSettings} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Einstellungen speichern
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Schließen
                  </Button>
                </div>
              </div>
      </DialogContent>
    </Dialog>
  );
}