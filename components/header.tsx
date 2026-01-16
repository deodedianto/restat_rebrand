"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, MessageCircle, Search } from "lucide-react"
import Link from "next/link"
import { SearchDialog } from "@/components/search-dialog"

const navLinks = [
  { name: "Layanan", href: "/#services" },
  { name: "Portfolio", href: "/#portfolio" },
  { name: "Harga", href: "/#pricing" },
  { name: "Artikel", href: "/artikel" },
  { name: "Kontak", href: "/#contact" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      
    <header className="fixed top-10 left-0 right-0 z-40">
      <div className="mx-4 mt-3">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-slate-100 via-blue-50 to-pink-50 backdrop-blur-md rounded-full border border-slate-200/50 shadow-sm px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="/authors/logo-besar.png" 
                alt="ReStat Logo" 
                className="w-8 h-8 object-contain"
              />
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

            {/* Search & CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(true)}
                className="rounded-full px-3 h-9 gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs text-muted-foreground">
                  <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs">⌘K</kbd>
                </span>
              </Button>

              {/* Konsultasi Gratis Button */}
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
            {/* Search Button for Mobile */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchOpen(true)
                setIsOpen(false)
              }}
              className="w-full rounded-full gap-2"
            >
              <Search className="w-4 h-4" />
              Cari Artikel
            </Button>

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
    </>
  )
}
