'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Lightbulb, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface PredefinedPromptsProps {
  onSelectPrompt: (prompt: string) => void
}

export function PredefinedPrompts({ onSelectPrompt }: PredefinedPromptsProps) {
  const { t } = useLanguage()
  
  const predefinedPrompts = [
    {
      category: t('prompts.startup'),
      prompt: t('prompts.startupDesc')
    },
    {
      category: t('prompts.scifi'),
      prompt: t('prompts.scifiDesc')
    },
    {
      category: t('prompts.tech'),
      prompt: t('prompts.techDesc')
    },
    {
      category: t('prompts.music'),
      prompt: t('prompts.musicDesc')
    },
    {
      category: t('prompts.wellness'),
      prompt: t('prompts.wellnessDesc')
    },
    {
      category: t('prompts.appName'),
      prompt: t('prompts.appNameDesc')
    },
    {
      category: t('prompts.everyday'),
      prompt: t('prompts.everydayDesc')
    }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-sm"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          {t('prompts.title')}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        {predefinedPrompts.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => onSelectPrompt(item.prompt)}
            className="flex flex-col items-start p-3 cursor-pointer"
          >
            <div className="font-medium text-sm mb-1">
              {item.category}
            </div>
            <div className="text-xs text-slate-600 line-clamp-2">
              {item.prompt.substring(0, 100)}...
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}