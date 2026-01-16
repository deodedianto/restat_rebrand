import Link from 'next/link'
import { Post } from '@/lib/mdx'
import { Card } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'

interface RelatedPostsProps {
  posts: Post[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <Card className="p-6 hidden lg:block">
      <h3 className="text-lg font-bold mb-4">Related Posts</h3>
      <div className="space-y-4">
        {posts.map((post) => {
          const publishDate = new Date(post.frontMatter.date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })

          return (
            <Link
              key={post.slug}
              href={`/artikel/${post.slug}`}
              className="block group hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
            >
              <h4 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {post.frontMatter.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{publishDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.readingTime}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
