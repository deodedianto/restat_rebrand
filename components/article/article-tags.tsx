import Link from 'next/link'
import { Tag } from 'lucide-react'

interface ArticleTagsProps {
  tags: string[]
}

export function ArticleTags({ tags }: ArticleTagsProps) {
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      <Tag className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-semibold text-muted-foreground">Tags:</span>
      {tags.map((tag, index) => (
        <Link
          key={index}
          href={`/artikel?tag=${encodeURIComponent(tag)}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary hover:bg-secondary/80 transition-colors"
        >
          {tag}
        </Link>
      ))}
    </div>
  )
}
