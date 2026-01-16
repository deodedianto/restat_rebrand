import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/mdx'

export async function GET() {
  try {
    const posts = getAllPosts()
    
    // Transform posts for client consumption
    const articles = posts.map(post => ({
      slug: post.slug,
      category: post.category,
      title: post.frontMatter.title,
      excerpt: post.frontMatter.description || post.content.slice(0, 150) + '...',
      author: post.frontMatter.author,
      date: post.frontMatter.date,
      readTime: post.readingTime,
      featured: post.frontMatter.featured || false,
      tags: post.frontMatter.tags || [],
    }))

    return NextResponse.json(articles)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json([])
  }
}
