/**
 * Table of Contents Generator
 * Extracts headings from markdown content and generates a hierarchical TOC
 */

export interface TocItem {
  id: string
  title: string
  level: number
  url: string
}

/**
 * Generate table of contents from markdown content
 * Extracts H2 and H3 headings and creates anchor links
 */
export function generateTableOfContents(content: string): TocItem[] {
  const tocItems: TocItem[] = []
  
  // Match H1 (#) headings in markdown to replicate old blog behavior
  const headingRegex = /^(#{1})\s+(.+)$/gm
  let match
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length // 1 for H1
    const title = match[2].trim()
    
    // Generate URL-friendly ID from title (strip markdown syntax for ID)
    const cleanTitle = title.replace(/\*\*/g, '') // Remove ** for ID generation
    const id = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
    
    tocItems.push({
      id,
      title, // Keep ** in title for bold rendering
      level,
      url: `#${id}`
    })
  }
  
  return tocItems
}

/**
 * Process markdown content to add IDs to headings for TOC navigation
 */
export function addHeadingIds(htmlContent: string): string {
  // Add IDs to H2 and H3 tags in HTML
  return htmlContent.replace(
    /<(h[23])>(.*?)<\/\1>/gi,
    (match, tag, content) => {
      const id = content
        .replace(/<[^>]*>/g, '') // Strip HTML tags
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      return `<${tag} id="${id}">${content}</${tag}>`
    }
  )
}
