import fs from 'fs'
import path from 'path'

const authorsDirectory = path.join(process.cwd(), 'content/authors')

export interface AuthorSocial {
  name: string
  url: string
}

export interface Author {
  name: string
  title: string
  description: string
  thumbnail: string
  social?: AuthorSocial[]
  skills?: string[]
  slug: string
}

/**
 * Get all authors
 */
export function getAllAuthors(): Author[] {
  if (!fs.existsSync(authorsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(authorsDirectory)
  const authors: Author[] = []

  for (const fileName of fileNames) {
    if (fileName.endsWith('.json')) {
      const filePath = path.join(authorsDirectory, fileName)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const author = JSON.parse(fileContents) as Author
      authors.push(author)
    }
  }

  return authors
}

/**
 * Get author by name (exact match)
 */
export function getAuthorByName(name: string): Author | null {
  const authors = getAllAuthors()
  return authors.find(author => author.name === name) || null
}

/**
 * Get author by slug
 */
export function getAuthorBySlug(slug: string): Author | null {
  const authors = getAllAuthors()
  return authors.find(author => author.slug === slug) || null
}
