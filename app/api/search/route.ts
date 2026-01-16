import { NextRequest, NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/mdx'

/**
 * Search articles with weighted scoring
 * Title matches score higher than description/content matches
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.toLowerCase().trim() || ''

    if (!query) {
      return NextResponse.json([])
    }

    const posts = getAllPosts()
    
    // Score and filter articles
    const results = posts
      .map(post => {
        let score = 0
        const title = post.frontMatter.title.toLowerCase()
        const description = post.frontMatter.description?.toLowerCase() || ''
        const tags = post.frontMatter.tags?.map(t => t.toLowerCase()) || []
        const author = post.frontMatter.author.toLowerCase()
        
        // Title match (highest weight)
        if (title.includes(query)) {
          score += 10
          // Exact match bonus
          if (title === query) score += 10
        }
        
        // Tag match (high weight)
        if (tags.some(tag => tag.includes(query))) {
          score += 5
        }
        
        // Description match (medium weight)
        if (description.includes(query)) {
          score += 3
        }
        
        // Author match (medium weight)
        if (author.includes(query)) {
          score += 3
        }
        
        // Category match (low weight)
        if (post.category.toLowerCase().includes(query)) {
          score += 2
        }

        return {
          slug: post.slug,
          category: post.category,
          title: post.frontMatter.title,
          excerpt: post.frontMatter.description || post.content.slice(0, 150) + '...',
          author: post.frontMatter.author,
          date: post.frontMatter.date,
          readTime: post.readingTime,
          featured: post.frontMatter.featured || false,
          tags: post.frontMatter.tags || [],
          score
        }
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Limit to top 10 results

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching articles:', error)
    return NextResponse.json([])
  }
}
