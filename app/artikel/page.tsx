"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Clock, User, ChevronRight, BookOpen, GraduationCap, TrendingUp, Code, FileText, Users } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"

// Category mapping
const categoryMap: Record<string, string> = {
  "interpretasi-uji-statistik": "Interpretasi Hasil",
  "metode-penelitian": "Metode Penelitian",
  "metode-statistik": "Metode Statistik",
  "software-statistik": "Software Statistik",
  "tutorial-analisis-statistik": "Tutorial Analisis"
}

const categoryIcons: Record<string, any> = {
  "Interpretasi Hasil": FileText,
  "Metode Penelitian": GraduationCap,
  "Metode Statistik": TrendingUp,
  "Software Statistik": Code,
  "Tutorial Analisis": BookOpen,
  "Tim Restat": Users,
}

export default function ArtikelPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const tagParam = searchParams.get('tag')
  
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const [searchQuery, setSearchQuery] = useState("")
  const [articles, setArticles] = useState<any[]>([])
  const [authors, setAuthors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch articles and authors from API routes
    Promise.all([
      fetch('/api/articles').then(res => res.json()),
      fetch('/api/authors').then(res => res.json())
    ])
      .then(([articlesData, authorsData]) => {
        setArticles(articlesData)
        setAuthors(authorsData)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Error fetching data:', err)
        setIsLoading(false)
      })
  }, [])

  // Set category from URL parameter
  useEffect(() => {
    if (categoryParam) {
      const displayName = categoryMap[categoryParam]
      if (displayName) {
        setSelectedCategory(displayName)
      }
    }
  }, [categoryParam])

  const categories = ["Semua", ...Object.values(categoryMap), "Tim Restat"]

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === "Semua" || categoryMap[article.category] === selectedCategory
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = !tagParam || (article.tags && article.tags.includes(tagParam))
    return matchesCategory && matchesSearch && matchesTag
  })

  const featuredArticle = filteredArticles.find((article) => article.featured)
  const regularArticles = filteredArticles.filter((article) => !article.featured)

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white">
              Artikel & Tutorial Statistik dari Tim ReStat
          </h1>
            <p className="text-lg text-black dark:text-white mb-8">
            Mentok dengan analisis data? Temukan tutorial step-by-step, tips praktis, dan trik statistik dari ahli ReStat—semua dijelaskan dengan mudah.
            </p>

          {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
                type="text"
                placeholder="Cari artikel statistik..."
                className="pl-12 pr-4 py-6 text-lg rounded-full border-2 border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => {
              const Icon = categoryIcons[category] || BookOpen
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {category}
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-muted-foreground">Memuat data...</p>
              </div>
            ) : selectedCategory === "Tim Restat" ? (
              <>
                {/* Authors Grid */}
                <section className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Tim Restat</h2>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  {/* Mobile: Horizontal scroll, Desktop: Grid */}
                  <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-4 snap-x snap-mandatory scrollbar-hide">
                    {authors.map((author, index) => (
                      <motion.div
                        key={author.slug}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        className="min-w-[280px] md:min-w-0 snap-center"
                      >
                        <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1">
                          <CardContent className="p-6 flex flex-col items-center text-center h-full">
                            {/* Author Avatar */}
                            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white border-2 border-gray-200 mb-4 flex items-center justify-center">
                              <img
                                src={author.thumbnail ? `/authors/${author.thumbnail}` : '/authors/logo-besar.png'}
                                alt={author.name}
                                className={author.thumbnail ? "w-full h-full object-cover" : "w-16 h-16 object-contain p-2"}
                              />
                            </div>
                            
                            {/* Author Info */}
                            <h3 className="text-xl font-bold mb-2">{author.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{author.title}</p>
                            <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
                              {author.description}
                            </p>
                            
                            {/* Skills */}
                            {author.skills && author.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 justify-center">
                                {author.skills.map((skill: string) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Artikel tidak ditemukan</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Coba kata kunci lain atau ubah filter kategori"
                    : "Belum ada artikel di kategori ini"}
                </p>
              </div>
            ) : (
              <>
      {/* Featured Article */}
                {featuredArticle && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold mb-6">Artikel Unggulan</h2>
                <Link href={`/artikel/${featuredArticle.slug}`} className="block">
                  <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-2 gap-6 p-6">
                        <div className="space-y-4">
                          <Badge variant="secondary">{categoryMap[featuredArticle.category]}</Badge>
                          <h3 className="text-3xl font-bold hover:text-primary transition-colors">
                    {featuredArticle.title}
                          </h3>
                          <p className="text-muted-foreground">{featuredArticle.excerpt}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                              <span>{featuredArticle.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{featuredArticle.readTime}</span>
                    </div>
                  </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                </Link>
                </motion.div>
      )}

      {/* Articles by Category */}
                {Object.entries(categoryMap).map(([slug, displayName]) => {
              const categoryArticles = regularArticles.filter(
                (article) => article.category === slug && (selectedCategory === "Semua" || categoryMap[article.category] === selectedCategory)
              )

            if (categoryArticles.length === 0) return null

                  const Icon = categoryIcons[displayName] || BookOpen

            return (
                    <section key={slug} className="mb-12">
                      <div className="flex items-center gap-3 mb-6">
                        <Icon className="h-6 w-6 text-blue-600" />
                        <h2 className="text-2xl font-bold">{displayName}</h2>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      {/* Mobile: Horizontal scroll, Desktop: Grid */}
                      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-4 snap-x snap-mandatory scrollbar-hide">
                        {categoryArticles.map((article, index) => (
                          <motion.div
                            key={article.slug}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            viewport={{ once: true }}
                            className="min-w-[280px] md:min-w-0 snap-center"
                          >
                            <Link href={`/artikel/${article.slug}`} className="block h-full">
                              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                                <CardContent className="p-6 flex flex-col h-full">
                                  <Badge variant="secondary" className="w-fit mb-3">
                                    {displayName}
                                  </Badge>
                                  <h3 className="text-xl font-bold mb-3 line-clamp-2 hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
                                    {article.excerpt}
                                  </p>
                                  <div className="flex gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                                      <span className="truncate">{article.author}</span>
                          </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{article.readTime}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                            </Link>
                          </motion.div>
                  ))}
                </div>
                    </section>
                  )
                })}
              </>
            )}

            {/* CTA Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mt-16 text-center py-16 px-6 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 rounded-2xl text-white"
            >
              <h2 className="text-3xl font-bold mb-4">Butuh Bantuan Analisis Data?</h2>
              <p className="text-lg mb-8 text-blue-50">
              Gratis konsultasi 30 menit dengan ahli statistik kami
              </p>
              <Link href={user ? "/dashboard" : "/register"}>
                <Button size="lg" variant="secondary" className="text-blue-600 hover:text-blue-700">
                  Jadwalkan Meeting Gratis
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.section>
        </div>

      <Footer />
    </main>
  )
}
