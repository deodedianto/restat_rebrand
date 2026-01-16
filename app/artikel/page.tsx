"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Clock, User, ChevronRight, BookOpen, GraduationCap, TrendingUp, Code, FileText } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

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
}

export default function ArtikelPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const tagParam = searchParams.get('tag')
  
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const [searchQuery, setSearchQuery] = useState("")
  const [articles, setArticles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch articles from API route
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        setArticles(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Error fetching articles:', err)
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

  const categories = ["Semua", ...Object.values(categoryMap)]

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
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge className="mb-4" variant="secondary">
              <BookOpen className="mr-2 h-3 w-3" />
              Pusat Pengetahuan Statistik
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Artikel & Tutorial Statistik
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Pelajari metode statistik, interpretasi hasil, dan tutorial software dengan panduan lengkap dari ahli
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Cari artikel statistik..."
                className="pl-12 pr-4 py-6 text-lg rounded-full border-2"
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
            <p className="mt-4 text-muted-foreground">Memuat artikel...</p>
          </div>
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
                <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-2 gap-6 p-6">
                      <div className="space-y-4">
                        <Badge variant="secondary">{categoryMap[featuredArticle.category]}</Badge>
                        <h3 className="text-3xl font-bold">{featuredArticle.title}</h3>
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
                        <Link href={`/artikel/${featuredArticle.slug}`}>
                          <Button className="group">
                            Baca Artikel
                            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryArticles.map((article, index) => (
                      <motion.div
                        key={article.slug}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1">
                          <CardContent className="p-6 flex flex-col h-full">
                            <Badge variant="secondary" className="w-fit mb-3">
                              {displayName}
                            </Badge>
                            <h3 className="text-xl font-bold mb-3 line-clamp-2">{article.title}</h3>
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
                              {article.excerpt}
                            </p>
                            <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span className="truncate">{article.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{article.readTime}</span>
                              </div>
                            </div>
                            <Link href={`/artikel/${article.slug}`} className="mt-auto">
                              <Button variant="ghost" className="w-full group">
                                Baca Artikel
                                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
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
          className="mt-16 text-center py-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Butuh Bantuan Analisis Data?</h2>
          <p className="text-lg mb-8 text-blue-50">
            Konsultasikan kebutuhan analisis statistik Anda dengan ahli kami
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-blue-600 hover:text-blue-700">
              Konsultasi Gratis Sekarang
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.section>
      </div>

      <Footer />
    </main>
  )
}
