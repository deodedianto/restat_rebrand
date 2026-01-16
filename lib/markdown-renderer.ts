/**
 * Generate URL-friendly ID from heading text
 */
function generateHeadingId(text: string): string {
  // First strip markdown syntax like ** for bold
  const cleanText = text.replace(/\*\*/g, '')
  
  return cleanText
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Markdown to HTML converter
 * Preserves external image URLs and base64 data URIs without modification
 * Adds IDs to H1 headings for TOC navigation
 */
export function markdownToHtml(markdown: string): string {
  // Store existing HTML img tags to preserve them
  const imgTags: string[] = []
  let html = markdown.replace(/<img[^>]*>/gi, (match) => {
    imgTags.push(match)
    return `___IMG_PLACEHOLDER_${imgTags.length - 1}___`
  })
  
  // Convert headings with IDs for TOC navigation (must be done in order from h6 to h1 to avoid conflicts)
  html = html.replace(/^###### (.*$)/gim, '<h6 class="text-lg font-semibold mt-6 mb-3">$1</h6>')
  html = html.replace(/^##### (.*$)/gim, '<h5 class="text-xl font-semibold mt-6 mb-3">$1</h5>')
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-2xl font-semibold mt-8 mb-4">$1</h4>')
  
  // H3 with ID for TOC
  html = html.replace(/^### (.*$)/gim, (match, text) => {
    const id = generateHeadingId(text)
    // Convert **text** to <strong>text</strong> in heading
    const formattedText = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    return `<h3 id="${id}" class="text-3xl font-bold mt-8 mb-4">${formattedText}</h3>`
  })
  
  // H2 with ID for TOC
  html = html.replace(/^## (.*$)/gim, (match, text) => {
    const id = generateHeadingId(text)
    // Convert **text** to <strong>text</strong> in heading
    const formattedText = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    return `<h2 id="${id}" class="text-4xl font-bold mt-10 mb-6">${formattedText}</h2>`
  })
  
  // H1 with ID for TOC
  html = html.replace(/^# (.*$)/gim, (match, text) => {
    const id = generateHeadingId(text)
    // Convert **text** to <strong>text</strong> in heading
    const formattedText = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    return `<h1 id="${id}" class="text-5xl font-bold mt-10 mb-6">${formattedText}</h1>`
  })
  
  // Convert markdown images to HTML
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy" style="max-width: 100%; height: auto; display: block; margin: 1.5rem 0;" />'
  )
  
  // Restore original HTML img tags (this preserves base64 data intact)
  html = html.replace(/___IMG_PLACEHOLDER_(\d+)___/g, (match, index) => {
    return imgTags[parseInt(index)]
  })
  
  // Convert links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
  )
  
  // Convert bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>')
  
  // Convert italic
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
  
  // Convert code blocks
  html = html.replace(/```([^`]+)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>')
  
  // Convert inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">$1</code>')
  
  // Convert bullet lists
  html = html.replace(/^\* (.+)$/gim, '<li class="ml-6 list-disc">$1</li>')
  html = html.replace(/(<li class="ml-6 list-disc">.*<\/li>)/s, '<ul class="my-4">$1</ul>')
  
  // Convert numbered lists  
  html = html.replace(/^\d+\. (.+)$/gim, '<li class="ml-6 list-decimal">$1</li>')
  html = html.replace(/(<li class="ml-6 list-decimal">.*<\/li>)/s, '<ol class="my-4">$1</ol>')
  
  // Convert paragraphs (double newlines)
  html = html.replace(/\n\n+/g, '</p><p class="my-4">')
  html = '<p class="my-4">' + html + '</p>'
  
  return html
}
