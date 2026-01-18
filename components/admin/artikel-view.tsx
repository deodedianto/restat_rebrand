"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SeoPreview } from "@/components/admin/seo-preview"
import { ContentEditor } from "@/components/admin/content-editor"
import { Pencil, Trash2, Plus, Search, ArrowUp, ArrowDown, Eye, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

// This is a simplified version - you'll need to add the full sample data from the main admin page
const sampleArticles = [
  {
    id: "1",
    title: "Cara Membaca Hasil Output Amos",
    slug: "cara-membaca-hasil-output-amos",
    description: "Interpretasi Output Amos lengkap",
    date: "2023-03-23T14:59:00.000Z",
    featured: true,
    draft: false,
    private: false,
    authorId: "1",
    categoryId: "1",
    externalLink: "",
    thumbnail: "",
    thumbnailText: "",
    bodyMarkdown: "# Content here...",
    tags: ["AMOS", "SEM"],
    keywords: ["amos", "sem"],
  },
]

const sampleAuthors = [
  { 
    id: "1", 
    name: "Muhammad Herdi", 
    slug: "muhammad-herdi", 
    title: "Statistical Analyst", 
    description: "Expert in statistical analysis with 10+ years experience", 
    photo: "/authors/herdi.jpg", 
    socialMedia: [
      { platform: "LinkedIn", url: "https://linkedin.com/in/muhammad-herdi" },
      { platform: "Twitter", url: "https://twitter.com/mherdi" }
    ], 
    skills: ["SPSS", "AMOS", "R", "Python"] 
  },
  { 
    id: "2", 
    name: "Kadek Aris", 
    slug: "kadek-aris", 
    title: "Data Scientist", 
    description: "Passionate about data science and machine learning", 
    photo: "/authors/aris.jpg", 
    socialMedia: [], 
    skills: ["Python", "Machine Learning", "Statistics"] 
  },
]

const sampleCategories = [
  { id: "1", name: "Interpretasi Hasil", slug: "interpretasi-hasil", description: "Cara membaca hasil analisis statistik", color: "#82c3ec", icon: "📊" },
  { id: "2", name: "Metode Statistik", slug: "metode-statistik", description: "Berbagai metode analisis statistik", color: "#f97316", icon: "📈" },
  { id: "3", name: "Software Statistik", slug: "software-statistik", description: "Tutorial penggunaan software statistik", color: "#8b5cf6", icon: "💻" },
]

export function ArtikelView() {
  const [artikelTab, setArtikelTab] = useState<"articles" | "authors" | "categories">("articles")
  const [articles, setArticles] = useState(sampleArticles)
  const [authors, setAuthors] = useState(sampleAuthors)
  const [categories, setCategories] = useState(sampleCategories)
  
  // Article filters
  const [articleSearchQuery, setArticleSearchQuery] = useState("")
  const [articleFilterCategory, setArticleFilterCategory] = useState("")
  const [articleFilterAuthor, setArticleFilterAuthor] = useState("")
  const [articleFilterDraft, setArticleFilterDraft] = useState<boolean | null>(null)
  const [articleFilterFeatured, setArticleFilterFeatured] = useState<boolean | null>(null)
  const [articleSortBy, setArticleSortBy] = useState<"title" | "date">("date")
  const [articleSortOrder, setArticleSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])

  // Article form state
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<any>(null)
  const [articleFormData, setArticleFormData] = useState<any>({})

  // Author form state
  const [isAuthorDialogOpen, setIsAuthorDialogOpen] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<any>(null)
  const [authorFormData, setAuthorFormData] = useState<any>({})

  // Category form state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [categoryFormData, setCategoryFormData] = useState<any>({})

  // Helper functions
  const getFilteredArticles = () => {
    let filtered = [...articles]
    if (articleSearchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(articleSearchQuery.toLowerCase())
      )
    }
    if (articleFilterCategory) {
      filtered = filtered.filter(article => article.categoryId === articleFilterCategory)
    }
    if (articleFilterAuthor) {
      filtered = filtered.filter(article => article.authorId === articleFilterAuthor)
    }
    if (articleFilterDraft !== null) {
      filtered = filtered.filter(article => article.draft === articleFilterDraft)
    }
    if (articleFilterFeatured !== null) {
      filtered = filtered.filter(article => article.featured === articleFilterFeatured)
    }
    
    filtered.sort((a, b) => {
      let comparison = 0
      if (articleSortBy === "title") {
        comparison = a.title.localeCompare(b.title)
      } else if (articleSortBy === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      return articleSortOrder === "asc" ? comparison : -comparison
    })
    
    return filtered
  }

  const getAuthorName = (authorId: string) => authors.find(a => a.id === authorId)?.name || "Unknown"
  const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || "Unknown"
  const getCategoryColor = (categoryId: string) => categories.find(c => c.id === categoryId)?.color || "#gray"

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleOpenArticleDialog = (article?: any) => {
    if (article) {
      setEditingArticle(article)
      setArticleFormData(article)
    } else {
      setEditingArticle(null)
      const newId = (Math.max(...articles.map(a => parseInt(a.id))) + 1).toString()
      setArticleFormData({
        id: newId,
        title: "",
        slug: "",
        description: "",
        date: new Date().toISOString(),
        featured: false,
        draft: true,
        private: false,
        authorId: authors[0]?.id || "",
        categoryId: categories[0]?.id || "",
        externalLink: "",
        thumbnail: "",
        thumbnailText: "",
        bodyMarkdown: "",
        tags: [],
        keywords: [],
      })
    }
    setIsArticleDialogOpen(true)
  }

  const handleSaveArticle = () => {
    if (!articleFormData.title || !articleFormData.slug) {
      alert("Title dan Slug harus diisi!")
      return
    }
    
    if (editingArticle) {
      setArticles(articles.map(a => a.id === articleFormData.id ? articleFormData : a))
      alert("Artikel berhasil diupdate!")
    } else {
      setArticles([...articles, articleFormData])
      alert("Artikel berhasil ditambahkan!")
    }
    
    setIsArticleDialogOpen(false)
    setEditingArticle(null)
  }

  const handleDeleteArticle = (article: any) => {
    if (confirm(`Yakin ingin menghapus artikel "${article.title}"?`)) {
      setArticles(articles.filter(a => a.id !== article.id))
      alert("Artikel berhasil dihapus!")
    }
  }

  const handleDuplicateArticle = (article: any) => {
    const newId = (Math.max(...articles.map(a => parseInt(a.id))) + 1).toString()
    const duplicatedArticle = {
      ...article,
      id: newId,
      title: `${article.title} (Copy)`,
      slug: `${article.slug}-copy-${newId}`,
      draft: true,
      featured: false,
      date: new Date().toISOString(),
    }
    setArticles([...articles, duplicatedArticle])
    alert("Artikel berhasil diduplikasi!")
  }

  // Bulk actions
  const handleSelectAll = () => {
    const filteredArticles = getFilteredArticles()
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([])
    } else {
      setSelectedArticles(filteredArticles.map(a => a.id))
    }
  }

  const handleSelectArticle = (articleId: string) => {
    if (selectedArticles.includes(articleId)) {
      setSelectedArticles(selectedArticles.filter(id => id !== articleId))
    } else {
      setSelectedArticles([...selectedArticles, articleId])
    }
  }

  const handleBulkDelete = () => {
    if (selectedArticles.length === 0) return
    if (confirm(`Yakin ingin menghapus ${selectedArticles.length} artikel?`)) {
      setArticles(articles.filter(a => !selectedArticles.includes(a.id)))
      setSelectedArticles([])
      alert("Artikel berhasil dihapus!")
    }
  }

  const handleBulkChangeStatus = (isDraft: boolean) => {
    if (selectedArticles.length === 0) return
    setArticles(articles.map(a => 
      selectedArticles.includes(a.id) ? { ...a, draft: isDraft } : a
    ))
    setSelectedArticles([])
    alert(`Status ${selectedArticles.length} artikel berhasil diubah!`)
  }

  // Author management functions
  const handleOpenAuthorDialog = (author?: any) => {
    if (author) {
      setEditingAuthor(author)
      setAuthorFormData(author)
    } else {
      setEditingAuthor(null)
      const newId = (Math.max(...authors.map(a => parseInt(a.id))) + 1).toString()
      setAuthorFormData({
        id: newId,
        name: "",
        slug: "",
        title: "",
        description: "",
        photo: "",
        socialMedia: [],
        skills: [],
      })
    }
    setIsAuthorDialogOpen(true)
  }

  const handleSaveAuthor = () => {
    if (!authorFormData.name || !authorFormData.slug) {
      alert("Nama dan Slug harus diisi!")
      return
    }
    
    if (editingAuthor) {
      setAuthors(authors.map(a => a.id === authorFormData.id ? authorFormData : a))
      alert("Penulis berhasil diupdate!")
    } else {
      setAuthors([...authors, authorFormData])
      alert("Penulis berhasil ditambahkan!")
    }
    
    setIsAuthorDialogOpen(false)
    setEditingAuthor(null)
  }

  const handleDeleteAuthor = (author: any) => {
    const articlesUsingAuthor = articles.filter(a => a.authorId === author.id)
    if (articlesUsingAuthor.length > 0) {
      alert(`Tidak dapat menghapus penulis ini karena masih digunakan oleh ${articlesUsingAuthor.length} artikel!`)
      return
    }
    if (confirm(`Yakin ingin menghapus penulis "${author.name}"?`)) {
      setAuthors(authors.filter(a => a.id !== author.id))
      alert("Penulis berhasil dihapus!")
    }
  }

  // Category management functions
  const handleOpenCategoryDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category)
      setCategoryFormData(category)
    } else {
      setEditingCategory(null)
      const newId = (Math.max(...categories.map(c => parseInt(c.id))) + 1).toString()
      setCategoryFormData({
        id: newId,
        name: "",
        slug: "",
        description: "",
        color: "#3b82f6",
        icon: "",
      })
    }
    setIsCategoryDialogOpen(true)
  }

  const handleSaveCategory = () => {
    if (!categoryFormData.name || !categoryFormData.slug) {
      alert("Nama dan Slug harus diisi!")
      return
    }
    
    if (editingCategory) {
      setCategories(categories.map(c => c.id === categoryFormData.id ? categoryFormData : c))
      alert("Kategori berhasil diupdate!")
    } else {
      setCategories([...categories, categoryFormData])
      alert("Kategori berhasil ditambahkan!")
    }
    
    setIsCategoryDialogOpen(false)
    setEditingCategory(null)
  }

  const handleDeleteCategory = (category: any) => {
    const articlesUsingCategory = articles.filter(a => a.categoryId === category.id)
    if (articlesUsingCategory.length > 0) {
      alert(`Tidak dapat menghapus kategori ini karena masih digunakan oleh ${articlesUsingCategory.length} artikel!`)
      return
    }
    if (confirm(`Yakin ingin menghapus kategori "${category.name}"?`)) {
      setCategories(categories.filter(c => c.id !== category.id))
      alert("Kategori berhasil dihapus!")
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Artikel</h2>
        <p className="text-slate-600 mt-1">Kelola artikel dan konten blog</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setArtikelTab("articles")}
          className={cn(
            "px-4 py-2 font-medium transition-colors border-b-2",
            artikelTab === "articles"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Artikel
        </button>
        <button
          onClick={() => setArtikelTab("authors")}
          className={cn(
            "px-4 py-2 font-medium transition-colors border-b-2",
            artikelTab === "authors"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Penulis
        </button>
        <button
          onClick={() => setArtikelTab("categories")}
          className={cn(
            "px-4 py-2 font-medium transition-colors border-b-2",
            artikelTab === "categories"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Kategori
        </button>
      </div>

      {/* Articles Tab */}
      {artikelTab === "articles" && (
        <div>
          {/* Bulk Actions */}
          {selectedArticles.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">
                {selectedArticles.length} artikel dipilih
              </span>
              <Button size="sm" variant="outline" onClick={() => handleBulkChangeStatus(false)}>
                Publish
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkChangeStatus(true)}>
                Draft
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                Hapus
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedArticles([])}>
                Batal
              </Button>
            </div>
          )}

          <div className="flex justify-end mb-6">
            <Button className="gap-2" onClick={() => handleOpenArticleDialog()}>
              <Plus className="w-4 h-4" />
              Tambah Artikel
            </Button>
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Cari artikel..."
                      value={articleSearchQuery}
                      onChange={(e) => setArticleSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                {/* Add more filters here */}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  variant={articleFilterFeatured === true ? "default" : "outline"}
                  onClick={() => setArticleFilterFeatured(articleFilterFeatured === true ? null : true)}
                >
                  Featured
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setArticleSearchQuery("")
                    setArticleFilterCategory("")
                    setArticleFilterAuthor("")
                    setArticleFilterDraft(null)
                    setArticleFilterFeatured(null)
                  }}
                >
                  Reset Filter
                </Button>
                <div className="ml-auto text-sm text-muted-foreground">
                  {getFilteredArticles().length} artikel ditemukan
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Article Table */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-center w-12">
                        <input
                          type="checkbox"
                          checked={selectedArticles.length === getFilteredArticles().length && getFilteredArticles().length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                        <button
                          onClick={() => {
                            setArticleSortBy("title")
                            setArticleSortOrder(articleSortOrder === "asc" ? "desc" : "asc")
                          }}
                          className="flex items-center gap-1"
                        >
                          Judul
                          {articleSortBy === "title" && (
                            articleSortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Penulis</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Kategori</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {getFilteredArticles().map((article) => (
                      <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedArticles.includes(article.id)}
                            onChange={() => handleSelectArticle(article.id)}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{article.title}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-md">{article.description}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{getAuthorName(article.authorId)}</td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${getCategoryColor(article.categoryId)}20`,
                              color: getCategoryColor(article.categoryId)
                            }}
                          >
                            {getCategoryName(article.categoryId)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {article.featured && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                                Featured
                              </span>
                            )}
                            {article.draft && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                                Draft
                              </span>
                            )}
                            {!article.draft && !article.private && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                Published
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-green-50"
                              onClick={() => window.open(`/${article.slug}`, '_blank')}
                              title="Preview"
                            >
                              <Eye className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                              onClick={() => handleOpenArticleDialog(article)}
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-purple-50"
                              onClick={() => handleDuplicateArticle(article)}
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4 text-purple-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-red-50"
                              onClick={() => handleDeleteArticle(article)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Authors Tab */}
      {artikelTab === "authors" && (
        <div>
          <div className="flex justify-end mb-6">
            <Button className="gap-2" onClick={() => handleOpenAuthorDialog()}>
              <Plus className="w-4 h-4" />
              Tambah Penulis
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map((author) => (
              <Card key={author.id} className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {author.photo ? (
                      <Image
                        src={author.photo}
                        alt={author.name}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {author.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-slate-800">{author.name}</h3>
                      <p className="text-sm text-slate-600">{author.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {articles.filter(a => a.authorId === author.id).length} artikel
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{author.description}</p>
                  
                  {author.skills && author.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {author.skills.map((skill, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-slate-100 text-slate-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleOpenAuthorDialog(author)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteAuthor(author)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {artikelTab === "categories" && (
        <div>
          <div className="flex justify-end mb-6">
            <Button className="gap-2" onClick={() => handleOpenCategoryDialog()}>
              <Plus className="w-4 h-4" />
              Tambah Kategori
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {category.icon && (
                        <span className="text-3xl">{category.icon}</span>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg text-slate-800">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {articles.filter(a => a.categoryId === category.id).length} artikel
                        </p>
                      </div>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{category.description}</p>
                  
                  <div className="text-xs text-muted-foreground mb-4">
                    <code className="bg-slate-100 px-2 py-1 rounded">/{category.slug}</code>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleOpenCategoryDialog(category)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Article Form Dialog */}
      <Dialog open={isArticleDialogOpen} onOpenChange={setIsArticleDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? "Edit Artikel" : "Tambah Artikel Baru"}</DialogTitle>
            <DialogDescription>
              {editingArticle ? "Ubah informasi artikel" : "Buat artikel baru untuk blog"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="article-title">Judul *</Label>
              <Input
                id="article-title"
                value={articleFormData.title || ""}
                onChange={(e) => {
                  const title = e.target.value
                  setArticleFormData({ 
                    ...articleFormData, 
                    title,
                    slug: !editingArticle ? generateSlug(title) : articleFormData.slug
                  })
                }}
                placeholder="Masukkan judul artikel"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="article-slug">Slug (URL) *</Label>
              <Input
                id="article-slug"
                value={articleFormData.slug || ""}
                onChange={(e) => setArticleFormData({ ...articleFormData, slug: e.target.value })}
                placeholder="artikel-url-slug"
              />
              <p className="text-xs text-muted-foreground">URL: /{articleFormData.slug}</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="article-description">Deskripsi (Meta Description)</Label>
              <Textarea
                id="article-description"
                value={articleFormData.description || ""}
                onChange={(e) => setArticleFormData({ ...articleFormData, description: e.target.value })}
                placeholder="Deskripsi singkat untuk SEO (150-160 karakter)"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {(articleFormData.description || "").length} / 160 karakter
              </p>
            </div>

            {/* SEO Preview */}
            <SeoPreview
              title={articleFormData.title || ""}
              description={articleFormData.description || ""}
              slug={articleFormData.slug || ""}
            />

            {/* Content Editor */}
            <ContentEditor
              value={articleFormData.bodyMarkdown || ""}
              onChange={(value) => setArticleFormData({ ...articleFormData, bodyMarkdown: value })}
              label="Konten Artikel"
              placeholder="# Judul Artikel&#10;&#10;Tulis konten artikel..."
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsArticleDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveArticle}>
              {editingArticle ? "Update Artikel" : "Tambah Artikel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Author Form Dialog */}
      <Dialog open={isAuthorDialogOpen} onOpenChange={setIsAuthorDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAuthor ? "Edit Penulis" : "Tambah Penulis Baru"}</DialogTitle>
            <DialogDescription>
              {editingAuthor ? "Ubah informasi penulis" : "Tambahkan penulis baru"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="author-name">Nama *</Label>
              <Input
                id="author-name"
                value={authorFormData.name || ""}
                onChange={(e) => {
                  const name = e.target.value
                  setAuthorFormData({ 
                    ...authorFormData, 
                    name,
                    slug: !editingAuthor ? generateSlug(name) : authorFormData.slug
                  })
                }}
                placeholder="Nama lengkap penulis"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author-slug">Slug (URL) *</Label>
              <Input
                id="author-slug"
                value={authorFormData.slug || ""}
                onChange={(e) => setAuthorFormData({ ...authorFormData, slug: e.target.value })}
                placeholder="nama-penulis"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author-title">Title/Position</Label>
              <Input
                id="author-title"
                value={authorFormData.title || ""}
                onChange={(e) => setAuthorFormData({ ...authorFormData, title: e.target.value })}
                placeholder="e.g. Statistical Analyst"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author-description">Deskripsi</Label>
              <Textarea
                id="author-description"
                value={authorFormData.description || ""}
                onChange={(e) => setAuthorFormData({ ...authorFormData, description: e.target.value })}
                placeholder="Bio singkat penulis"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author-photo">Photo URL</Label>
              <Input
                id="author-photo"
                value={authorFormData.photo || ""}
                onChange={(e) => setAuthorFormData({ ...authorFormData, photo: e.target.value })}
                placeholder="/authors/photo.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author-skills">Skills (pisahkan dengan koma)</Label>
              <Input
                id="author-skills"
                value={Array.isArray(authorFormData.skills) ? authorFormData.skills.join(", ") : ""}
                onChange={(e) => setAuthorFormData({ 
                  ...authorFormData, 
                  skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                })}
                placeholder="SPSS, AMOS, Python"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAuthorDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveAuthor}>
              {editingAuthor ? "Update Penulis" : "Tambah Penulis"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Form Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Ubah informasi kategori" : "Tambahkan kategori baru"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nama *</Label>
              <Input
                id="category-name"
                value={categoryFormData.name || ""}
                onChange={(e) => {
                  const name = e.target.value
                  setCategoryFormData({ 
                    ...categoryFormData, 
                    name,
                    slug: !editingCategory ? generateSlug(name) : categoryFormData.slug
                  })
                }}
                placeholder="Nama kategori"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-slug">Slug (URL) *</Label>
              <Input
                id="category-slug"
                value={categoryFormData.slug || ""}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                placeholder="nama-kategori"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description">Deskripsi</Label>
              <Textarea
                id="category-description"
                value={categoryFormData.description || ""}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                placeholder="Deskripsi kategori"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-color">Warna</Label>
              <div className="flex gap-2">
                <Input
                  id="category-color"
                  type="color"
                  value={categoryFormData.color || "#3b82f6"}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={categoryFormData.color || "#3b82f6"}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-icon">Icon (emoji)</Label>
              <Input
                id="category-icon"
                value={categoryFormData.icon || ""}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                placeholder="📊"
                maxLength={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? "Update Kategori" : "Tambah Kategori"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
