"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useOrder } from "@/lib/order-context"
import { cn } from "@/lib/utils"

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
  const { selectedAnalysis, selectedPackage, researchTitle, description, submitOrder } = useOrder()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer")
  const [isProcessing, setIsProcessing] = useState(false)
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null)

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

  const handleConfirmPayment = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const order = submitOrder(user.id)
    router.push(`/payment-confirmation?orderId=${order.id}`)
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

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Paket {selectedPackage.name}</span>
                    <span className="text-foreground">{selectedPackage.priceFormatted}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-accent text-lg">{selectedPackage.priceFormatted}</span>
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
                  <p className="text-2xl font-bold text-accent">{selectedPackage.priceFormatted}</p>
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
