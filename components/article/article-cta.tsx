"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function ArticleCTA() {
  const { user } = useAuth()

  return (
    <div className="my-12 text-center py-16 px-6 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 rounded-2xl text-white">
      <h2 className="text-3xl font-bold mb-4">Butuh Bantuan Analisis Data?</h2>
      <p className="text-lg mb-8 text-blue-50">
        Gratis konsultasi 30 menit dengan ahli statistik kami
      </p>
      <Link href={user ? "/dashboard" : "/register"}>
        <Button size="lg" variant="secondary" className="text-blue-600 hover:text-blue-700">
          Jadwalkan Meeting Gratis
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    </div>
  )
}
