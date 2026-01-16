'use client'

import { TocItem } from '@/lib/generate-toc'
import { Card } from '@/components/ui/card'

interface TableOfContentsProps {
  items: TocItem[]
}

function processTitle(title: string): React.ReactNode {
  // Split by ** to find bold sections
  const parts = title.split('**')
  
  return parts.map((part, index) => {
    // Odd indices are bold (between **)
    if (index % 2 === 1) {
      return <strong key={index} className="font-bold">{part}</strong>
    }
    return part
  })
}

export function TableOfContents({ items }: TableOfContentsProps) {
  if (items.length === 0) {
    return null
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault()
    const targetId = url.replace('#', '')
    const element = document.getElementById(targetId)
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Update URL without scrolling
      window.history.pushState(null, '', url)
    }
  }

  return (
    <Card className="p-6 hidden lg:block">
      <h3 className="text-lg font-bold mb-4">Table Of Contents</h3>
      <nav className="space-y-3">
        {items.map((item, index) => {
          return (
            <a
              key={`toc-${index}`}
              href={item.url}
              onClick={(e) => handleClick(e, item.url)}
              className="grid grid-cols-[56px_1fr] gap-3 text-sm hover:text-primary transition-colors items-center"
            >
              {/* Left column: Fixed width for circle (with potential indent) */}
              <div className={`flex items-center ${item.level === 3 ? 'justify-end' : 'justify-start'}`}>
                <div className="flex items-center justify-center min-w-[24px] w-6 h-6 rounded-full bg-muted text-muted-foreground font-medium text-xs">
                  {index + 1}
                </div>
              </div>
              {/* Right column: Text always starts at same position */}
              <span className="leading-normal">{processTitle(item.title)}</span>
            </a>
          )
        })}
      </nav>
    </Card>
  )
}
