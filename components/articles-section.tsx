"use client"

import { ArrowRight, User, Clock } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const articles = [
  {
    title: "Cara Mengolah Data Kuesioner dengan SmartPLS (SEM PLS)",
    author: "Admin ReStat",
    date: "March 23, 2023",
    category: "Tutorial Analisis",
    readTime: "5 min read",
    slug: "cara-mengolah-data-kuesioner-smartpls",
    excerpt: "Panduan lengkap mengolah data kuesioner menggunakan SmartPLS untuk analisis SEM PLS",
  },
  {
    title: "Cara Uji One Way Anova di SPSS",
    author: "Kadek Aris",
    date: "March 23, 2023",
    category: "Tutorial Analisis",
    readTime: "4 min read",
    slug: "cara-uji-one-way-anova-di-spss",
    excerpt: "Tutorial lengkap cara melakukan uji One Way Anova menggunakan SPSS dengan interpretasi hasil",
  },
  {
    title: "Cara Uji Regresi Logistik dengan SPSS",
    author: "Rahmat Putra",
    date: "March 23, 2023",
    category: "Tutorial Analisis",
    readTime: "6 min read",
    slug: "analisa-regresi-logistik-dengan-spss",
    excerpt: "Pelajari cara melakukan uji regresi logistik dengan SPSS beserta interpretasi outputnya",
  },
]

export function ArticlesSection() {
  return (
    <section id="articles" className="relative py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <span className="text-sm font-medium text-accent uppercase tracking-wider"></span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3">Tips & Trik Statistik dari Tim ReStat</h2>
          <Link
            href="/artikel"
            className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-3 font-medium transition-colors"
          >
            Lihat Semua Artikel
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Mobile: Horizontal scroll, Desktop: Grid */}
        <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-4 snap-x snap-mandatory scrollbar-hide">
          {articles.map((article, index) => (
            <motion.div
              key={index}
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
                    {article.category}
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
      </div>
    </section>
  )
}
