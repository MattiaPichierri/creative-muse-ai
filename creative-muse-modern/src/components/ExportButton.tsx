'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, FileJson } from 'lucide-react'
import { type Idea } from '@/lib/api'

interface ExportButtonProps {
  ideas: Idea[]
}

export function ExportButton({ ideas }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToJSON = () => {
    setIsExporting(true)
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        totalIdeas: ideas.length,
        ideas: ideas,
        metadata: {
          version: '2.0.0',
          source: 'Creative Muse AI'
        }
      }

      const dataBlob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })

      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `creative-muse-ideas-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Errore durante l\'export JSON:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToMarkdown = () => {
    setIsExporting(true)
    try {
      const markdown = `# Creative Muse AI - Idee Generate

**Data Export:** ${new Date().toLocaleDateString('it-IT')}  
**Totale Idee:** ${ideas.length}

---

${ideas.map((idea, index) => `
## ${index + 1}. ${idea.title}

**Categoria:** ${idea.category}  
**Data:** ${new Date(idea.created_at).toLocaleDateString('it-IT')}  
**Metodo:** ${idea.generation_method}  
${idea.rating ? `**Rating:** ${'⭐'.repeat(idea.rating)}` : ''}

${idea.content}

---
`).join('\n')}

*Generato da Creative Muse AI*
`

      const dataBlob = new Blob([markdown], {
        type: 'text/markdown'
      })

      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `creative-muse-ideas-${new Date().toISOString().split('T')[0]}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Errore durante l\'export Markdown:', error)
    } finally {
      setIsExporting(false)
    }
  }

  if (ideas.length === 0) {
    return (
      <Button variant="ghost" size="sm" disabled title="Nessuna idea da esportare">
        <Download className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={isExporting}
          title="Esporta idee"
        >
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToJSON} disabled={isExporting}>
          <FileJson className="h-4 w-4 mr-2" />
          Esporta JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToMarkdown} disabled={isExporting}>
          <FileText className="h-4 w-4 mr-2" />
          Esporta Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}