"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface UnpaidOrderAnnouncementProps {
  hasUnpaidOrders: boolean
  orderCount?: number
}

export function UnpaidOrderAnnouncement({ hasUnpaidOrders, orderCount = 1 }: UnpaidOrderAnnouncementProps) {
  const [isVisible, setIsVisible] = useState(hasUnpaidOrders)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    setIsVisible(hasUnpaidOrders && !isDismissed)
  }, [hasUnpaidOrders, isDismissed])

  useEffect(() => {
    // Check if user has dismissed the announcement in this session
    const dismissed = sessionStorage.getItem("unpaid_order_dismissed")
    if (dismissed === "true") {
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem("unpaid_order_dismissed", "true")
  }

  if (!hasUnpaidOrders) return null

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
          <div className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between min-h-[48px] py-2 text-sm">
                <div className="flex items-center gap-2 flex-1">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-semibold">Pembayaran Pending!</span>
                    <span className="text-white/90">
                      Anda memiliki {orderCount} {orderCount > 1 ? 'pesanan' : 'pesanan'} yang belum dibayar. 
                      {" "}<a href="#proses-pengerjaan" className="underline hover:text-white font-medium">
                        Selesaikan pembayaran sekarang
                      </a> untuk memulai proses pengerjaan.
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                  <a href="#proses-pengerjaan">
                    <Button 
                      size="sm" 
                      className="h-8 px-4 bg-white text-red-600 hover:bg-white/90 hover:text-red-700 font-medium"
                    >
                      Bayar Sekarang
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
