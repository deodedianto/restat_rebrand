import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Post } from '@/lib/mdx'

interface ArticleNavigationProps {
  previous: Post | null
  next: Post | null
}

export function ArticleNavigation({ previous, next }: ArticleNavigationProps) {
  if (!previous && !next) {
    return null
  }

  return (
    <div className="mt-12 border-t pt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Previous Article */}
        {previous ? (
          <Link
            href={`/artikel/${previous.slug}`}
            className="flex flex-col h-full min-h-[120px] group p-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm text-primary-foreground/80 mb-2">
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Article</span>
            </div>
            <h3 className="font-semibold group-hover:text-primary-foreground transition-colors line-clamp-2 flex-1">
              {previous.frontMatter.title}
            </h3>
          </Link>
        ) : (
          <div className="h-full min-h-[120px] bg-muted/30 rounded-lg" />
        )}

        {/* Next Article */}
        {next ? (
          <Link
            href={`/artikel/${next.slug}`}
            className="flex flex-col h-full min-h-[120px] group p-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-right"
          >
            <div className="flex items-center justify-end gap-2 text-sm text-primary-foreground/80 mb-2">
              <span>Next Article</span>
              <ChevronRight className="h-4 w-4" />
            </div>
            <h3 className="font-semibold group-hover:text-primary-foreground transition-colors line-clamp-2 flex-1">
              {next.frontMatter.title}
            </h3>
          </Link>
        ) : (
          <div className="h-full min-h-[120px] bg-muted/30 rounded-lg" />
        )}
      </div>
    </div>
  )
}
