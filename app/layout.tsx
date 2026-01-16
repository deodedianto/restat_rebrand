import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { OrderProvider } from "@/lib/order-context"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ReStat - Tutor Statistik Anda!",
  description:
    "Jasa olah data statistik terpercaya untuk mahasiswa dan peneliti. Konsultasi gratis, bimbingan sampai lulus!",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`font-sans antialiased`}>
        {/* Fixed gradient background that stays in place while content scrolls */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-white via-blue-100 to-purple-200 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950" />
        
        <AuthProvider>
          <OrderProvider>{children}</OrderProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
