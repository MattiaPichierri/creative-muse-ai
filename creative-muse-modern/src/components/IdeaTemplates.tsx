'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  FileText,
  Lightbulb,
  Rocket,
  Palette,
  Code,
  Heart,
  BookOpen,
  Zap,
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  structure: {
    title: string;
    sections: {
      name: string;
      placeholder: string;
      required: boolean;
    }[];
  };
  color: string;
}

const templates: Template[] = [
  {
    id: 'startup-idea',
    name: 'Startup Idea',
    description: 'Structured template for business startup concepts',
    category: 'business',
    icon: <Rocket className="h-5 w-5" />,
    color: 'bg-blue-500',
    structure: {
      title: 'Startup Idea Template',
      sections: [
        {
          name: 'Problem Statement',
          placeholder: 'What problem does this solve?',
          required: true,
        },
        {
          name: 'Solution',
          placeholder: 'How does your idea solve this problem?',
          required: true,
        },
        {
          name: 'Target Market',
          placeholder: 'Who are your potential customers?',
          required: true,
        },
        {
          name: 'Revenue Model',
          placeholder: 'How will you make money?',
          required: false,
        },
        {
          name: 'Competitive Advantage',
          placeholder: 'What makes you different?',
          required: false,
        },
      ],
    },
  },
  {
    id: 'creative-project',
    name: 'Creative Project',
    description: 'Template for artistic and creative endeavors',
    category: 'art',
    icon: <Palette className="h-5 w-5" />,
    color: 'bg-purple-500',
    structure: {
      title: 'Creative Project Template',
      sections: [
        {
          name: 'Concept',
          placeholder: 'What is your creative vision?',
          required: true,
        },
        {
          name: 'Medium/Format',
          placeholder: 'What medium will you use? (digital, physical, etc.)',
          required: true,
        },
        {
          name: 'Inspiration',
          placeholder: 'What inspires this project?',
          required: false,
        },
        {
          name: 'Target Audience',
          placeholder: 'Who is this for?',
          required: false,
        },
        {
          name: 'Timeline',
          placeholder: 'How long will this take to complete?',
          required: false,
        },
      ],
    },
  },
  {
    id: 'tech-product',
    name: 'Tech Product',
    description: 'Template for technology product development',
    category: 'technology',
    icon: <Code className="h-5 w-5" />,
    color: 'bg-green-500',
    structure: {
      title: 'Tech Product Template',
      sections: [
        {
          name: 'Product Overview',
          placeholder: 'What does your product do?',
          required: true,
        },
        {
          name: 'Key Features',
          placeholder: 'List the main features',
          required: true,
        },
        {
          name: 'Technology Stack',
          placeholder: 'What technologies will you use?',
          required: false,
        },
        {
          name: 'User Experience',
          placeholder: 'How will users interact with your product?',
          required: true,
        },
        {
          name: 'Development Timeline',
          placeholder: 'What are the development phases?',
          required: false,
        },
      ],
    },
  },
  {
    id: 'content-idea',
    name: 'Content Idea',
    description: 'Template for content creation and storytelling',
    category: 'entertainment',
    icon: <BookOpen className="h-5 w-5" />,
    color: 'bg-orange-500',
    structure: {
      title: 'Content Idea Template',
      sections: [
        {
          name: 'Content Type',
          placeholder: 'Blog post, video, podcast, etc.',
          required: true,
        },
        {
          name: 'Main Topic',
          placeholder: 'What is the main subject?',
          required: true,
        },
        {
          name: 'Key Messages',
          placeholder: 'What are the main points you want to convey?',
          required: true,
        },
        {
          name: 'Target Audience',
          placeholder: 'Who is your audience?',
          required: false,
        },
        {
          name: 'Call to Action',
          placeholder: 'What do you want your audience to do?',
          required: false,
        },
      ],
    },
  },
  {
    id: 'wellness-app',
    name: 'Wellness App',
    description: 'Template for health and wellness applications',
    category: 'health',
    icon: <Heart className="h-5 w-5" />,
    color: 'bg-pink-500',
    structure: {
      title: 'Wellness App Template',
      sections: [
        {
          name: 'Health Focus',
          placeholder: 'Mental health, fitness, nutrition, etc.',
          required: true,
        },
        {
          name: 'Core Features',
          placeholder: 'What are the main app features?',
          required: true,
        },
        {
          name: 'User Journey',
          placeholder: 'How will users progress through the app?',
          required: true,
        },
        {
          name: 'Personalization',
          placeholder: 'How will you customize the experience?',
          required: false,
        },
        {
          name: 'Success Metrics',
          placeholder: 'How will you measure user success?',
          required: false,
        },
      ],
    },
  },
];

interface IdeaTemplatesProps {
  onTemplateSelect: (template: Template, content: Record<string, string>) => void;
}

export function IdeaTemplates({ onTemplateSelect }: IdeaTemplatesProps) {
  const { t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateContent, setTemplateContent] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
    setTemplateContent({});
    setIsDialogOpen(true);
  };

  const handleContentChange = (sectionName: string, value: string) => {
    setTemplateContent(prev => ({
      ...prev,
      [sectionName]: value,
    }));
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate, templateContent);
      setIsDialogOpen(false);
      setTemplateContent({});
    }
  };

  const isFormValid = selectedTemplate?.structure.sections
    .filter(section => section.required)
    .every(section => templateContent[section.name]?.trim());

  return (
    <>
      <Card className="mb-6 card-gradient shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">{t('templates.title')}</CardTitle>
          </div>
          <CardDescription>{t('templates.description')}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                  onClick={() => handleTemplateClick(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${template.color} text-white`}>
                        {template.icon}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {t(`categories.${template.category}`)}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <div className="mt-3 flex items-center text-xs text-gray-500">
                      <Zap className="h-3 w-3 mr-1" />
                      {template.structure.sections.length} {t('templates.sections')}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedTemplate?.icon}
              <span>{selectedTemplate?.name}</span>
            </DialogTitle>
            <DialogDescription>
              {t('templates.fillSections')}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4 py-4">
              {selectedTemplate.structure.sections.map((section) => (
                <div key={section.name} className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    {section.name}
                    {section.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <Textarea
                    placeholder={section.placeholder}
                    value={templateContent[section.name] || ''}
                    onChange={(e) => handleContentChange(section.name, e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleUseTemplate}
              disabled={!isFormValid}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              {t('templates.useTemplate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}