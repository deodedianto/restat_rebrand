import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostBySlugOnly, getAllPosts, getRelatedPosts, getAdjacentPosts } from '@/lib/mdx'
import { getCategoryConfig } from '@/lib/categories'
import { generateTableOfContents } from '@/lib/generate-toc'
import { markdownToHtml } from '@/lib/markdown-renderer'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TableOfContents } from '@/components/article/table-of-contents'
import { RelatedPosts } from '@/components/article/related-posts'
import { ArticleTags } from '@/components/article/article-tags'
import { ArticleNavigation } from '@/components/article/article-navigation'
import { ReadingProgress } from '@/components/article/reading-progress'
import { ArticleCTA } from '@/components/article/article-cta'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Clock, User, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Process markdown content to HTML
function processMarkdownContent(content: string, category: string, folder: string): string {
  // Handle local images ONLY - replace relative paths with full paths
  // BUT: Don't touch http:// https:// or data: URIs
  // Use folder name (not slug) for image paths
  let processed = content.replace(
    /!\[(.*?)\]\((?!https?:\/\/|data:)([^)]+)\)/g,
    `![$1](/posts/${category}/${folder}/$2)`
  )
  
  // Convert markdown to HTML with heading IDs
  return markdownToHtml(processed)
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static params for all posts (SSG)
export async function generateStaticParams() {
  try {
    const posts = getAllPosts()
    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('[generateStaticParams] ERROR:', error)
    return []
  }
}

// Generate metadata for SEO - CRITICAL FOR SEO PRESERVATION
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlugOnly(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const { frontMatter } = post
  const canonicalUrl = `https://restatolahdata.id/artikel/${slug}`

  return {
    title: frontMatter.title,
    description: frontMatter.description,
    authors: [{ name: frontMatter.author }],
    keywords: frontMatter.tags?.join(', '),
    openGraph: {
      title: frontMatter.title,
      description: frontMatter.description,
      type: 'article',
      publishedTime: frontMatter.date,
      authors: [frontMatter.author],
      url: canonicalUrl,
      siteName: 'Restat Olah Data',
    },
    twitter: {
      card: 'summary_large_image',
      title: frontMatter.title,
      description: frontMatter.description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlugOnly(slug)

  if (!post) {
    notFound()
  }

  const { frontMatter, content, readingTime, category, folder } = post

  // Get category configuration
  const categoryConfig = getCategoryConfig(category)

  // Get related posts
  const relatedPosts = getRelatedPosts(slug, category, frontMatter.tags || [], 6)
  
  // Get previous/next posts
  const { previous, next } = getAdjacentPosts(slug)
  
  // Generate table of contents
  const tocItems = generateTableOfContents(content)
  
  // Format date
  const publishDate = new Date(frontMatter.date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Process content - use folder name for image paths
  const htmlContent = processMarkdownContent(content, category, folder)

  return (
    <main className="min-h-screen">
      <ReadingProgress />
      <Header />
      
      {/* Add top spacing to ensure content appears below fixed navbar */}
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Back button */}
          <Link 
            href="/artikel"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 mt-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Artikel</span>
          </Link>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Content */}
          <article className="min-w-0">
            {/* Category badge */}
            {categoryConfig && (
              <div className="mb-4">
                <Link
                  href={`/artikel?category=${category}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: `${categoryConfig.color}20`,
                    color: categoryConfig.color,
                    border: `1px solid ${categoryConfig.color}40`,
                  }}
                >
                  <categoryConfig.icon className="w-4 h-4" />
                  <span>{categoryConfig.name}</span>
                </Link>
              </div>
            )}

            {/* Article header */}
            <h1 className="text-5xl font-bold mb-4">{frontMatter.title}</h1>
            
            {/* Meta information */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{frontMatter.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={frontMatter.date}>{publishDate}</time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readingTime}</span>
              </div>
            </div>

            {/* Featured Image */}
            {frontMatter.thumbnail && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <Image
                  src={`/posts/${category}/${folder}/${frontMatter.thumbnail}`}
                  alt={frontMatter.thumbnailText || frontMatter.title}
                  width={1200}
                  height={630}
                  className="w-full h-auto"
                  priority
                />
              </div>
            )}

            {/* Article content */}
            <div 
              className="prose prose-lg dark:prose-invert max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Tags */}
            {frontMatter.tags && frontMatter.tags.length > 0 && (
              <div className="mt-8">
                <ArticleTags tags={frontMatter.tags} />
              </div>
            )}

            {/* CTA Section */}
            <ArticleCTA />

            {/* Previous/Next Navigation */}
            <ArticleNavigation previous={previous} next={next} />
          </article>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            {/* Table of Contents */}
            {tocItems.length > 0 && <TableOfContents items={tocItems} />}
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
          </aside>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
