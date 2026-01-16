"use client"

import { MessageCircle, Users, GraduationCap, DollarSign } from "lucide-react"
import { motion } from "framer-motion"

const services = [
  {
    icon: DollarSign,
    title: "Garansi Uang Kembali",
    description: "Kami akan mengembalikan biaya jika hasil analisa yang kami berikan salah",
  },
  {
    icon: GraduationCap,
    title: "Bimbingan Sampai Selesai",
    description: "Kami akan selalu siap membantu sampai penelitian Anda benar-benar selesai",
  },
  {
    icon: MessageCircle,
    title: "Konsultasi Tanpa Batas",
    description: "Bingung cara olah data? Kami siap menerima konsultasi GRATIS 24/7",
  },
  {
    icon: Users,
    title: "Konsultasi Private",
    description: "Butuh mentor untuk konsultasi sesuai penelitianmu? Kami siap membantu",
  },
  
]

export function ServicesSection() {
  return (
    <section id="services" className="relative py-10 px-4 sm:px-6 lg:px-8">
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
            Tidak Bakal Menyesal Dibantu ReStat, Ini Alasannya!
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow group"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <service.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
