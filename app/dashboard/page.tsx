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
import { WorkProgress } from "@/components/dashboard/work-progress"
import { ReferralProgram } from "@/components/dashboard/referral-program"
import { ReviewsRating } from "@/components/dashboard/reviews-rating"
import { UnpaidOrderAnnouncement } from "@/components/unpaid-order-announcement"
import { supabase } from "@/lib/supabase/client"
import { useReferralSettings } from "@/lib/hooks/use-referral-settings"

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, updateProfile, updateBankAccount, resetPassword, generateReferralCode, redeemEarnings, isLoading } = useAuth()
  const { orders, loadOrders } = useOrder()
  const { settings: referralSettings } = useReferralSettings()
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [sedangDikerjakanCount, setSedangDikerjakanCount] = useState(0)
  const [hasUnpaidOrders, setHasUnpaidOrders] = useState(false)
  const [unpaidOrdersCount, setUnpaidOrdersCount] = useState(0)
  const [referralEarnings, setReferralEarnings] = useState(0)

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Redirect admin/analyst users to admin panel
  useEffect(() => {
    if (!isLoading && user && (user.role === 'admin' || user.role === 'analyst')) {
      router.push("/admin")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      loadOrders()
      setReferralCode(user.referralCode || "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Load work history to check for unpaid orders and calculate referral earnings
  useEffect(() => {
    if (!user?.id) return

    const loadWorkStats = async () => {
      try {
        // Get user's own orders
        const { data: ordersData, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_record_deleted', false)

        if (error) {
          console.error('Error loading orders:', error)
          return
        }

        if (ordersData) {
          // Count unpaid orders
          const unpaid = ordersData.filter((o: any) => o.payment_status === 'Belum Dibayar')
          setUnpaidOrdersCount(unpaid.length)
          setHasUnpaidOrders(unpaid.length > 0)

          // Count orders being worked on (Sedang Dikerjakan)
          const inProgress = ordersData.filter(
            (o: any) => o.work_status === 'Diproses' && o.payment_status === 'Dibayar'
          )
          setSedangDikerjakanCount(inProgress.length)
        }

        // Calculate referral earnings from orders that used this user's referral code
        if (user.referralCode) {
          console.log('🔍 Searching for referral earnings with code:', user.referralCode)
          
          const { data: referralOrders, error: referralError } = await supabase
            .from('orders')
            .select('id, price, payment_status, referral_code_used, referral_reward_amount')
            .eq('referral_code_used', user.referralCode)
            .eq('payment_status', 'Dibayar')
            .eq('is_record_deleted', false)

          console.log('📊 Referral query result:', {
            code: user.referralCode,
            ordersFound: referralOrders?.length || 0,
            orders: referralOrders,
            error: referralError
          })

          if (referralError) {
            console.error('❌ Error loading referral orders:', referralError)
            setReferralEarnings(0)
            return
          }

          if (referralOrders && referralOrders.length > 0) {
            // Calculate total referral earnings by summing up referral_reward_amount
            const totalEarnings = referralOrders.reduce((sum: number, order: any) => {
              return sum + (order.referral_reward_amount || 0)
            }, 0)

            console.log('💵 Referral earnings calculated:', {
              paidReferrals: referralOrders.length,
              orderRewards: referralOrders.map((o: any) => ({
                orderId: o.id,
                rewardAmount: o.referral_reward_amount
              })),
              totalEarnings
            })

            setReferralEarnings(totalEarnings)
            console.log('✅ Total referral earnings:', totalEarnings)
          } else {
            console.log('ℹ️ No referral orders found')
            setReferralEarnings(0)
          }
        } else {
          console.log('⚠️ User has no referral code yet')
          setReferralEarnings(0)
        }
      } catch (error: any) {
        console.error('❌ Error in loadWorkStats:', error)
      }
    }

    loadWorkStats()

    // Set up real-time subscription for orders
    const channel = supabase
      .channel('user-dashboard-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          loadWorkStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, user?.referralCode])

  const handleLogout = async () => {
    try {
      await logout()
    router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleGenerateCode = async () => {
    const code = await generateReferralCode()
    setReferralCode(code)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
  }

  const handleRedeemPoints = async () => {
    // This would be implemented via the useAuth context
    alert("Fitur redeem points akan segera tersedia!")
  }

  const handleSubmitFeedback = async (rating: number, comment: string) => {
    if (!user) return

    console.log('📝 Submitting feedback:', { rating, comment, userId: user.id })

    try {
      const { error } = await supabase
        .from('reviews')
        // @ts-expect-error - TypeScript inference issue with Supabase types, but types are correct
        .insert({
          user_id: user.id,
          rating,
          comment,
          is_published: false
        })

      if (error) {
        console.error('❌ Feedback submission error:', error)
        throw error
      }

      console.log('✅ Feedback submitted successfully')
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      throw error
    }
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
          referralEarnings={referralEarnings}
          userPhone={user.phone || ""}
        />

        {/* Profile Settings */}
        <ProfileSettings
          userName={user.name || ""}
          userEmail={user.email || ""}
          userPhone={user.phone || ""}
          onUpdateProfile={(data) => updateProfile({ ...data, whatsapp: user.whatsapp || '' })}
          onResetPassword={() => {
            alert("Fitur reset password akan segera tersedia. Anda akan menerima link reset password melalui email.")
          }}
        />

        {/* Work Progress */}
        <WorkProgress userId={user.id} />

        {/* Referral Program */}
        <ReferralProgram
          user={{ ...user, referralEarnings }}
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
          onSubmitFeedback={handleSubmitFeedback}
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
      />
    </div>
  )
}
