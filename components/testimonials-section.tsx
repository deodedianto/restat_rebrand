"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const testimonials = [
  {
    name: "Anisa",
    service: "SEM - Standard",
    text: "Penjelasannya cukup jelas, dan kompeten dalam menjawab pertanyaan-pertanyaan saya",
  },
  {
    name: "Acep",
    service: "Regresi Berganda - Premium",
    text: "Saya sangat puas dengan hasil konsultasi dari Restat dan pelayanannya pun sangat baik dan memuaskan. Restat ok sukses terus!",
  },
  {
    name: "Dewi",
    service: "SEM - Premium",
    text: "Konsultasinya sampai detail, setiap ada yang bingung pasti dijelasin. Dosen saya juga sudah approve sekarang, sisa nunggu jadwal sidang!",
  },
  {
    name: "Fajar",
    service: "Path Analysis - Premium",
    text: "Untuk Restat, respon sangat cepat, fleksible, konsultasinya juga sangat jelas. Penjelasan juga mudah dipahami!",
  },
  {
    name: "Cholis",
    service: "ARIMA - Basic",
    text: "Restat memiliki tenaga ahli yang sangat kompeten di bidang analisa statistik. Hasil konsultasinya juga tepat dan cepat",
  },
  {
    name: "Raditya",
    service: "SEM - Premium",
    text: "Tim Restat merupakan tim yang sangat terbuka untuk berdiskusi dan berbagi ilmu sehingga saya juga sangat puas",
  },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="relative py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <span className="text-sm font-medium text-accent uppercase tracking-wider"></span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 text-balance">Mereka Sudah Membuktikan Sendiri!</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left - Combined Stats Card + Testimonial Review */}
          <motion.div 
            className="bg-card rounded-2xl p-8 shadow-xl border border-border flex flex-col justify-between h-full"
            initial={{ opacity: 0, x: -40, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ 
              duration: 0.7,
              type: "spring",
              stiffness: 100
            }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="space-y-4">
              {/* Stats Section */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Tingkat Kepuasan</span>
                <span className="text-2xl font-bold text-accent">98%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-[98%] bg-accent rounded-full" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-foreground">993+</div>
                  <div className="text-xs text-muted-foreground">Klien Puas</div>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-foreground">24/7</div>
                  <div className="text-xs text-muted-foreground">Konsultasi</div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border pt-4"></div>

              {/* Testimonial Quote */}
              <div>
                <p className="text-sm text-foreground leading-relaxed mb-4 italic">
                  "{testimonials[currentIndex].text}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent font-semibold">
                    {testimonials[currentIndex].name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{testimonials[currentIndex].name}</div>
                    <div className="text-xs text-muted-foreground">{testimonials[currentIndex].service}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4 pt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={prev}
                className="rounded-full border-border bg-transparent h-9 w-9"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? "bg-accent" : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={next}
                className="rounded-full border-border bg-transparent h-9 w-9"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Right - Video Player */}
          <motion.div 
            className="bg-card rounded-2xl overflow-hidden shadow-xl border border-border h-full"
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ 
              duration: 0.7,
              type: "spring",
              stiffness: 100
            }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="aspect-video h-full">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/SlBmpKnqjUo"
                title="Video Testimonial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
