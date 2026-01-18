import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const postsDirectory = path.join(process.cwd(), 'content/posts')

// Cache for posts to avoid re-reading files during build
let cachedPosts: Post[] | null = null

export interface PostFrontMatter {
  title: string
  slug: string
  description: string
  date: string
  author: string
  category: string
  featured?: boolean
  image?: string
  thumbnail?: string
  thumbnailText?: string
  tags?: string[]
}

export interface Post {
  slug: string
  folder: string // Original folder name (used for image paths)
  category: string
  frontMatter: PostFrontMatter
  content: string
  readingTime: string
}

/**
 * Get all blog posts from all categories
 * Now with caching to improve build performance
 */
export function getAllPosts(): Post[] {
  // Return cached posts if available
  if (cachedPosts !== null) {
    return cachedPosts
  }

  const posts: Post[] = []
  
  // Check if content directory exists
  if (!fs.existsSync(postsDirectory)) {
    cachedPosts = posts
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
        try {
          const fileContents = fs.readFileSync(mdxPath, 'utf8')
          const { data, content } = matter(fileContents)
          const readTime = readingTime(content)

          // Use slug from frontmatter if available, otherwise use folder name
          // Slugify: lowercase and replace spaces with hyphens
          const slug = data.slug 
            ? String(data.slug).toLowerCase().replace(/\s+/g, '-')
            : folder

          posts.push({
            slug,
            folder, // Store original folder name for image paths
            category: category,
            frontMatter: data as PostFrontMatter,
            content,
            readingTime: readTime.text
          })
        } catch (error) {
          console.error(`Error reading post ${category}/${folder}:`, error)
          // Continue with other posts
        }
      }
    }
  }

  // Sort posts by date (newest first)
  cachedPosts = posts.sort((a, b) => {
    const dateA = new Date(a.frontMatter.date)
    const dateB = new Date(b.frontMatter.date)
    return dateB.getTime() - dateA.getTime()
  })

  return cachedPosts
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
      folder: slug, // In this case, slug is the folder name
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
 * Get a single post by slug only (searches across all categories)
 * This matches the old blog URL structure: blog.restatolahdata.id/{slug}
 */
export function getPostBySlugOnly(slug: string): Post | null {
  const allPosts = getAllPosts()
  return allPosts.find(post => post.slug === slug) || null
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

/**
 * Get related posts based on category and tags
 * Priority: 1. Same category + matching tags, 2. Matching tags, 3. Same category
 */
export function getRelatedPosts(
  currentSlug: string,
  category: string,
  tags: string[] = [],
  limit: number = 6
): Post[] {
  const allPosts = getAllPosts().filter(post => post.slug !== currentSlug)
  
  // Score each post based on relevance
  const scoredPosts = allPosts.map(post => {
    let score = 0
    const postTags = post.frontMatter.tags || []
    
    // Same category bonus
    if (post.category === category) {
      score += 10
    }
    
    // Matching tags bonus (5 points per matching tag)
    const matchingTags = postTags.filter(tag => tags.includes(tag))
    score += matchingTags.length * 5
    
    return { post, score }
  })
  
  // Sort by score (highest first) and take top N
  return scoredPosts
    .filter(item => item.score > 0) // Only include posts with some relevance
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post)
}

/**
 * Get previous and next posts chronologically
 */
export function getAdjacentPosts(slug: string): {
  previous: Post | null
  next: Post | null
} {
  const allPosts = getAllPosts() // Already sorted by date (newest first)
  const currentIndex = allPosts.findIndex(post => post.slug === slug)
  
  if (currentIndex === -1) {
    return { previous: null, next: null }
  }
  
  return {
    previous: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
    next: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  }
}
