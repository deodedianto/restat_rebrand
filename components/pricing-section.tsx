"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const pricingPlans = [
  {
    name: "Basic",
    price: "Rp 250.000",
    description: "Untuk kebutuhan analisis sederhana",
    features: ["Olah Data", "Interpretasi Hasil", "Gratis Konsultasi"],
  },
  {
    name: "Standard",
    price: "Rp 500.000",
    description: "Untuk analisis yang lebih lengkap",
    features: ["Olah Data", "Interpretasi Hasil", "Gratis Konsultasi", "Gratis Revisi", "Analisis Deskriptif"],
  },
  {
    name: "Premium",
    price: "Rp 700.000",
    description: "Solusi lengkap sampai lulus",
    features: [
      "Olah Data",
      "Interpretasi Hasil",
      "Gratis Konsultasi",
      "Gratis Revisi",
      "Analisis Deskriptif",
      "Bimbingan Sampai Lulus",
      "Interpretasi Bab 4 & 5",
    ],
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-10 px-4 sm:px-6 lg:px-8">
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
            Harga Transparan, Tidak Ada Biaya Tersembunyi!
          </h2>
        </motion.div>

        {/* Mobile: Horizontal scroll, Desktop: Grid */}
        <div className="flex md:grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto overflow-x-auto md:overflow-x-visible pb-4 snap-x snap-mandatory scrollbar-hide">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              className="bg-card rounded-2xl p-6 sm:p-8 border-2 border-border relative flex flex-col h-full shadow-sm hover:shadow-xl hover:border-accent/50 transition-all group min-w-[280px] md:min-w-0 snap-center"
              initial={{ opacity: 0, y: 50, scale: 0.85 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                type: "spring",
                stiffness: 100
              }}
              viewport={{ once: true, margin: "-100px" }}
            >
              {/* Package Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold ${
                  plan.name === "Premium" 
                    ? "bg-purple-100 text-purple-700" 
                    : plan.name === "Standard"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-700"
                }`}>
                  {plan.name}
                </span>
              </div>

              <div className="text-center mb-6 mt-4">
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="text-center mb-8">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Mulai dari</span>
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2 mb-1">{plan.price}</div>
                <span className="text-xs text-muted-foreground">per analisis</span>
              </div>

              <div className="space-y-1 mb-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-1">Fitur Utama:</p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5">
                      <Check className="w-5 h-5 text-accent flex-shrink-0" />
                    </div>
                    <span className="text-foreground leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" className="mt-auto">
                <Button
                  className="w-full rounded-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all group-hover:scale-105"
                >
                  Konsultasi Paket
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
