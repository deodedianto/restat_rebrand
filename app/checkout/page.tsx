"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  BarChart3,
  ArrowLeft,
  Check,
  Loader2,
  CreditCard,
  Landmark,
  Wallet,
  Copy,
  CheckCircle,
  FileText,
  Tag,
  X,
  Gift,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useOrder, type Order } from "@/lib/order-context"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"
import { useReferralSettings } from "@/lib/hooks/use-referral-settings"

type PaymentMethod = "bank_transfer" | "ewallet" | "qris"

const paymentMethods = [
  {
    id: "bank_transfer" as PaymentMethod,
    label: "Transfer Bank",
    description: "BCA, Mandiri, BRI, BNI",
    icon: Landmark,
  },
  {
    id: "ewallet" as PaymentMethod,
    label: "E-Wallet",
    description: "GoPay, OVO, DANA, ShopeePay",
    icon: Wallet,
  },
  {
    id: "qris" as PaymentMethod,
    label: "QRIS",
    description: "Scan QR untuk semua aplikasi",
    icon: CreditCard,
  },
]

const bankAccounts = [
  { bank: "BCA", number: "1234567890", name: "ReStat Indonesia" },
  { bank: "Mandiri", number: "0987654321", name: "ReStat Indonesia" },
  { bank: "BRI", number: "5678901234", name: "ReStat Indonesia" },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { selectedAnalysis, selectedPackage, researchTitle, description, submitOrder, confirmPayment } = useOrder()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer")
  const [isProcessing, setIsProcessing] = useState(false)
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null)
  
  // Voucher/Referral Code State
  const [discountCode, setDiscountCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<{
    type: 'referral' | 'voucher'
    code: string
    amount: number
    rewardAmount?: number // Reward for referrer (only for referral type)
  } | null>(null)
  const [isValidatingCode, setIsValidatingCode] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)
  
  // Fetch referral settings
  const { settings: referralSettings } = useReferralSettings()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/order")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!authLoading && user && (!selectedAnalysis || !selectedPackage || !researchTitle)) {
      router.push("/order")
    }
  }, [authLoading, user, selectedAnalysis, selectedPackage, researchTitle, router])

  if (authLoading || !selectedAnalysis || !selectedPackage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const copyToClipboard = (text: string, accountId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAccount(accountId)
    setTimeout(() => setCopiedAccount(null), 2000)
  }

  const calculateDiscount = (basePrice: number, discountType: 'percentage' | 'fixed', discountValue: number): number => {
    if (discountType === 'percentage') {
      return Math.floor(basePrice * (discountValue / 100))
    }
    return discountValue
  }

  const handleApplyCode = async () => {
    if (!discountCode.trim()) {
      setCodeError("Masukkan kode voucher atau referral")
      return
    }

    setIsValidatingCode(true)
    setCodeError(null)

    try {
      const codeUpper = discountCode.trim().toUpperCase()
      const basePrice = selectedPackage?.price || 0

      // Check if it's a referral code (starts with RESTAT)
      if (codeUpper.startsWith('RESTAT')) {
        const { data: referrer, error } = await supabase
          .from('users')
          .select('id, name, referral_code')
          .eq('referral_code', codeUpper)
          .single()

        if (error) {
          console.error('Referral code query error:', error)
          // Check if it's a "not found" error vs other errors
          if (error.code === 'PGRST116') {
            setCodeError("Kode referral tidak ditemukan")
          } else {
            setCodeError(`Error: ${error.message}`)
          }
          setIsValidatingCode(false)
          return
        }

        if (!referrer) {
          setCodeError("Kode referral tidak valid")
          setIsValidatingCode(false)
          return
        }

        // Check if user is trying to use their own referral code
        if (referrer.id === user?.id) {
          setCodeError("Tidak dapat menggunakan kode referral sendiri")
          setIsValidatingCode(false)
          return
        }

        // Calculate referral discount for referred user (person using the code)
        const discountAmount = calculateDiscount(
          basePrice,
          referralSettings.discountType,
          referralSettings.discountValue
        )

        // Calculate reward amount for referrer (person who shared the code)
        const rewardAmount = calculateDiscount(
          basePrice,
          referralSettings.rewardType,
          referralSettings.rewardValue
        )

        setAppliedDiscount({
          type: 'referral',
          code: codeUpper,
          amount: discountAmount,
          rewardAmount: rewardAmount
        })
        setCodeError(null)
      } else {
        // It's a voucher code - validate in vouchers table
        const { data: voucher, error } = await supabase
          .from('vouchers')
          .select('*')
          .eq('voucher_code', codeUpper)
          .eq('is_active', true)
          .single()

        if (error || !voucher) {
          setCodeError("Kode voucher tidak valid")
          setIsValidatingCode(false)
          return
        }

        // Check voucher validity period
        const now = new Date()
        if (voucher.valid_from && new Date(voucher.valid_from) > now) {
          setCodeError("Voucher belum dapat digunakan")
          setIsValidatingCode(false)
          return
        }
        if (voucher.valid_until && new Date(voucher.valid_until) < now) {
          setCodeError("Voucher sudah kadaluarsa")
          setIsValidatingCode(false)
          return
        }

        // Check minimum order amount
        if (voucher.min_order_amount && basePrice < voucher.min_order_amount) {
          setCodeError(`Minimal pembelian ${new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(voucher.min_order_amount)}`)
          setIsValidatingCode(false)
          return
        }

        // Check usage limits
        if (voucher.max_usage && voucher.current_usage >= voucher.max_usage) {
          setCodeError("Voucher sudah mencapai batas penggunaan")
          setIsValidatingCode(false)
          return
        }

        // Calculate voucher discount
        const discountAmount = calculateDiscount(
          basePrice,
          voucher.discount_type,
          voucher.discount_value
        )

        setAppliedDiscount({
          type: 'voucher',
          code: codeUpper,
          amount: discountAmount
        })
        setCodeError(null)
      }
    } catch (error) {
      console.error('Code validation error:', error)
      setCodeError("Terjadi kesalahan saat memvalidasi kode")
    } finally {
      setIsValidatingCode(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode("")
    setCodeError(null)
  }

  const finalPrice = selectedPackage ? selectedPackage.price - (appliedDiscount?.amount || 0) : 0
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleConfirmPayment = async () => {
    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Get the most recent unpaid order from Supabase
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('payment_status', 'Belum Dibayar')
        .eq('is_record_deleted', false)
        .order('created_at', { ascending: false })
        .limit(1)

      const pendingOrderId = (orders as any)?.[0]?.id

      // Update order status to "Dibayar" and add discount info if there's a pending order
      if (pendingOrderId) {
        const updateData: any = {
          payment_status: 'Dibayar',
          paid_at: new Date().toISOString(),
          price: finalPrice, // Update with final price after discount
        }

        // Add discount data based on type
        if (appliedDiscount) {
          if (appliedDiscount.type === 'referral') {
            updateData.referral_code_used = appliedDiscount.code
            updateData.discount_referal = appliedDiscount.amount
            updateData.referral_reward_amount = appliedDiscount.rewardAmount || 0
          } else {
            updateData.voucher_code = appliedDiscount.code
            updateData.discount_voucher = appliedDiscount.amount
          }
        }

        const { error } = await supabase
          .from('orders')
          .update(updateData)
          .eq('id', pendingOrderId)
          .eq('user_id', user.id)

        if (error) {
          console.error('Order update error:', error)
          throw error
        }

        // If voucher was used, increment usage count
        if (appliedDiscount?.type === 'voucher') {
          const { error: voucherError } = await supabase.rpc('increment_voucher_usage', {
            voucher_code_param: appliedDiscount.code
          })
          if (voucherError) {
            console.error('Voucher increment error:', voucherError)
            // Don't throw here - payment already confirmed, just log the error
          }
        }
      }
      
      // Redirect to dashboard with Proses Pengerjaan section opened
      router.push("/dashboard#proses-pengerjaan")
    } catch (error: any) {
      console.error('Payment confirmation error:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      })
      alert(`Terjadi kesalahan saat mengkonfirmasi pembayaran: ${error?.message || 'Unknown error'}. Silakan coba lagi.`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">ReStat</span>
            </Link>

            <Link
              href="/order"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground mt-2">Selesaikan pembayaran untuk memulai analisis data Anda</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1 lg:order-2">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{researchTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAnalysis.name} - {selectedPackage.name}
                      </p>
                    </div>
                  </div>

                  {description && (
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paket {selectedPackage.name}</span>
                    <span className="text-foreground">{selectedPackage.priceFormatted}</span>
                  </div>
                  
                  {appliedDiscount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 flex items-center gap-1">
                        {appliedDiscount.type === 'referral' ? <Gift className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                        Diskon ({appliedDiscount.code})
                      </span>
                      <span className="text-green-600 font-medium">
                        -{formatCurrency(appliedDiscount.amount)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span className="text-foreground">Total</span>
                    <span className="text-accent text-lg">{formatCurrency(finalPrice)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-sm font-medium text-foreground mb-2">Termasuk:</h4>
                  <ul className="space-y-1">
                    {selectedPackage.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-accent flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-2 lg:order-1 space-y-6">
            {/* Voucher/Referral Code Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Kode Voucher atau Referral
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!appliedDiscount ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Masukkan kode voucher atau referral (RESTATXXXXXX)"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value.toUpperCase())
                          setCodeError(null)
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleApplyCode()
                          }
                        }}
                        disabled={isValidatingCode}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleApplyCode}
                        disabled={isValidatingCode || !discountCode.trim()}
                        className="gap-2"
                      >
                        {isValidatingCode ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Validasi...
                          </>
                        ) : (
                          'Gunakan'
                        )}
                      </Button>
                    </div>
                    {codeError && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <X className="w-4 h-4" />
                        {codeError}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      💡 Kode referral dimulai dengan <strong>RESTAT</strong>. Hanya satu diskon yang dapat digunakan.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      {appliedDiscount.type === 'referral' ? (
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Gift className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Tag className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-green-800">
                          {appliedDiscount.type === 'referral' ? 'Kode Referral' : 'Kode Voucher'} Diterapkan
                        </p>
                        <p className="text-sm text-green-600">
                          {appliedDiscount.code} • Hemat {formatCurrency(appliedDiscount.amount)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveDiscount}
                      className="text-green-600 hover:text-green-700 hover:bg-green-100"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metode Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                          paymentMethod === method.id
                            ? "border-accent bg-accent/5"
                            : "border-border hover:border-accent/50",
                        )}
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                          <method.icon className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{method.label}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detail Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentMethod === "bank_transfer" && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Transfer ke salah satu rekening berikut sesuai dengan total pembayaran:
                    </p>
                    <div className="space-y-3">
                      {bankAccounts.map((account) => (
                        <div
                          key={account.bank}
                          className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl"
                        >
                          <div>
                            <p className="font-semibold text-foreground">{account.bank}</p>
                            <p className="text-lg font-mono text-foreground">{account.number}</p>
                            <p className="text-sm text-muted-foreground">a.n. {account.name}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(account.number, account.bank)}
                            className="gap-2 bg-transparent"
                          >
                            {copiedAccount === account.bank ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
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
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === "ewallet" && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Transfer ke salah satu nomor e-wallet berikut:</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { name: "GoPay", number: "081234567890" },
                        { name: "OVO", number: "081234567890" },
                        { name: "DANA", number: "081234567890" },
                        { name: "ShopeePay", number: "081234567890" },
                      ].map((wallet) => (
                        <div key={wallet.name} className="p-4 bg-secondary/50 rounded-xl">
                          <p className="font-semibold text-foreground">{wallet.name}</p>
                          <p className="font-mono text-foreground">{wallet.number}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === "qris" && (
                  <div className="text-center py-6">
                    <div className="w-48 h-48 bg-card border-2 border-dashed border-border rounded-xl mx-auto flex items-center justify-center mb-4">
                      <div className="text-center">
                        <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">QR Code akan muncul</p>
                        <p className="text-xs text-muted-foreground">setelah konfirmasi</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scan QR code dengan aplikasi e-wallet atau mobile banking Anda
                    </p>
                  </div>
                )}

                <div className="mt-6 p-4 bg-accent/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-accent" />
                    <span className="font-medium text-foreground">Total yang harus dibayar</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground line-through">{selectedPackage.priceFormatted}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Hemat {formatCurrency(appliedDiscount.amount)}
                      </span>
                    </div>
                  )}
                  <p className="text-2xl font-bold text-accent">{formatCurrency(finalPrice)}</p>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleConfirmPayment} disabled={isProcessing} className="w-full h-12 rounded-full gap-2">
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Konfirmasi Pembayaran
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Dengan mengkonfirmasi, Anda menyetujui syarat dan ketentuan layanan ReStat.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
