"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Clock, User, ChevronRight, BookOpen } from "lucide-react"

const categories = [
  "Semua",
  "Interpretasi Hasil",
  "Software Statistik",
  "Metode Statistik",
  "Pengolahan Data",
  "Metode Penelitian",
]

const articles = [
  // Featured
  {
    id: 1,
    title: "Cara Mengolah Data Kuesioner dengan SmartPLS (SEM PLS)",
    excerpt: "Metode Analisis yang sering digunakan dalam menganalisa data kuisioner adalah metode SEM PLS...",
    category: "Pengolahan Data",
    author: "Admin Restat",
    date: "March 23, 2023",
    readTime: "3 min",
    image: "/smartpls-data-analysis-statistics.jpg",
    featured: true,
  },
  // Interpretasi Hasil
  {
    id: 2,
    title: "Interpretasi Uji One Way Anova di SPSS",
    excerpt: "Interpretasi Uji One Way Anova Langkah-langkah analisis Anova di artikel uji Anova satu arah SPSS...",
    category: "Interpretasi Hasil",
    author: "Kadek Aris S.Tr.Stat",
    date: "March 24, 2023",
    readTime: "1 min",
    image: "/anova-spss-statistics-interpretation.jpg",
  },
  {
    id: 3,
    title: "Interpretasi Chi Square di SPSS",
    excerpt: "Analisis Chi Square Langkah-langkah analisis chi square di artikel uji chi square SPSS telah...",
    category: "Interpretasi Hasil",
    author: "Admin Restat",
    date: "March 24, 2023",
    readTime: "1 min",
    image: "/chi-square-spss-analysis.jpg",
  },
  {
    id: 4,
    title: "Cara Membaca Output Regresi Logistik di SPSS",
    excerpt: "Membaca Output Regresi Logistik Di artikel regresi logistik dengan SPSS Anda telah mempelajari...",
    category: "Interpretasi Hasil",
    author: "Rahmat Putra S.Tr.Stat",
    date: "March 24, 2023",
    readTime: "4 min",
    image: "/logistic-regression-spss-output.jpg",
  },
  {
    id: 5,
    title: "Cara Membaca Hasil Output Amos",
    excerpt: "Panduan lengkap cara membaca dan menginterpretasikan hasil output dari software AMOS...",
    category: "Interpretasi Hasil",
    author: "Muhammad Herdi S.Tr.Stat",
    date: "March 23, 2023",
    readTime: "2 min",
    image: "/amos-sem-output-statistics.jpg",
  },
  {
    id: 6,
    title: "Cara Membaca Hasil Output Smart PLS",
    excerpt: "Panduan lengkap cara membaca dan menginterpretasikan hasil output dari software Smart PLS...",
    category: "Interpretasi Hasil",
    author: "Admin Restat",
    date: "March 23, 2023",
    readTime: "3 min",
    image: "/smartpls-output-analysis.jpg",
  },
  // Metode Statistik
  {
    id: 7,
    title: "Penjelasan Lengkap Uji T Independen",
    excerpt: "Uji T independen adalah metode statistik yang digunakan untuk mengetahui apakah terdapat perbedaan...",
    category: "Metode Statistik",
    author: "Admin Restat",
    date: "May 04, 2023",
    readTime: "3 min",
    image: "/t-test-independent-statistics.jpg",
  },
  {
    id: 8,
    title: "Penjelasan Lengkap Uji T Berpasangan",
    excerpt: "Uji T berpasangan adalah metode statistik yang digunakan untuk mengetahui apakah terdapat perbedaan...",
    category: "Metode Statistik",
    author: "Admin Restat",
    date: "May 04, 2023",
    readTime: "3 min",
    image: "/paired-t-test-statistics.jpg",
  },
  {
    id: 9,
    title: "Penjelasan Lengkap Uji T Satu Sampel",
    excerpt: "Uji t satu sampel adalah metode statistik yang digunakan untuk mengetahui apakah rata-rata satu...",
    category: "Metode Statistik",
    author: "Admin Restat",
    date: "May 03, 2023",
    readTime: "3 min",
    image: "/one-sample-t-test.jpg",
  },
  {
    id: 10,
    title: "Pahami, Perbedaan Mediasi dan Moderasi",
    excerpt: "Penjelasan lengkap tentang perbedaan mediasi dan moderasi dalam analisis statistik...",
    category: "Metode Statistik",
    author: "Admin Restat",
    date: "May 03, 2023",
    readTime: "1 min",
    image: "/mediation-moderation-statistics.jpg",
  },
  {
    id: 11,
    title: "Penjelasan Lengkap Analisis SEM dan Contoh Penerapannya",
    excerpt: "Structural Equation Modeling (SEM) adalah teknik analisis multivariat yang menggabungkan...",
    category: "Metode Statistik",
    author: "Admin Restat",
    date: "April 02, 2023",
    readTime: "4 min",
    image: "/sem-structural-equation-modeling.jpg",
  },
  // Pengolahan Data
  {
    id: 12,
    title: "Cara Uji One Way Anova di SPSS",
    excerpt: "Apa Itu One Way Anova? Uji one way Anova adalah metode analisis statistik multivariate yang dapat...",
    category: "Pengolahan Data",
    author: "Kadek Aris S.Tr.Stat",
    date: "March 24, 2023",
    readTime: "1 min",
    image: "/one-way-anova-spss-tutorial.jpg",
  },
  {
    id: 13,
    title: "Cara Uji Chi Square di SPSS",
    excerpt: "Panduan lengkap cara melakukan uji Chi Square menggunakan software SPSS...",
    category: "Pengolahan Data",
    author: "Admin Restat",
    date: "March 24, 2023",
    readTime: "1 min",
    image: "/chi-square-spss-tutorial.jpg",
  },
  {
    id: 14,
    title: "Cara Analisa Regresi Logistik dengan SPSS",
    excerpt: "Tutorial lengkap cara melakukan analisis regresi logistik menggunakan SPSS...",
    category: "Pengolahan Data",
    author: "Rahmat Putra S.Tr.Stat",
    date: "March 24, 2023",
    readTime: "1 min",
    image: "/logistic-regression-spss.jpg",
  },
  {
    id: 15,
    title: "Analisis AHP: Pengertian, Contoh, Tutorial",
    excerpt: "Analytic Hierarchy Process (AHP) adalah metode pengambilan keputusan yang dikembangkan...",
    category: "Pengolahan Data",
    author: "Aldilla Devitasari S.Tr.Stat",
    date: "March 24, 2023",
    readTime: "2 min",
    image: "/ahp-analytic-hierarchy-process.jpg",
  },
  // Software Statistik
  {
    id: 16,
    title: "Pengenalan Aplikasi Amos dan Download Amos Versi Terbaru",
    excerpt: "Pengenalan Aplikasi Amos. Aplikasi AMOS adalah salah satu software statistik yang digunakan untuk...",
    category: "Software Statistik",
    author: "Admin Restat",
    date: "April 01, 2023",
    readTime: "2 min",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 17,
    title: "Pengenalan Smart PLS dan Download Smart PLS Versi Terbaru",
    excerpt: "Pengenalan Smart PLS. Smart PLS adalah salah satu software yang sering digunakan dalam penelitian...",
    category: "Software Statistik",
    author: "Admin Restat",
    date: "April 01, 2023",
    readTime: "2 min",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 18,
    title: "Pengenalan Eviews dan Download Eviews Versi Terbaru",
    excerpt: "Pengenalan Eviews. Eviews adalah software statistik dan ekonometrika yang dirancang khusus untuk...",
    category: "Software Statistik",
    author: "Admin Restat",
    date: "April 01, 2023",
    readTime: "2 min",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 19,
    title: "IBM SPSS Download Versi Terbaru",
    excerpt: "Panduan download dan instalasi IBM SPSS versi terbaru untuk analisis statistik...",
    category: "Software Statistik",
    author: "Admin Restat",
    date: "April 01, 2023",
    readTime: "2 min",
    image: "/placeholder.svg?height=200&width=300",
  },
  // Metode Penelitian
  {
    id: 20,
    title: "Hipotesis Penelitian Kuantitatif dan Kualitatif",
    excerpt: "Dalam penelitian kita sering mendengar kata-kata hipotesis penelitian. Apakah itu hipotesis...",
    category: "Metode Penelitian",
    author: "Admin Restat",
    date: "May 02, 2023",
    readTime: "2 min",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 21,
    title: "Cara Menentukan Uji Statistik",
    excerpt: "Panduan lengkap cara menentukan uji statistik yang tepat untuk penelitian Anda...",
    category: "Metode Penelitian",
    author: "Admin Restat",
    date: "March 31, 2023",
    readTime: "2 min",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 22,
    title: "Pahami Jenis-Jenis Data untuk Memudahkan Analisa Data",
    excerpt: "Penjelasan lengkap tentang jenis-jenis data dalam penelitian statistik...",
    category: "Metode Penelitian",
    author: "Admin Restat",
    date: "March 31, 2023",
    readTime: "3 min",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 23,
    title: "Cara Menentukan Jumlah Sampel Penelitian dengan Slovin",
    excerpt: "Panduan lengkap menentukan jumlah sampel penelitian menggunakan rumus Slovin...",
    category: "Metode Penelitian",
    author: "Admin Restat",
    date: "March 31, 2023",
    readTime: "2 min",
    image: "/placeholder.svg?height=200&width=300",
  },
]

const learningSteps = [
  "Belajar metode penelitian",
  "Belajar dasar-dasar metode statistik",
  "Belajar software statistik",
  "Belajar pengolahan data",
  "Belajar interpretasi hasil",
]

export default function ArtikelPage() {
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const [searchQuery, setSearchQuery] = useState("")

  const featuredArticle = articles.find((a) => a.featured)
  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === "Semua" || article.category === selectedCategory
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && !article.featured
  })

  const getArticlesByCategory = (category: string) => {
    return filteredArticles.filter((a) => a.category === category).slice(0, 6)
  }

  const displayCategories =
    selectedCategory === "Semua"
      ? ["Interpretasi Hasil", "Metode Statistik", "Pengolahan Data", "Software Statistik", "Metode Penelitian"]
      : [selectedCategory]

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-blue-50 to-pink-100" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-pink-200/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/40 to-transparent rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Category Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {["Belajar Statistik", "Statistisi", "Jasa Olah Data"].map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-white/80 text-slate-700 hover:bg-white">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-center text-slate-800 mb-4 text-balance">
            Making Sense of Statistics
          </h1>
          <p className="text-lg md:text-xl text-center text-slate-600 mb-8">A Guide to Understanding Research Data.</p>

          {/* Category Filter Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-white/80 text-slate-700 hover:bg-white hover:shadow-sm"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Cari artikel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-full bg-white/90 border-0 shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && selectedCategory === "Semua" && !searchQuery && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <Card className="overflow-hidden bg-gradient-to-br from-sky-50 via-white to-pink-50 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-video md:aspect-auto relative">
                  <img
                    src={featuredArticle.image || "/placeholder.svg"}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-primary">Featured</Badge>
                </div>
                <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                  <Badge variant="outline" className="w-fit mb-4 border-primary/30 text-primary">
                    {featuredArticle.category}
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-balance">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 line-clamp-3">{featuredArticle.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{featuredArticle.author}</span>
                    </div>
                    <span>{featuredArticle.date}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{featuredArticle.readTime}</span>
                    </div>
                  </div>
                  <Button className="w-fit">
                    Baca Selengkapnya
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Learning Steps Section */}
      {selectedCategory === "Semua" && !searchQuery && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="bg-gradient-to-br from-sky-100 via-blue-50 to-pink-100 border-0 shadow-lg overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Cara Belajar Statistik</h2>
                  </div>
                  <p className="text-slate-600 mb-6">
                    Website ini dirancang untuk mudah dipahami untuk menerapkan statistik bagi pemula pada penelitian
                  </p>
                  <ol className="space-y-3">
                    {learningSteps.map((step, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 text-primary font-bold text-sm shadow-sm">
                          {index + 1}
                        </span>
                        <span className="text-slate-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Articles by Category */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {displayCategories.map((category) => {
            const categoryArticles = getArticlesByCategory(category)
            if (categoryArticles.length === 0) return null

            return (
              <div key={category} className="mb-16 last:mb-0">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-primary to-primary/50" />
                    <h2 className="text-2xl font-bold text-foreground">{category}</h2>
                  </div>
                  <Button variant="ghost" className="text-primary hover:text-primary/80">
                    View More
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryArticles.map((article) => (
                    <Card
                      key={article.id}
                      className="group overflow-hidden bg-gradient-to-br from-white via-sky-50/30 to-pink-50/30 border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={article.image || "/placeholder.svg"}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-3 left-3 bg-white/90 text-slate-700 hover:bg-white">
                          {article.category}
                        </Badge>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{article.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="font-medium truncate max-w-[120px]">{article.author}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span>{article.date}</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{article.readTime}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}

          {/* No Results */}
          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-sky-100 to-pink-100 flex items-center justify-center">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Tidak ada artikel ditemukan</h3>
              <p className="text-muted-foreground">Coba ubah kata kunci atau filter kategori</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
