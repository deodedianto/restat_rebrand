"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Users } from 'lucide-react'

interface Author {
  name: string
  title: string
  description: string
  thumbnail: string
  social?: { name: string; url: string }[]
  skills?: string[]
  slug: string
}

export function AuthorsMenu() {
  const [authors, setAuthors] = useState<Author[]>([])

  useEffect(() => {
    fetch('/api/authors')
      .then(res => res.json())
      .then(data => setAuthors(data))
      .catch(err => console.error('Error fetching authors:', err))
  }, [])

  if (authors.length === 0) {
    return null
  }

  return (
    <Card className="p-6 hidden lg:block">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">Tim Restat</h3>
      </div>
      
      <div className="space-y-4">
        {authors.map((author) => (
          <div
            key={author.slug}
            className="flex items-center gap-3 group hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
          >
            {/* Author Avatar */}
            <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-white border-2 border-gray-200 flex items-center justify-center">
              <img
                src={author.thumbnail ? `/authors/${author.thumbnail}` : '/authors/logo-besar.png'}
                alt={author.name}
                className={author.thumbnail ? "object-cover w-full h-full" : "object-contain w-8 h-8 p-1"}
              />
            </div>

            {/* Author Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                {author.name}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {author.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
