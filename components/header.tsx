"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, BarChart3, MessageCircle } from "lucide-react"
import Link from "next/link"

const navLinks = [
  { name: "Layanan", href: "#services" },
  { name: "Portfolio", href: "#portfolio" },
  { name: "Harga", href: "#pricing" },
  { name: "Artikel", href: "#articles" },
  { name: "Kontak", href: "#contact" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-10 left-0 right-0 z-40">
      <div className="mx-4 mt-3">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-slate-100 via-blue-50 to-pink-50 backdrop-blur-md rounded-full border border-slate-200/50 shadow-sm px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-slate-800">ReStat</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Konsultasi Gratis Button */}
            <div className="hidden md:flex items-center">
              <Link href="/register">
                <Button className="rounded-full px-5 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9">
                  <MessageCircle className="w-4 h-4" />
                  Konsultasi Gratis
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-700"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden mx-4 mt-2">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-lg px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-slate-600 hover:text-slate-900 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-200">
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button className="w-full rounded-full gap-2 bg-primary text-primary-foreground">
                  <MessageCircle className="w-4 h-4" />
                  Konsultasi Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
