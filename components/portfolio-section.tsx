"use client"

import {
  GitBranch,
  Grid3x3,
  ShieldCheck,
  BarChart3,
  TestTube,
  TrendingUp,
  Binary,
  Database,
  Route,
  Activity,
  Network,
  Share2,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const analysisTypes = [
  { name: "Korelasi", icon: GitBranch, link: "https://drive.google.com/file/d/11D-RBnKBmrq-zwjlHdTSyCT1q-sp-cwY/preview" },
  { name: "Chi-Square", icon: Grid3x3, link: "https://drive.google.com/file/d/1txkgzPMhSKzLXvp94adsYFc6ElC4e3vC/preview" },
  { name: "Validitas & Reliabilitas", icon: ShieldCheck, link: "https://drive.google.com/file/d/1uqTRAfoI6dTyp0m77LN3jCOvx3dEEzVs/preview" },
  { name: "Anova/Ancova", icon: BarChart3, link: "https://drive.google.com/file/d/13ngL-IXG8v4a0Y5EAJfdhpVxja6M-7Lq/preview" },
  { name: "T-Test", icon: TestTube, link: "https://drive.google.com/file/d/1BfFgW1vL5b_4ATefzOMN3cQ-xMfT3MVt/preview" },
  { name: "Regresi Berganda", icon: TrendingUp, link: "https://drive.google.com/file/d/1nMGdYCvyBZONuu121pxAFdxqqv82zVIH/preview" },
  { name: "Regresi Logistik", icon: Binary, link: "https://drive.google.com/file/d/13sfvA26SObCJvesd-DaQdvwGoGXAE-hn/preview" },
  { name: "Regresi Data Panel", icon: Database, link: "https://drive.google.com/file/d/1hIuDfJkUdFSQrKbglRBPBb1cYasNfN0l/preview" },
  { name: "Path Analisis", icon: Route, link: "https://drive.google.com/file/d/1LyawBbLrSnAVJJf7zknW34U3JeqBrtG7/preview" },
  { name: "Time Series", icon: Activity, link: "https://drive.google.com/file/d/1QOlLLfBGj3YLnP0VuJID8XjFD1rrQgFo/preview" },
  { name: "SEM", icon: Network, link: "https://drive.google.com/file/d/1YxbkfrA-hDkP22NSDjw21cG9ArWQtPot/preview" },
  { name: "SEM PLS", icon: Share2, link: "https://drive.google.com/file/d/19NhlHiZOsVjKin8L7zBRN0Dr6OrILI9F/preview" },
]

export function PortfolioSection() {
  return (
    <section id="portfolio" className="relative py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <span className="text-sm font-medium text-accent uppercase tracking-wider"></span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 text-balance">
            Apapun Analisisnya, Kita Pasti Bisa Bantu!
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {analysisTypes.map((type, index) => {
            const Icon = type.icon
            return (
              <motion.a
                key={index}
                href={type.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card rounded-xl p-6 border border-border hover:border-accent hover:shadow-md transition-all cursor-pointer group text-center block"
                initial={{ opacity: 0, scale: 0.7, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 120
                }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div className="w-12 h-12 mx-auto bg-accent/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-sm sm:text-base font-medium text-foreground">{type.name}</h3>
              </motion.a>
            )
          })}
        </div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <p className="text-black dark:text-white mb-6">Butuh analisis lain? Jangan khawatir, konsultasi dengan kami!</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-3 font-medium transition-colors"
          >
            Konsultasi Gratis
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
