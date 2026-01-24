"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, FileText, Plus, Coins } from "lucide-react"
import { PhoneRequiredDialog } from "@/components/ui/phone-required-dialog"
import { hasPhoneNumber } from "@/lib/utils/phone-validation"

interface QuickActionsProps {
  onScheduleClick: () => void
  ordersCount?: number
  referralEarnings?: number
  userPhone?: string
}

export function QuickActions({ onScheduleClick, ordersCount = 0, referralEarnings = 0, userPhone }: QuickActionsProps) {
  const [showPhoneDialog, setShowPhoneDialog] = useState(false)
  const [dialogAction, setDialogAction] = useState<"schedule" | "order">("schedule")

  const handleScheduleClick = () => {
    if (!hasPhoneNumber(userPhone)) {
      setDialogAction("schedule")
      setShowPhoneDialog(true)
      return
    }
    onScheduleClick()
  }

  const handleOrderClick = (e: React.MouseEvent) => {
    if (!hasPhoneNumber(userPhone)) {
      e.preventDefault()
      setDialogAction("order")
      setShowPhoneDialog(true)
      return
    }
  }
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
        {/* Jadwalkan Konsultasi */}
        <Card className="border-0 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <button onClick={handleScheduleClick} className="flex flex-col items-center text-center w-full">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/70 rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-sm">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-0.5 text-xs sm:text-sm lg:text-base leading-tight">Jadwalkan Konsultasi Gratis</h3>
              <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 hidden sm:block">Konsultasikan masalahmu sekarang juga</p>
            </button>
          </CardContent>
        </Card>

        {/* Pesan Baru */}
        <Card className="border-0 bg-gradient-to-br from-slate-200 via-blue-100 to-slate-100 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <Link href="/order" onClick={handleOrderClick} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/70 rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-sm">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-0.5 text-xs sm:text-sm lg:text-base">Pesan Baru</h3>
              <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 hidden sm:block">Mulai pesanan baru</p>
            </Link>
          </CardContent>
        </Card>

      {/* Sedang Dikerjakan */}
      <Card className="border-0 bg-gradient-to-br from-white via-slate-50 to-gray-50 shadow-md">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:gap-3 lg:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-slate-100/70 rounded-2xl flex items-center justify-center shadow-sm mb-1 sm:mb-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-slate-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">{ordersCount}</p>
              <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600">Sedang Dikerjakan</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reward Referral */}
      <Card className="border-0 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 shadow-md">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:gap-3 lg:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/70 rounded-2xl flex items-center justify-center shadow-sm mb-1 sm:mb-0">
              <Coins className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-amber-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">{formatCurrency(referralEarnings)}</p>
              <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600">Reward Referral</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      <PhoneRequiredDialog
        isOpen={showPhoneDialog}
        onClose={() => setShowPhoneDialog(false)}
        action={dialogAction}
      />
    </>
  )
}
