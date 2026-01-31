"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, CheckCircle, ArrowRight, MessageCircle, Home, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { Order } from "@/lib/order-context"

export default function PaymentConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)

  const orderId = searchParams.get("orderId")

  useEffect(() => {
    if (!authLoading && !user) {
      // Check if there was a previous session (indicating session expiry/logout)
      const hadSession = sessionStorage.getItem('restat_had_active_session')
      
      if (hadSession === 'true') {
        // Session expired or logged out - redirect to landing page
        sessionStorage.removeItem('restat_had_active_session')
        router.push("/")
      } else {
        // Never had session - redirect to login
        router.push("/login")
      }
    } else if (user) {
      // Mark that we have an active session
      sessionStorage.setItem('restat_had_active_session', 'true')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (orderId) {
      const orders = JSON.parse(localStorage.getItem("restat_orders") || "[]")
      const foundOrder = orders.find((o: Order) => o.id === orderId)
      if (foundOrder) {
        setOrder(foundOrder)
      }
    }
  }, [orderId])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Pesanan tidak ditemukan</h2>
            <p className="text-muted-foreground mb-6">
              Pesanan yang Anda cari tidak dapat ditemukan atau sudah tidak valid.
            </p>
            <Link href="/dashboard">
              <Button className="rounded-full">Ke Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const whatsappMessage = encodeURIComponent(
    `Halo ReStat! Saya sudah melakukan pembayaran untuk pesanan:\n\n` +
      `Order ID: ${order.id}\n` +
      `Judul: ${order.researchTitle}\n` +
      `Metode: ${order.analysisMethod.name}\n` +
      `Paket: ${order.package.name}\n` +
      `Total: ${order.package.priceFormatted}\n\n` +
      `Mohon dikonfirmasi. Terima kasih!`,
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">ReStat</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>
            <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-green-200 animate-ping opacity-25 mx-auto" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-6">Pesanan Berhasil Dibuat!</h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Terima kasih! Pesanan Anda telah kami terima dan akan segera diproses setelah pembayaran dikonfirmasi.
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono font-semibold text-foreground">{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tanggal</p>
                <p className="font-medium text-foreground">
                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Judul Penelitian</p>
                <p className="font-medium text-foreground">{order.researchTitle}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Metode Analisis</p>
                  <p className="font-medium text-foreground">{order.analysisMethod.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paket</p>
                  <p className="font-medium text-foreground">{order.package.name}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Pembayaran</span>
                  <span className="text-2xl font-bold text-accent">{order.package.priceFormatted}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6 bg-accent/5 border-accent/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Langkah Selanjutnya</h3>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-foreground">Kirim Bukti Pembayaran</p>
                  <p className="text-sm text-muted-foreground">
                    Kirim bukti transfer via WhatsApp untuk konfirmasi pembayaran
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-foreground">Kirim Data Penelitian</p>
                  <p className="text-sm text-muted-foreground">
                    Setelah pembayaran terkonfirmasi, kirimkan file data penelitian Anda
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground">Tunggu Proses Analisis</p>
                  <p className="text-sm text-muted-foreground">
                    Tim kami akan segera memproses dan menghubungi Anda untuk konsultasi
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href={`https://wa.me/6281234567890?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full h-12 rounded-full gap-2 bg-green-600 hover:bg-green-700 text-white">
              <MessageCircle className="w-5 h-5" />
              Kirim Bukti via WhatsApp
            </Button>
          </a>

          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full h-12 rounded-full gap-2 bg-transparent">
                <Home className="w-5 h-5" />
                Ke Dashboard
              </Button>
            </Link>

            <Link href="/order">
              <Button variant="outline" className="w-full h-12 rounded-full gap-2 bg-transparent">
                <ArrowRight className="w-5 h-5" />
                Pesan Lagi
              </Button>
            </Link>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Butuh bantuan?{" "}
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent font-medium hover:underline"
            >
              Hubungi kami via WhatsApp
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
