"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { BookingModal } from "@/components/booking-modal"
import {
  BarChart3,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  User,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronUp,
  Settings,
  Gift,
  Copy,
  Check,
  Wallet,
  Users,
  Coins,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Star,
  MessageSquare,
  Calendar,
  Tag,
  Pencil,
  X,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useOrder, type Order } from "@/lib/order-context"
import { Footer } from "@/components/footer"

const statusConfig: Record<Order["status"], { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Menunggu Pembayaran", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  processing: { label: "Sedang Diproses", color: "bg-blue-100 text-blue-800", icon: Loader2 },
  completed: { label: "Selesai", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800", icon: XCircle },
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, updateProfile, resetPassword, generateReferralCode, redeemPoints, isLoading } = useAuth()
  const { orders, loadOrders } = useOrder()

  // Profile state
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileName, setProfileName] = useState("")
  const [profileEmail, setProfileEmail] = useState("")
  const [profilePhone, setProfilePhone] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Purchase History state
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false)

  // Referral state
  const [isReferralOpen, setIsReferralOpen] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [redeemAmount, setRedeemAmount] = useState("")
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [redeemMessage, setRedeemMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [reviews, setReviews] = useState<Record<string, { rating: number; comment: string; submitted: boolean }>>({})
  const [submittingReview, setSubmittingReview] = useState<string | null>(null)

  // Work history state
  const [workHistory, setWorkHistory] = useState([
    { id: 1, type: "Konsultasi", date: "10 Januari 2025", time: "20:30", status: "Selesai", note: "" },
    { id: 2, type: "Pembayaran", date: "14 Januari 2025", time: "", status: "Selesai", note: "" },
    { id: 3, type: "Pengerjaan", date: "15 Januari 2025", time: "", status: "Sedang Dikerjakan", note: "" },
    { id: 4, type: "Konsultasi", date: "16 Januari 2025", time: "", status: "Dijadwalkan", note: "" },
  ])
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [editingNoteValue, setEditingNoteValue] = useState("")

  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      loadOrders()
      setProfileName(user.name)
      setProfileEmail(user.email)
      setProfilePhone(user.phone)
      setReferralCode(user.referralCode || "")
    }
  }, [user])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleEditNote = (id: number, currentNote: string) => {
    setEditingNoteId(id)
    setEditingNoteValue(currentNote)
  }

  const handleSaveNote = (id: number) => {
    setWorkHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note: editingNoteValue } : item))
    )
    setEditingNoteId(null)
    setEditingNoteValue("")
  }

  const handleCancelEditNote = () => {
    setEditingNoteId(null)
    setEditingNoteValue("")
  }

  const handleOpenBookingModal = () => {
    setIsBookingModalOpen(true)
  }

  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    setProfileMessage(null)

    const success = await updateProfile({
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
    })

    if (success) {
      setProfileMessage({ type: "success", text: "Profil berhasil diperbarui!" })
    } else {
      setProfileMessage({ type: "error", text: "Gagal memperbarui profil. Email mungkin sudah digunakan." })
    }

    setIsSavingProfile(false)
  }

  const handleResetPassword = async () => {
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Password baru tidak cocok!" })
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password minimal 6 karakter!" })
      return
    }

    setIsResettingPassword(true)

    const success = await resetPassword(currentPassword, newPassword)

    if (success) {
      setPasswordMessage({ type: "success", text: "Password berhasil diubah!" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      setPasswordMessage({ type: "error", text: "Password saat ini salah!" })
    }

    setIsResettingPassword(false)
  }

  const handleGenerateCode = () => {
    setIsGenerating(true)
    const code = generateReferralCode()
    setReferralCode(code)
    setIsGenerating(false)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleRedeem = async () => {
    const amount = Number.parseInt(redeemAmount)
    if (isNaN(amount) || amount < 10000) {
      setRedeemMessage({ type: "error", text: "Minimal redeem Rp 10.000" })
      return
    }

    if (amount > (user?.referralPoints || 0)) {
      setRedeemMessage({ type: "error", text: "Poin tidak mencukupi!" })
      return
    }

    setIsRedeeming(true)
    const success = await redeemPoints(amount)

    if (success) {
      setRedeemMessage({
        type: "success",
        text: `Berhasil redeem Rp ${amount.toLocaleString("id-ID")}! Tim kami akan menghubungi Anda.`,
      })
      setRedeemAmount("")
    } else {
      setRedeemMessage({ type: "error", text: "Gagal redeem poin!" })
    }

    setIsRedeeming(false)
  }

  const handleRatingChange = (orderId: string, rating: number) => {
    setReviews((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], rating, comment: prev[orderId]?.comment || "" },
    }))
  }

  const handleCommentChange = (orderId: string, comment: string) => {
    setReviews((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], comment, rating: prev[orderId]?.rating || 0 },
    }))
  }

  const handleSubmitReview = async (orderId: string) => {
    const review = reviews[orderId]
    if (!review?.rating) return

    setSubmittingReview(orderId)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setReviews((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], submitted: true },
    }))
    setSubmittingReview(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(
      amount,
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userOrders = orders.filter((order) => order.userId === user.id)
  const completedOrders = userOrders.filter((order) => order.status === "completed")

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 mx-4 mt-3">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-slate-100 via-blue-50 to-pink-50 backdrop-blur-md rounded-full border border-slate-200/50 shadow-sm px-6">
          <div className="relative flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/authors/logo-besar.png?v=4"
                alt="ReStat Logo"
                className="w-10 h-10 rounded-full"
              />
              <span className="font-bold text-lg text-slate-800 hidden lg:inline">ReStat</span>
            </Link>

            <div className="absolute left-1/2 -translate-x-1/2">
              <Link href="#contact">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-200/50 rounded-full"
                >
                  Hubungi Kami
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span>{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 text-slate-700 hover:text-slate-900 hover:bg-slate-200/50 rounded-full"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Selamat datang, {user.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Kamu bisa jadwalin konsultasi, pantau progress analisis data kamu, dapatkan uang tambahan</p>
        </div>

        {/* Profile Settings - Collapsible */}
        <Card className="mb-3 sm:mb-6 border-0 shadow-md overflow-hidden bg-white py-2.5 px-0">
          <Collapsible open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer bg-white hover:bg-slate-50 transition-colors py-2 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                      <Settings className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm sm:text-base text-slate-800 leading-tight mb-0.5">Pengaturan Profil</CardTitle>
                      <CardDescription className="text-xs text-slate-600 leading-tight">
                        Edit nama, email, dan WhatsApp
                      </CardDescription>
                    </div>
                  </div>
                  {isProfileOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-6 space-y-6">
                {/* Profile Form */}
                <div className="grid sm:grid-cols-2 gap-6 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2 text-slate-700">
                      <User className="w-4 h-4" />
                      Nama Lengkap
                    </Label>
                    <Input
                      id="name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Nama lengkap"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="Email"
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-4 h-4" />
                      Nomor WhatsApp
                    </Label>
                    <Input
                      id="phone"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-3">
                    {profileMessage && (
                      <p className={`text-sm ${profileMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                        {profileMessage.text}
                      </p>
                    )}
                    <div className="flex gap-3">
                      <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="rounded-full">
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        "Simpan Perubahan"
                      )}
                    </Button>
                      <Button
                        variant="outline"
                        className="rounded-full bg-white gap-2"
                        onClick={() => {
                          // TODO: Implement password reset functionality
                          alert("Fitur reset password akan segera tersedia. Anda akan menerima link reset password melalui email.")
                        }}
                      >
                        <Lock className="w-4 h-4" />
                        Reset Password
                    </Button>
                  </div>
                </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
          <Card className="border-0 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <button onClick={handleOpenBookingModal} className="flex flex-col items-center text-center w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/70 rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-sm">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-emerald-600" />
                      </div>
                <h3 className="font-semibold text-slate-800 mb-0.5 text-xs sm:text-sm lg:text-base leading-tight">Jadwalkan Konsultasi Gratis</h3>
                <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 hidden sm:block">Konsultasikan masalahmu sekarang juga</p>
              </button>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-slate-200 via-blue-100 to-slate-100 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <Link href="/order" className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/70 rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-sm">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-slate-600" />
                    </div>
                <h3 className="font-semibold text-slate-800 mb-0.5 text-xs sm:text-sm lg:text-base">Pesan Baru</h3>
                <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 hidden sm:block">Mulai pesanan baru</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-white via-slate-50 to-gray-50 shadow-md">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:gap-3 lg:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-slate-100/70 rounded-2xl flex items-center justify-center shadow-sm mb-1 sm:mb-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-slate-600" />
                      </div>
                <div className="text-center sm:text-left">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">{userOrders.length}</p>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600">Sedang Dikerjakan</p>
                    </div>
                    </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 shadow-md">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:gap-3 lg:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/70 rounded-2xl flex items-center justify-center shadow-sm mb-1 sm:mb-0">
                  <Coins className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-amber-600" />
                  </div>
                <div className="text-center sm:text-left">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">{formatCurrency(user.referralPoints || 0)}</p>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600">Poin Referral</p>
                </div>
                </div>
              </CardContent>
        </Card>
        </div>

        {/* Purchase History */}
        <Card className="mb-3 sm:mb-6 border-0 shadow-md overflow-hidden bg-white py-2.5 px-0">
          <Collapsible open={isPurchaseOpen} onOpenChange={setIsPurchaseOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer bg-white hover:bg-slate-50 transition-colors py-2 px-4 sm:px-6">
                <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                      <FileText className="w-4 h-4 text-slate-600" />
              </div>
              <div className="min-w-0">
                      <CardTitle className="text-sm sm:text-base text-slate-800 leading-tight mb-0.5">Proses Pengerjaan</CardTitle>
                      <CardDescription className="text-xs text-slate-600 leading-tight">Daftar semua jadwal konsultasi dan pengerjaan analisis data</CardDescription>
              </div>
                  </div>
                  {isPurchaseOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
            </div>
          </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
          <CardContent className="pt-6">
            {/* Riwayat Pengerjaan Table */}
            <div className="mb-6 bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Riwayat Pengerjaan
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Jam
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {workHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-foreground">{item.type}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-muted-foreground whitespace-nowrap">{item.date}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-muted-foreground whitespace-nowrap">{item.time}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span
                            className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                              item.status === "Selesai"
                                ? "bg-green-100 text-green-700"
                                : item.status === "Sedang Dikerjakan"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          {editingNoteId === item.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingNoteValue}
                                onChange={(e) => setEditingNoteValue(e.target.value)}
                                placeholder="Tambahkan catatan..."
                                className="h-8 text-sm"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveNote(item.id)}
                                className="h-8 px-2 rounded-md hover:bg-green-50"
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEditNote}
                                className="h-8 px-2 rounded-md hover:bg-red-50"
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground flex-1">
                                {item.note || "-"}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditNote(item.id, item.note)}
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50"
                              >
                                <Pencil className="w-4 h-4 text-slate-600" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Referral Section - Collapsible */}
        <Card className="mb-3 sm:mb-6 border-0 shadow-md overflow-hidden bg-white py-2.5 px-0">
          <Collapsible open={isReferralOpen} onOpenChange={setIsReferralOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer bg-white hover:bg-slate-50 transition-colors py-2 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                      <Gift className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm sm:text-base text-slate-800 leading-tight mb-0.5">Program Referral</CardTitle>
                      <CardDescription className="text-xs text-slate-600 leading-tight">
                        Bagikan kode referral, kamu dapat uang tunai dan diskon untuk temanmu
                      </CardDescription>
                    </div>
                  </div>
                  {isReferralOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-6 space-y-6">
                {/* Stats with gradients */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-100 via-indigo-50 to-slate-50 rounded-xl text-center">
                    <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-base sm:text-lg font-bold text-slate-800">{user.referralCount || 0}</p>
                    <p className="text-xs sm:text-sm text-slate-600">Pengguna Direferensikan</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-50 rounded-xl text-center">
                    <Coins className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-base sm:text-lg font-bold text-slate-800">{formatCurrency(user.referralPoints || 0)}</p>
                    <p className="text-xs sm:text-sm text-slate-600">Total Poin</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-50 rounded-xl text-center">
                    <Wallet className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <p className="text-base sm:text-lg font-bold text-slate-800">Rp 10.000</p>
                    <p className="text-xs sm:text-sm text-slate-600">Per Referral</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-slate-300 via-slate-200 to-blue-100 rounded-xl text-center">
                    <Tag className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-base sm:text-lg font-bold text-slate-800">5%</p>
                    <p className="text-xs sm:text-sm text-slate-600">Diskon Teman</p>
                  </div>
                </div>

                {/* Generate/Show Code */}
                <div className="p-4 bg-gradient-to-r from-primary/10 via-blue-50 to-indigo-50 border border-primary/20 rounded-xl">
                  <h4 className="text-sm sm:text-base font-medium text-slate-800 mb-3">Kode Referral Anda</h4>
                  {referralCode ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-3 font-mono text-sm sm:text-base font-semibold text-primary">
                        {referralCode}
                      </div>
                      <Button onClick={handleCopyCode} variant="outline" className="gap-2 bg-white rounded-full">
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Salin
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleGenerateCode} disabled={isGenerating} className="gap-2 rounded-full">
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4" />
                          Generate Kode Referral
                        </>
                      )}
                    </Button>
                  )}
                  <p className="text-sm text-slate-600 mt-3">
                    Bagikan kode ini kepada teman. Setiap kali mereka melakukan pembelian, Anda mendapat Rp 10.000!
                  </p>
                </div>

                {/* Redeem Points */}
                <div className="p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-xl">
                  <h4 className="text-sm sm:text-base font-medium text-slate-800 mb-3 flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Tukar Poin ke Rupiah
                  </h4>
                  <p className="text-sm text-slate-600 mb-4">
                    Minimal redeem Rp 10.000. Pencairan akan diproses dalam 1-3 hari kerja.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={redeemAmount}
                        onChange={(e) => setRedeemAmount(e.target.value)}
                        placeholder="Masukkan jumlah (min. 10000)"
                        min={10000}
                        step={10000}
                        className="bg-white"
                      />
                    </div>
                    <Button
                      onClick={handleRedeem}
                      disabled={isRedeeming || !redeemAmount || (user.referralPoints || 0) < 10000}
                      className="gap-2 rounded-full"
                    >
                      {isRedeeming ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          Tukar Sekarang
                        </>
                      )}
                    </Button>
                  </div>
                  {redeemMessage && (
                    <p
                      className={`text-sm mt-3 ${redeemMessage.type === "success" ? "text-green-600" : "text-red-600"}`}
                    >
                      {redeemMessage.text}
                    </p>
                  )}
                </div>

                {/* How it works */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4">
                  <h4 className="text-sm sm:text-base font-medium text-slate-800 mb-3">Cara Kerja Program Referral</h4>
                  <ol className="space-y-2 text-sm text-slate-600">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                        1
                      </span>
                      <span>Generate kode referral unik Anda</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                        2
                      </span>
                      <span>Bagikan kode kepada teman atau rekan</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                        3
                      </span>
                      <span>Teman menggunakan saat pembayaran</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                        4
                      </span>
                      <span>Anda mendapat Rp 10.000 setelah teman melakukan pembayaran</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                        5
                      </span>
                      <span>Tukarkan poin ke uang tunai kapan saja</span>
                    </li>
                  </ol>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card className="mb-3 sm:mb-6 border-0 shadow-md overflow-hidden bg-white py-2.5 px-0">
          <Collapsible open={isReviewOpen} onOpenChange={setIsReviewOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer bg-white hover:bg-slate-50 transition-colors py-2 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                      <MessageSquare className="w-4 h-4 text-slate-600" />
                    </div>
              <div className="min-w-0">
                      <CardTitle className="text-sm sm:text-base text-slate-800 leading-tight mb-0.5">Ulasan & Rating</CardTitle>
                      <CardDescription className="text-xs text-slate-600 leading-tight">
                      Bagikan pengalaman kamu untuk dan bantu kami berkembang
                      </CardDescription>
              </div>
                  </div>
                  {isReviewOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-6 space-y-6">
                {completedOrders.length === 0 ? (
                  <div className="space-y-6">
                    {/* General Feedback Form */}
                    <div className="p-5 bg-gradient-to-br from-slate-50 via-pink-50 to-rose-50 rounded-xl">
                      
                      {/* Star Rating */}
                      <div className="mb-4">
                        <Label className="text-slate-700 mb-2 block">Rating</Label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingChange("general", star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-7 h-7 ${
                                  star <= (reviews["general"]?.rating || 0)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300 hover:text-amber-300"
                                }`}
                              />
                            </button>
                          ))}
                          {reviews["general"]?.rating && (
                            <span className="ml-2 text-sm font-medium text-slate-600">
                              {reviews["general"].rating}/5
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="mb-4">
                        <Label htmlFor="general-comment" className="text-slate-700 mb-2 block">
                          Komentar
                        </Label>
                        <Textarea
                          id="general-comment"
                          value={reviews["general"]?.comment || ""}
                          onChange={(e) => handleCommentChange("general", e.target.value)}
                          placeholder="Bagikan pengalaman Anda dengan layanan kami..."
                          className="bg-white resize-none"
                          rows={4}
                        />
                      </div>

                      <Button
                        onClick={() => handleSubmitReview("general")}
                        disabled={!reviews["general"]?.rating || submittingReview === "general"}
                        className="rounded-full gap-2 w-full sm:w-auto"
                      >
                        {submittingReview === "general" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <Star className="w-4 h-4" />
                            Kirim Ulasan
                          </>
                        )}
                      </Button>

                      {reviews["general"]?.submitted && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Terima kasih atas feedback Anda!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  completedOrders.map((order) => {
                    const review = reviews[order.id]
                    const isSubmitted = review?.submitted

                    return (
                      <div
                        key={order.id}
                        className="p-5 bg-gradient-to-br from-slate-50 via-pink-50 to-rose-50 rounded-xl"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                            <h4 className="font-medium text-slate-800">{order.researchTitle}</h4>
                            <p className="text-sm text-slate-600">
                              {order.analysisMethod.name} - {order.package.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Selesai:{" "}
                              {new Date(order.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
              </div>
                          {isSubmitted && (
                            <Badge className="bg-green-100 text-green-700 border-0">
                              <Check className="w-3 h-3 mr-1" />
                              Ulasan Terkirim
                            </Badge>
                          )}
                        </div>

                        {isSubmitted ? (
                          <div className="bg-white/70 rounded-lg p-4">
                            <div className="flex items-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= (review?.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-2 text-sm font-medium text-slate-700">{review?.rating}/5</span>
                            </div>
                            <p className="text-sm text-slate-600 italic">{`"${review?.comment}"`}</p>
                          </div>
                        ) : (
                          <>
                            {/* Star Rating */}
                            <div className="mb-4">
                              <Label className="text-slate-700 mb-2 block">Rating</Label>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRatingChange(order.id, star)}
                                    className="p-1 hover:scale-110 transition-transform"
                                  >
                                    <Star
                                      className={`w-7 h-7 ${
                                        star <= (review?.rating || 0)
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-slate-300 hover:text-amber-300"
                                      }`}
                                    />
                                  </button>
                                ))}
                                {review?.rating && (
                                  <span className="ml-2 text-sm font-medium text-slate-600">{review.rating}/5</span>
                                )}
                              </div>
                            </div>

                            {/* Comment */}
                            <div className="mb-4">
                              <Label htmlFor={`comment-${order.id}`} className="text-slate-700 mb-2 block">
                                Komentar
                              </Label>
                              <Textarea
                                id={`comment-${order.id}`}
                                value={review?.comment || ""}
                                onChange={(e) => handleCommentChange(order.id, e.target.value)}
                                placeholder="Bagikan pengalaman Anda dengan layanan kami..."
                                className="bg-white resize-none"
                                rows={3}
                              />
                            </div>

                            <Button
                              onClick={() => handleSubmitReview(order.id)}
                              disabled={!review?.rating || submittingReview === order.id}
                              className="rounded-full gap-2"
                            >
                              {submittingReview === order.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Mengirim...
                                </>
                              ) : (
                                <>
                                  <Star className="w-4 h-4" />
                                  Kirim Ulasan
                                </>
                              )}
                </Button>
                          </>
                        )}
            </div>
                    )
                  })
                )}
          </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        userName={user?.name}
        userEmail={user?.email}
      />

      <Footer />
    </div>
  )
}
