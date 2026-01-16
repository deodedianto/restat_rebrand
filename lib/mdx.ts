import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface PostFrontMatter {
  title: string
  slug: string
  description: string
  date: string
  author: string
  category: string
  featured?: boolean
  image?: string
  thumbnailText?: string
  tags?: string[]
}

export interface Post {
  slug: string
  category: string
  frontMatter: PostFrontMatter
  content: string
  readingTime: string
}

/**
 * Get all blog posts from all categories
 */
export function getAllPosts(): Post[] {
  const posts: Post[] = []
  
  // Check if content directory exists
  if (!fs.existsSync(postsDirectory)) {
    return posts
  }

  // Read all category folders
  const categories = fs.readdirSync(postsDirectory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  // Read posts from each category
  for (const category of categories) {
    const categoryPath = path.join(postsDirectory, category)
    const postFolders = fs.readdirSync(categoryPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    for (const folder of postFolders) {
      const mdxPath = path.join(categoryPath, folder, 'index.mdx')
      
      if (fs.existsSync(mdxPath)) {
        const fileContents = fs.readFileSync(mdxPath, 'utf8')
        const { data, content } = matter(fileContents)
        const readTime = readingTime(content)

        posts.push({
          slug: folder,
          category: category,
          frontMatter: data as PostFrontMatter,
          content,
          readingTime: readTime.text
        })
      }
    }
  }

  // Sort posts by date (newest first)
  return posts.sort((a, b) => {
    const dateA = new Date(a.frontMatter.date)
    const dateB = new Date(b.frontMatter.date)
    return dateB.getTime() - dateA.getTime()
  })
}

/**
 * Get a single post by category and slug
 */
export function getPostBySlug(category: string, slug: string): Post | null {
  try {
    const mdxPath = path.join(postsDirectory, category, slug, 'index.mdx')
    
    if (!fs.existsSync(mdxPath)) {
      return null
    }

    const fileContents = fs.readFileSync(mdxPath, 'utf8')
    const { data, content } = matter(fileContents)
    const readTime = readingTime(content)

    return {
      slug,
      category,
      frontMatter: data as PostFrontMatter,
      content,
      readingTime: readTime.text
    }
  } catch (error) {
    console.error(`Error reading post ${category}/${slug}:`, error)
    return null
  }
}

/**
 * Get all posts in a specific category
 */
export function getPostsByCategory(category: string): Post[] {
  const allPosts = getAllPosts()
  return allPosts.filter(post => post.category === category)
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  return fs.readdirSync(postsDirectory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    'interpretasi-uji-statistik': 'Interpretasi Uji Statistik',
    'metode-penelitian': 'Metode Penelitian',
    'metode-statistik': 'Metode Statistik',
    'software-statistik': 'Software Statistik',
    'tutorial-analisis-statistik': 'Tutorial Analisis Statistik'
  }
  
  return categoryNames[category] || category
}

/**
 * Get featured posts
 */
export function getFeaturedPosts(): Post[] {
  const allPosts = getAllPosts()
  return allPosts.filter(post => post.frontMatter.featured === true)
}

/**
 * Search posts by query
 */
export function searchPosts(query: string): Post[] {
  const allPosts = getAllPosts()
  const lowerQuery = query.toLowerCase()
  
  return allPosts.filter(post => {
    const titleMatch = post.frontMatter.title.toLowerCase().includes(lowerQuery)
    const descMatch = post.frontMatter.description?.toLowerCase().includes(lowerQuery)
    const categoryMatch = post.category.toLowerCase().includes(lowerQuery)
    
    return titleMatch || descMatch || categoryMatch
  })
}
