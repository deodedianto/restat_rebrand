"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, BarChart3, User } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

const navLinks = [
  { name: "Layanan", href: "#services" },
  { name: "Portfolio", href: "#portfolio" },
  { name: "Harga", href: "#pricing" },
  { name: "Artikel", href: "#articles" },
  { name: "Kontak", href: "#contact" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
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

            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <Link href="/dashboard">
                  <Button className="rounded-full px-5 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button className="rounded-full px-5 bg-primary text-primary-foreground hover:bg-primary/90 h-9">
                      Sign Up
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="rounded-full px-5 text-slate-700 hover:text-slate-900 hover:bg-slate-200/50 h-9"
                    >
                      Log In
                    </Button>
                  </Link>
                </>
              )}
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
            {user ? (
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                <Button className="w-full rounded-full gap-2 bg-primary text-primary-foreground">
                  <User className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full rounded-full bg-primary text-primary-foreground">Sign Up</Button>
                </Link>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full rounded-full bg-transparent text-slate-700">
                    Log In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
