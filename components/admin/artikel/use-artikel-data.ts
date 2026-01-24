import { useState } from "react"
import {
  validateArticle,
  validateAuthor,
  validateCategory,
} from "@/lib/validation/admin-schemas"

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

export function useArtikelData() {
  // Data state
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
  const [articleValidationErrors, setArticleValidationErrors] = useState<Record<string, string>>({})

  // Author form state
  const [isAuthorDialogOpen, setIsAuthorDialogOpen] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<any>(null)
  const [authorFormData, setAuthorFormData] = useState<any>({})
  const [authorValidationErrors, setAuthorValidationErrors] = useState<Record<string, string>>({})

  // Category form state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [categoryFormData, setCategoryFormData] = useState<any>({})
  const [categoryValidationErrors, setCategoryValidationErrors] = useState<Record<string, string>>({})

  // Helper functions
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

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

  // Article CRUD
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
    setArticleValidationErrors({})
    setIsArticleDialogOpen(true)
  }

  const handleSaveArticle = () => {
    setArticleValidationErrors({})
    
    const result = validateArticle(articleFormData)
    
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message
        }
      })
      setArticleValidationErrors(errors)
      return false
    }

    if (editingArticle) {
      setArticles(articles.map(a => a.id === articleFormData.id ? articleFormData : a))
      alert("Article updated successfully!")
    } else {
      setArticles([...articles, articleFormData])
      alert("Article created successfully!")
    }
    setIsArticleDialogOpen(false)
    return true
  }

  const handleDeleteArticle = (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      setArticles(articles.filter(a => a.id !== id))
      alert("Article deleted successfully!")
    }
  }

  // Author CRUD
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
    setAuthorValidationErrors({})
    setIsAuthorDialogOpen(true)
  }

  const handleSaveAuthor = () => {
    setAuthorValidationErrors({})
    
    const result = validateAuthor(authorFormData)
    
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message
        }
      })
      setAuthorValidationErrors(errors)
      return false
    }

    if (editingAuthor) {
      setAuthors(authors.map(a => a.id === authorFormData.id ? authorFormData : a))
      alert("Author updated successfully!")
    } else {
      setAuthors([...authors, authorFormData])
      alert("Author created successfully!")
    }
    setIsAuthorDialogOpen(false)
    return true
  }

  const handleDeleteAuthor = (id: string) => {
    if (confirm("Are you sure you want to delete this author?")) {
      setAuthors(authors.filter(a => a.id !== id))
      alert("Author deleted successfully!")
    }
  }

  // Category CRUD
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
        color: "#82c3ec",
        icon: "📊",
      })
    }
    setCategoryValidationErrors({})
    setIsCategoryDialogOpen(true)
  }

  const handleSaveCategory = () => {
    setCategoryValidationErrors({})
    
    const result = validateCategory(categoryFormData)
    
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message
        }
      })
      setCategoryValidationErrors(errors)
      return false
    }

    if (editingCategory) {
      setCategories(categories.map(c => c.id === categoryFormData.id ? categoryFormData : c))
      alert("Category updated successfully!")
    } else {
      setCategories([...categories, categoryFormData])
      alert("Category created successfully!")
    }
    setIsCategoryDialogOpen(false)
    return true
  }

  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setCategories(categories.filter(c => c.id !== id))
      alert("Category deleted successfully!")
    }
  }

  // Bulk actions
  const handleBulkDelete = () => {
    if (selectedArticles.length === 0) return
    if (confirm(`Delete ${selectedArticles.length} articles?`)) {
      setArticles(articles.filter(a => !selectedArticles.includes(a.id)))
      setSelectedArticles([])
      alert("Articles deleted successfully!")
    }
  }

  const handleToggleFeatured = () => {
    if (selectedArticles.length === 0) return
    setArticles(articles.map(a => 
      selectedArticles.includes(a.id) ? { ...a, featured: !a.featured } : a
    ))
    setSelectedArticles([])
    alert("Articles updated!")
  }

  const handleToggleDraft = () => {
    if (selectedArticles.length === 0) return
    setArticles(articles.map(a => 
      selectedArticles.includes(a.id) ? { ...a, draft: !a.draft } : a
    ))
    setSelectedArticles([])
    alert("Articles updated!")
  }

  return {
    // Data
    articles,
    authors,
    categories,
    // Article state
    articleSearchQuery,
    setArticleSearchQuery,
    articleFilterCategory,
    setArticleFilterCategory,
    articleFilterAuthor,
    setArticleFilterAuthor,
    articleFilterDraft,
    setArticleFilterDraft,
    articleFilterFeatured,
    setArticleFilterFeatured,
    articleSortBy,
    setArticleSortBy,
    articleSortOrder,
    setArticleSortOrder,
    selectedArticles,
    setSelectedArticles,
    isArticleDialogOpen,
    setIsArticleDialogOpen,
    editingArticle,
    articleFormData,
    setArticleFormData,
    articleValidationErrors,
    // Author state
    isAuthorDialogOpen,
    setIsAuthorDialogOpen,
    editingAuthor,
    authorFormData,
    setAuthorFormData,
    authorValidationErrors,
    // Category state
    isCategoryDialogOpen,
    setIsCategoryDialogOpen,
    editingCategory,
    categoryFormData,
    setCategoryFormData,
    categoryValidationErrors,
    // Helper functions
    generateSlug,
    getFilteredArticles,
    getAuthorName,
    getCategoryName,
    getCategoryColor,
    // Article actions
    handleOpenArticleDialog,
    handleSaveArticle,
    handleDeleteArticle,
    // Author actions
    handleOpenAuthorDialog,
    handleSaveAuthor,
    handleDeleteAuthor,
    // Category actions
    handleOpenCategoryDialog,
    handleSaveCategory,
    handleDeleteCategory,
    // Bulk actions
    handleBulkDelete,
    handleToggleFeatured,
    handleToggleDraft,
  }
}
