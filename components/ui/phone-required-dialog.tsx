"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle, Phone } from "lucide-react"
import { useRouter } from "next/navigation"

interface PhoneRequiredDialogProps {
  isOpen: boolean
  onClose: () => void
  action: "schedule" | "order"
}

export function PhoneRequiredDialog({ isOpen, onClose, action }: PhoneRequiredDialogProps) {
  const router = useRouter()

  const actionText = action === "schedule" ? "menjadwalkan konsultasi" : "membuat pesanan baru"

  const handleAddPhone = () => {
    onClose()
    
    // Check if already on dashboard page
    if (typeof window !== "undefined" && window.location.pathname === "/dashboard") {
      // Just update the hash to trigger profile section opening
      window.location.hash = "profile"
    } else {
      // Navigate to dashboard with profile hash
      router.push("/dashboard#profile")
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-xl">Nomor WhatsApp Diperlukan</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="text-base text-slate-700 space-y-3 pt-2">
              <p>
                Anda perlu menambahkan <strong>nomor WhatsApp</strong> terlebih dahulu sebelum {actionText}.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Mengapa nomor WhatsApp diperlukan?</p>
                  <p>
                    Kami memerlukan nomor WhatsApp untuk menghubungi Anda terkait jadwal konsultasi dan status pesanan
                    Anda.
                  </p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onClose} className="sm:w-auto">
            Nanti Saja
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAddPhone}
            className="bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
          >
            Tambah Nomor WhatsApp
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
