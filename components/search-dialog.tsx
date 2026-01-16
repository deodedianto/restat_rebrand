"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search, Calendar, Clock, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SearchResult {
  slug: string
  category: string
  title: string
  excerpt: string
  author: string
  date: string
  readTime: string
  featured: boolean
  tags: string[]
  score: number
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Search with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data)
        setSelectedIndex(0)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [query])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault()
        navigateToResult(results[selectedIndex])
      }
    },
    [results, selectedIndex]
  )

  const navigateToResult = (result: SearchResult) => {
    router.push(`/artikel/${result.slug}`)
    onOpenChange(false)
    setQuery('')
    setResults([])
  }

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0 sr-only">
          <DialogTitle>Cari Artikel</DialogTitle>
        </DialogHeader>
        
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b">
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder="Cari artikel... (Cmd+K atau Ctrl+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base p-0 h-auto"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading && (
            <div className="p-8 text-center text-muted-foreground">
              Mencari...
            </div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Tidak ada artikel ditemukan
            </div>
          )}

          {!query && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <p>Ketik untuk mencari artikel berdasarkan judul, tag, atau penulis</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.slug}
                  onClick={() => navigateToResult(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${
                    index === selectedIndex ? 'bg-muted' : ''
                  }`}
                >
                  <h3 className="font-semibold mb-1 line-clamp-1">
                    {result.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {result.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(result.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{result.readTime}</span>
                    </div>
                    {result.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <div className="flex gap-1">
                          {result.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs px-1.5 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t px-4 py-2 text-xs text-muted-foreground bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">↓</kbd>
              navigasi
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Enter</kbd>
              pilih
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Esc</kbd>
              tutup
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
