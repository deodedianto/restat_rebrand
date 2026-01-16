"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"

const questions = [
  "Takut Salah Olah Data?",
  "Pusing sama Statistik?",
  "Deadline Mepet?",
  "Pengen Lulus Tepat Waktu?",
]

export function HeroSection() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex]

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (displayedText.length < currentQuestion.length) {
          setDisplayedText(currentQuestion.slice(0, displayedText.length + 1))
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        // Deleting
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.slice(0, -1))
        } else {
          // Move to next question
          setIsDeleting(false)
          setCurrentQuestionIndex((prev) => (prev + 1) % questions.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [displayedText, isDeleting, currentQuestionIndex])

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-8 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Dipercaya oleh 993+ klien
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
            <br />
            <span className="text-accent">
              {displayedText}
              <span className="animate-pulse">|</span>
            </span>{" "}
            Ada ReStat!
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Gak perlu pusing lagi sama data mentah atau software ribet. Tim ReStat siap bantuin analisis statistik kamu dari awal sampai selesai—cepat, akurat, dan terpercaya.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Konsultasi Gratis
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 gap-2 border-border bg-transparent">
              Lihat Portfolio
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-6 pt-4 justify-center">
            {["Garansi Uang Kembali","Konsultasi Kapanpun", "Dibantu Sampai Lulus"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
