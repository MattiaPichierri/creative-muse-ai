'use client'

import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Lightbulb, ChevronDown } from 'lucide-react'

interface PredefinedPromptsProps {
  onSelectPrompt: (prompt: string) => void
}

const predefinedPrompts = [
  {
    category: 'Nachhaltiges Startup',
    prompt: 'Entwickle eine innovative Startup-Idee, die sich auf Nachhaltigkeit und Umweltschutz konzentriert. Die Lösung sollte ein reales Problem ansprechen und wirtschaftlich rentabel sein.'
  },
  {
    category: 'Sci-Fi Story',
    prompt: 'Erstelle eine fesselnde Science-Fiction-Geschichte, die in der nahen Zukunft spielt. Integriere fortschrittliche Technologien und deren Auswirkungen auf die Gesellschaft.'
  },
  {
    category: 'Tech-Produkt',
    prompt: 'Entwirf ein innovatives Technologieprodukt, das den Alltag der Menschen verbessert. Berücksichtige aktuelle Trends wie KI, IoT oder AR/VR.'
  },
  {
    category: 'Musik-Konzept',
    prompt: 'Entwickle ein kreatives Musikprojekt oder -konzept, das verschiedene Genres oder innovative Aufführungsformen kombiniert.'
  },
  {
    category: 'Wellness-App',
    prompt: 'Konzipiere eine App für Gesundheit und Wohlbefinden, die personalisierte Lösungen für mentale oder körperliche Gesundheit bietet.'
  },
  {
    category: 'App-Name',
    prompt: 'Generiere einen kreativen und einprägsamen Namen für eine mobile App, inklusive einer kurzen Beschreibung der App-Funktionalität.'
  },
  {
    category: 'Alltagsproblem',
    prompt: 'Identifiziere ein alltägliches Problem und entwickle eine praktische, innovative Lösung dafür. Die Lösung sollte einfach umsetzbar sein.'
  }
]

export function PredefinedPrompts({ onSelectPrompt }: PredefinedPromptsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="text-sm"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          Prompt Predefiniti
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