"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from "framer-motion"

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

// Animated Number Component
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { 
    duration: 2000,
    bounce: 0 // Remove bounce to prevent overshoot
  })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [isInView, motionValue, value])

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      // Clamp the value to never exceed the target
      const clampedValue = Math.min(Math.round(latest), value)
      setDisplayValue(clampedValue)
    })
    return unsubscribe
  }, [springValue, value])

  return (
    <div ref={ref} className="text-2xl font-bold text-foreground">
      {displayValue}
      {suffix}
    </div>
  )
}

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const next = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x) * velocity.x

    if (swipe < -10000) {
      next()
    } else if (swipe > 10000) {
      prev()
    }
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

        <div className="grid lg:grid-cols-[3fr_2fr] gap-8">
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
                <span className="text-2xl font-bold text-accent">
                  <AnimatedNumber value={98} suffix="%" />
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-accent rounded-full"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "98%" }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-100px" }}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                <div className="bg-secondary rounded-xl py-2 px-3 text-center">
                  <AnimatedNumber value={993} suffix="+" />
                  <div className="text-xs text-muted-foreground">Klien Puas</div>
                </div>
                <div className="bg-secondary rounded-xl py-2 px-3 text-center">
                  <AnimatedNumber value={99} suffix="%" />
                  <div className="text-xs text-muted-foreground">Tepat Waktu</div>
                </div>
                <div className="bg-secondary rounded-xl py-2 px-3 text-center">
                  <div className="text-2xl font-bold text-foreground">± 3 Hari</div>
                  <div className="text-xs text-muted-foreground">Selesai</div>
                </div>
                <div className="bg-secondary rounded-xl py-2 px-3 text-center">
                  <AnimatedNumber value={10} suffix="+ TH" />
                  <div className="text-xs text-muted-foreground">Pengalaman</div>
                </div>
                <div className="bg-secondary rounded-xl py-2 px-3 text-center">
                  <AnimatedNumber value={15} suffix="+" />
                  <div className="text-xs text-muted-foreground">Ahli Statistik</div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border pt-4"></div>

              {/* Testimonial Quote with Swipe Support */}
              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={handleDragEnd}
                    className="cursor-grab active:cursor-grabbing"
                  >
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
                  </motion.div>
                </AnimatePresence>
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
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1)
                      setCurrentIndex(index)
                    }}
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
