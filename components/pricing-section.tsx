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

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              className="bg-card rounded-2xl p-8 border border-border relative flex flex-col h-full"
              initial={{ opacity: 0, y: 50, scale: 0.85 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                type: "spring",
                stiffness: 100
              }}
              viewport={{ once: true, margin: "-100px" }}
            >

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <span className="text-sm text-muted-foreground">Mulai</span>
                <div className="text-3xl font-bold text-foreground">{plan.price}</div>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register">
                <Button
                  className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
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
