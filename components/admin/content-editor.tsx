"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { 
  Eye, 
  Code, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3,
  Link,
  Image as ImageIcon,
  Quote,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
}

export function ContentEditor({ value, onChange, label, placeholder }: ContentEditorProps) {
  const [mode, setMode] = useState<"markdown" | "wysiwyg">("markdown")
  const [showPreview, setShowPreview] = useState(false)

  // Markdown toolbar actions
  const insertMarkdown = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end) || placeholder
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // WYSIWYG toolbar actions
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
  }

  // Convert markdown to HTML for preview/WYSIWYG
  const markdownToHtml = (markdown: string) => {
    let html = markdown
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    
    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" class="text-blue-600 hover:underline">$1</a>')
    
    // Images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto" />')
    
    // Unordered lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc pl-6">$1</ul>')
    
    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>')
    
    // Line breaks
    html = html.replace(/\n/gim, '<br />')
    
    return html
  }

  // Convert HTML back to markdown (basic conversion)
  const htmlToMarkdown = (html: string) => {
    let markdown = html
    
    // Headers
    markdown = markdown.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n')
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n')
    markdown = markdown.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n')
    
    // Bold
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    markdown = markdown.replace(/<b>(.*?)<\/b>/gi, '**$1**')
    
    // Italic
    markdown = markdown.replace(/<em>(.*?)<\/em>/gi, '*$1*')
    markdown = markdown.replace(/<i>(.*?)<\/i>/gi, '*$1*')
    
    // Links
    markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    
    // Images
    markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    
    // Lists
    markdown = markdown.replace(/<li>(.*?)<\/li>/gi, '* $1\n')
    markdown = markdown.replace(/<ul[^>]*>|<\/ul>/gi, '')
    markdown = markdown.replace(/<ol[^>]*>|<\/ol>/gi, '')
    
    // Blockquotes
    markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n')
    
    // Line breaks
    markdown = markdown.replace(/<br\s*\/?>/gi, '\n')
    
    // Remove remaining HTML tags
    markdown = markdown.replace(/<[^>]*>/g, '')
    
    return markdown.trim()
  }

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "markdown" ? "default" : "outline"}
            onClick={() => setMode("markdown")}
          >
            <Code className="w-4 h-4 mr-2" />
            Markdown
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "wysiwyg" ? "default" : "outline"}
            onClick={() => {
              setMode("wysiwyg")
              setShowPreview(false)
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            WYSIWYG
          </Button>
        </div>
        
        {mode === "markdown" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
        )}
      </div>

      {/* Markdown Mode */}
      {mode === "markdown" && (
        <div className="space-y-3">
          {/* Markdown Toolbar */}
          <Card className="p-2">
            <div className="flex flex-wrap gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertMarkdown("**", "**", "bold text")}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertMarkdown("*", "*", "italic text")}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <div className="w-px bg-border mx-1" />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertMarkdown("# ", "", "Heading 1")}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertMarkdown("## ", "", "Heading 2")}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertMarkdown("### ", "", "Heading 3")}
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </Button>
              <div className="w-px bg-border mx-1" />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertMarkdown("* ", "", "List item")}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertMarkdown("1. ", "", "List item")}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
              <div className="w-px bg-border mx-1" />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertMarkdown("[", "](url)", "link text")}
                title="Link"
              >
                <Link className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertMarkdown("![", "](image-url)", "alt text")}
                title="Image"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => insertMarkdown("> ", "", "Quote")}
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Editor and Preview Side by Side */}
          <div className={cn("grid gap-3", showPreview ? "grid-cols-2" : "grid-cols-1")}>
            <div>
              <Textarea
                id="content-editor"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || "# Judul Artikel\n\nTulis konten artikel dalam format Markdown..."}
                rows={20}
                className="font-mono text-sm resize-none"
              />
            </div>
            
            {showPreview && (
              <Card className="p-4 overflow-y-auto max-h-[500px]">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
                />
              </Card>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Gunakan Markdown syntax. <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" className="text-blue-600 hover:underline">Panduan Markdown</a>
          </p>
        </div>
      )}

      {/* WYSIWYG Mode */}
      {mode === "wysiwyg" && (
        <div className="space-y-3">
          {/* WYSIWYG Toolbar */}
          <Card className="p-2">
            <div className="flex flex-wrap gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand("bold")}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand("italic")}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <div className="w-px bg-border mx-1" />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand("formatBlock", "h1")}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand("formatBlock", "h2")}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand("formatBlock", "h3")}
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </Button>
              <div className="w-px bg-border mx-1" />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand("insertUnorderedList")}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => execCommand("insertOrderedList")}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
              <div className="w-px bg-border mx-1" />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  const url = prompt("Enter URL:")
                  if (url) execCommand("createLink", url)
                }}
                title="Link"
              >
                <Link className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  const url = prompt("Enter image URL:")
                  if (url) execCommand("insertImage", url)
                }}
                title="Image"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* WYSIWYG Editor */}
          <Card className="p-4">
            <div
              contentEditable
              className="min-h-[400px] prose prose-sm max-w-none focus:outline-none"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
              onInput={(e) => {
                const html = e.currentTarget.innerHTML
                const markdown = htmlToMarkdown(html)
                onChange(markdown)
              }}
              onBlur={(e) => {
                const html = e.currentTarget.innerHTML
                const markdown = htmlToMarkdown(html)
                onChange(markdown)
              }}
            />
          </Card>

          <p className="text-xs text-muted-foreground">
            Mode WYSIWYG - Edit langsung dengan tampilan visual. Konten akan disimpan sebagai Markdown.
          </p>
        </div>
      )}
    </div>
  )
}
