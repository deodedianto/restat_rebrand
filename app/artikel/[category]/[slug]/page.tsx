import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getPostBySlug, getAllPosts, getCategoryDisplayName } from '@/lib/mdx'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'

interface PageProps {
  params: {
    category: string
    slug: string
  }
}

// Generate static params for all posts (SSG)
export async function generateStaticParams() {
  const posts = getAllPosts()
  
  return posts.map((post) => ({
    category: post.category,
    slug: post.slug,
  }))
}

// Generate metadata for SEO - CRITICAL FOR SEO PRESERVATION
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPostBySlug(params.category, params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const { frontMatter, category } = post
  const canonicalUrl = `https://restatolahdata.id/artikel/${category}/${params.slug}`

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

export default function ArticlePage({ params }: PageProps) {
  const post = getPostBySlug(params.category, params.slug)

  if (!post) {
    notFound()
  }

  const { frontMatter, content, readingTime, category } = post

  // Format date
  const publishDate = new Date(frontMatter.date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <Link 
          href="/artikel"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Artikel</span>
        </Link>

        {/* Category badge */}
        <div className="mb-4">
          <Link
            href={`/artikel?category=${category}`}
            className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            {getCategoryDisplayName(category)}
          </Link>
        </div>

        {/* Article header */}
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-4">{frontMatter.title}</h1>
          
          {/* Meta information */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8 not-prose">
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

          {/* Article content */}
          <div className="mt-8">
            <MDXRemote source={content} />
          </div>
        </article>

        {/* CTA Section */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg border border-blue-100 dark:border-blue-900">
          <h3 className="text-xl font-bold mb-2">Punya masalah analisis data?</h3>
          <p className="text-muted-foreground mb-4">
            Konsultasikan dengan ahli statistik kami sekarang!
          </p>
          <Link
            href="/register"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            Konsultasi Sekarang
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
