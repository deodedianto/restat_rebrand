import { ArrowRight } from "lucide-react"
import Link from "next/link"

const articles = [
  {
    title: "Cara Mengolah Data Kuesioner dengan SmartPLS (SEM PLS)",
    author: "Admin ReStat",
    date: "March 23, 2023",
    category: "Tutorial",
  },
  {
    title: "Cara Uji One Way Anova di SPSS",
    author: "Kadek Aris",
    date: "March 23, 2023",
    category: "Tutorial",
  },
  {
    title: "Cara Uji Regresi Logistik dengan SPSS",
    author: "Rahmat Putra",
    date: "March 23, 2023",
    category: "Tutorial",
  },
]

export function ArticlesSection() {
  return (
    <section id="articles" className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-accent uppercase tracking-wider"></span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3">Tips & Trik Statistik dari Tim ReStat</h2>
          <Link
            href="#"
            className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-3 font-medium transition-colors"
          >
            Lihat Semua Artikel
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <article
              key={index}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="aspect-video bg-muted flex items-center justify-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent">{index + 1}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded">
                    {article.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{article.date}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground">by {article.author}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
