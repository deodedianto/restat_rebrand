"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { motion, AnimatePresence } from "framer-motion"

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY < 50) {
        // Show when at the top
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY) {
        // Hide when scrolling down
        setIsVisible(false)
      } else if (currentScrollY < lastScrollY && currentScrollY < 200) {
        // Show when scrolling up near the top
        setIsVisible(true)
      }
      
      lastScrollY = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-10 text-sm">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline">🚀</span>
                  <span className="font-medium">
                    Buat akun hanya sekali klik, <Link href="/register" className="underline hover:text-white/90 cursor-pointer">Daftar sekarang!</Link>
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {user ? (
                    <Link href="/dashboard">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 px-3 text-white hover:bg-white/20 hover:text-white"
                      >
                        <User className="w-3 h-3 mr-1" />
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/login">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 px-3 text-white hover:bg-white/20 hover:text-white"
                      >
                        Log In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
