"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BookingModal } from "@/components/booking-modal"
import { LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useOrder } from "@/lib/order-context"
import { Footer } from "@/components/footer"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ProfileSettings } from "@/components/dashboard/profile-settings"
import { WorkProgress, type WorkHistoryItem } from "@/components/dashboard/work-progress"
import { ReferralProgram } from "@/components/dashboard/referral-program"
import { ReviewsRating } from "@/components/dashboard/reviews-rating"
import { countSedangDikerjakan } from "@/lib/utils/work-history-helpers"
import { UnpaidOrderAnnouncement } from "@/components/unpaid-order-announcement"

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, updateProfile, updateBankAccount, resetPassword, generateReferralCode, redeemPoints, isLoading } = useAuth()
  const { orders, loadOrders } = useOrder()
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([])

  // Calculate "Sedang Dikerjakan" count (synchronized with WorkProgress)
  const sedangDikerjakanCount = countSedangDikerjakan(workHistory)
  
  // Check for unpaid orders (exclude "Dibayar" status)
  const unpaidOrdersCount = workHistory.filter(
    (item) => (item.type === "Order" || item.type === "Pembayaran") && item.status === "Belum Dibayar"
  ).length
  const hasUnpaidOrders = unpaidOrdersCount > 0

  // Function to reload work history after booking
  const handleBookingSuccess = () => {
    if (user) {
      const workHistoryKey = `work_history_${user.id}`
      const stored = localStorage.getItem(workHistoryKey)
      if (stored) {
        setWorkHistory(JSON.parse(stored))
      }
    }
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      loadOrders()
      setReferralCode(user.referralCode || "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
    router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleGenerateCode = () => {
    const code = generateReferralCode()
    setReferralCode(code)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
  }

  const handleRedeemPoints = async () => {
    // This would be implemented via the useAuth context
    alert("Fitur redeem points akan segera tersedia!")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Unpaid Order Announcement */}
      <UnpaidOrderAnnouncement hasUnpaidOrders={hasUnpaidOrders} orderCount={unpaidOrdersCount} />
      
      {/* Content Wrapper - Add padding when announcement is present */}
      <div className={hasUnpaidOrders ? 'pt-[48px]' : ''}>
        {/* Header */}
        <header className={`bg-white shadow-sm sticky z-10 ${hasUnpaidOrders ? 'top-[48px]' : 'top-0'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 sm:gap-3">
                <Image
                  src="/authors/logo-besar.png"
                  alt="ReStat Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="hidden md:inline text-xl font-bold text-slate-800">ReStat</span>
              </Link>

              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs sm:text-sm font-medium text-slate-800">{user.name || user.email}</p>
                  <p className="text-[10px] sm:text-xs text-slate-600">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Keluar</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
            Selamat datang, {user.name || "User"}! 👋
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Kelola pesanan, konsultasi, dan dapatkan rewards dari dashboard Anda.
          </p>
        </div>

        {/* Quick Action Cards */}
        <QuickActions
          onScheduleClick={() => setIsBookingModalOpen(true)}
          ordersCount={sedangDikerjakanCount}
          referralPoints={user.referralPoints || 0}
          userPhone={user.phone || ""}
        />

        {/* Profile Settings */}
        <ProfileSettings
          userName={user.name || ""}
          userEmail={user.email || ""}
          userPhone={user.phone || ""}
          onUpdateProfile={updateProfile}
          onResetPassword={() => {
            alert("Fitur reset password akan segera tersedia. Anda akan menerima link reset password melalui email.")
          }}
        />

        {/* Work Progress */}
        <WorkProgress onWorkHistoryChange={setWorkHistory} userId={user.id} />

        {/* Referral Program */}
        <ReferralProgram
          user={user}
          referralCode={referralCode}
          onGenerateCode={handleGenerateCode}
          onCopyCode={handleCopyCode}
          onRedeemPoints={handleRedeemPoints}
          onUpdateBankAccount={updateBankAccount}
        />

        {/* Reviews & Rating */}
        <ReviewsRating
          orders={orders
            .filter((order) => order.status === "completed")
            .map((order) => ({
              id: order.id,
              title: `Analisis Data - ${order.package || "Paket"}`,
            }))}
        />
      </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)}
        userId={user.id}
        userName={user.name}
        userEmail={user.email}
        onSuccess={handleBookingSuccess}
      />
    </div>
  )
}
