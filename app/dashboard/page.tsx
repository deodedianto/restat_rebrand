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
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useOrder, type Order } from "@/lib/order-context"

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
  }, [user, loadOrders])

  const handleLogout = () => {
    logout()
    router.push("/")
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
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 mx-4 mt-3">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-slate-100 via-blue-50 to-pink-50 backdrop-blur-md rounded-full border border-slate-200/50 shadow-sm px-6">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-slate-800">ReStat</span>
            </Link>

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Selamat datang, {user.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground mt-1">Kelola pesanan dan pantau progress analisis data Anda.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-gradient-to-br from-blue-100 via-slate-50 to-pink-100 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Link href="/order" className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-white/70 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <Plus className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Pesan Baru</h3>
                <p className="text-sm text-slate-600">Mulai pesanan baru</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/70 rounded-2xl flex items-center justify-center shadow-sm">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{userOrders.length}</p>
                  <p className="text-sm text-slate-600">Total Pesanan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/70 rounded-2xl flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">
                    {userOrders.filter((o) => o.status === "completed").length}
                  </p>
                  <p className="text-sm text-slate-600">Selesai</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/70 rounded-2xl flex items-center justify-center shadow-sm">
                  <Coins className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{formatCurrency(user.referralPoints || 0)}</p>
                  <p className="text-sm text-slate-600">Poin Referral</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Settings - Collapsible */}
        <Card className="mb-6 border-0 shadow-md overflow-hidden">
          <Collapsible open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer bg-gradient-to-r from-slate-100 via-blue-50 to-indigo-50 hover:from-slate-200 hover:via-blue-100 hover:to-indigo-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center shadow-sm">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-800">Pengaturan Profil</CardTitle>
                      <CardDescription className="text-slate-600">
                        Edit nama, email, WhatsApp, dan password
                      </CardDescription>
                    </div>
                  </div>
                  {isProfileOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
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
                  <div className="sm:col-span-2">
                    {profileMessage && (
                      <p className={`text-sm ${profileMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                        {profileMessage.text}
                      </p>
                    )}
                    <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="mt-2 rounded-full">
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        "Simpan Perubahan"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Password Reset */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-pink-50 rounded-xl">
                  <h4 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Ubah Password
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-slate-700">
                        Password Saat Ini
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-slate-700">
                        Password Baru
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-slate-700">
                        Konfirmasi Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-white"
                      />
                    </div>
                  </div>
                  {passwordMessage && (
                    <p
                      className={`text-sm mt-3 ${passwordMessage.type === "success" ? "text-green-600" : "text-red-600"}`}
                    >
                      {passwordMessage.text}
                    </p>
                  )}
                  <Button
                    onClick={handleResetPassword}
                    disabled={isResettingPassword || !currentPassword || !newPassword || !confirmPassword}
                    variant="outline"
                    className="mt-4 rounded-full bg-white"
                  >
                    {isResettingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Mengubah...
                      </>
                    ) : (
                      "Ubah Password"
                    )}
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Purchase History */}
        <Card className="mb-6 border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-100 via-blue-50 to-cyan-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center shadow-sm">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-800">Riwayat Pembelian</CardTitle>
                <CardDescription className="text-slate-600">Daftar semua pesanan analisis data Anda</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {userOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-medium text-slate-800 mb-2">Belum ada pesanan</h3>
                <p className="text-sm text-slate-600 mb-6">Mulai pesanan pertama Anda sekarang</p>
                <Link href="/order">
                  <Button className="rounded-full gap-2">
                    <Plus className="w-4 h-4" />
                    Pesan Sekarang
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((order) => {
                    const status = statusConfig[order.status]
                    const StatusIcon = status.icon

                    return (
                      <div
                        key={order.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-slate-500">{order.id}</span>
                            <Badge variant="secondary" className={status.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-slate-800 truncate">{order.researchTitle}</h4>
                          <p className="text-sm text-slate-600">
                            {order.analysisMethod.name} - {order.package.name}
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                          <span className="font-semibold text-slate-800">{order.package.priceFormatted}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6 border-0 shadow-md overflow-hidden">
          <Collapsible open={isReviewOpen} onOpenChange={setIsReviewOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer bg-gradient-to-r from-pink-100 via-rose-50 to-orange-50 hover:from-pink-200 hover:via-rose-100 hover:to-orange-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center shadow-sm">
                      <MessageSquare className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-800">Ulasan & Rating</CardTitle>
                      <CardDescription className="text-slate-600">
                        Berikan ulasan untuk proyek yang sudah selesai ({completedOrders.length} proyek)
                      </CardDescription>
                    </div>
                  </div>
                  {isReviewOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-6 space-y-6">
                {completedOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-pink-400" />
                    </div>
                    <h3 className="font-medium text-slate-800 mb-2">Belum ada proyek selesai</h3>
                    <p className="text-sm text-slate-600">Ulasan dapat diberikan setelah proyek Anda selesai</p>
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

        {/* Referral Section - Collapsible */}
        <Card className="mb-8 border-0 shadow-md overflow-hidden">
          <Collapsible open={isReferralOpen} onOpenChange={setIsReferralOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer bg-gradient-to-r from-amber-100 via-yellow-50 to-orange-50 hover:from-amber-200 hover:via-yellow-100 hover:to-orange-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center shadow-sm">
                      <Gift className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-800">Program Referral</CardTitle>
                      <CardDescription className="text-slate-600">
                        Bagikan kode referral dan dapatkan poin yang bisa ditukar uang tunai
                      </CardDescription>
                    </div>
                  </div>
                  {isReferralOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-6 space-y-6">
                {/* Stats with gradients */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-100 via-indigo-50 to-slate-50 rounded-xl text-center">
                    <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-800">{user.referralCount || 0}</p>
                    <p className="text-sm text-slate-600">Pengguna Direferensikan</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-50 rounded-xl text-center">
                    <Coins className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(user.referralPoints || 0)}</p>
                    <p className="text-sm text-slate-600">Total Poin</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-50 rounded-xl text-center">
                    <Wallet className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-800">Rp 10.000</p>
                    <p className="text-sm text-slate-600">Per Referral</p>
                  </div>
                </div>

                {/* Generate/Show Code */}
                <div className="p-4 bg-gradient-to-r from-primary/10 via-blue-50 to-indigo-50 border border-primary/20 rounded-xl">
                  <h4 className="font-medium text-slate-800 mb-3">Kode Referral Anda</h4>
                  {referralCode ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-3 font-mono text-lg font-semibold text-primary">
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
                  <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
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
                  <h4 className="font-medium text-slate-800 mb-3">Cara Kerja Program Referral</h4>
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
                      <span>Teman mendaftar dan memasukkan kode saat registrasi</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                        4
                      </span>
                      <span>Anda mendapat Rp 10.000 setelah teman melakukan pembelian</span>
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

        {/* CTA Section with gradient */}
        <Card className="border-0 bg-gradient-to-r from-primary via-primary/90 to-indigo-600 text-primary-foreground shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">Butuh bantuan analisis data?</h3>
                <p className="text-primary-foreground/80">Konsultasikan penelitian Anda dengan tim ahli kami.</p>
              </div>
              <Link href="/order">
                <Button variant="secondary" className="rounded-full gap-2 bg-white text-primary hover:bg-white/90">
                  Pesan Sekarang
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
