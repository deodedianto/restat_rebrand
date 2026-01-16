"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useOrder, analysisMethods, pricingPackages } from "@/lib/order-context"
import { cn } from "@/lib/utils"

type Step = "analysis" | "package" | "details"

const steps: { id: Step; label: string; number: number }[] = [
  { id: "analysis", label: "Pilih Analisis", number: 1 },
  { id: "package", label: "Pilih Paket", number: 2 },
  { id: "details", label: "Detail Penelitian", number: 3 },
]

export default function OrderPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const {
    selectedAnalysis,
    selectedPackage,
    researchTitle,
    description,
    setSelectedAnalysis,
    setSelectedPackage,
    setResearchTitle,
    setDescription,
  } = useOrder()

  const [currentStep, setCurrentStep] = useState<Step>("analysis")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/order")
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const canProceedToPackage = selectedAnalysis !== null
  const canProceedToDetails = selectedPackage !== null
  const canProceedToCheckout = researchTitle.trim() !== "" && description.trim() !== ""

  const handleNext = () => {
    if (currentStep === "analysis" && canProceedToPackage) {
      setCurrentStep("package")
    } else if (currentStep === "package" && canProceedToDetails) {
      setCurrentStep("details")
    } else if (currentStep === "details" && canProceedToCheckout) {
      router.push("/checkout")
    }
  }

  const handleBack = () => {
    if (currentStep === "package") {
      setCurrentStep("analysis")
    } else if (currentStep === "details") {
      setCurrentStep("package")
    }
  }

  const getCurrentStepIndex = () => steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">ReStat</span>
            </Link>

            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors",
                      getCurrentStepIndex() > index
                        ? "bg-accent text-accent-foreground"
                        : getCurrentStepIndex() === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {getCurrentStepIndex() > index ? <Check className="w-5 h-5" /> : step.number}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-2 hidden sm:block",
                      getCurrentStepIndex() >= index ? "text-foreground font-medium" : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-16 sm:w-24 h-1 mx-2 rounded-full",
                      getCurrentStepIndex() > index ? "bg-accent" : "bg-muted",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Select Analysis Method */}
          {currentStep === "analysis" && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground">Pilih Metode Analisis</h1>
                <p className="text-muted-foreground mt-2">Pilih metode analisis yang sesuai dengan penelitian Anda</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysisMethods.map((method) => (
                  <Card
                    key={method.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedAnalysis?.id === method.id
                        ? "border-2 border-accent bg-accent/5"
                        : "border-border hover:border-accent/50",
                    )}
                    onClick={() => setSelectedAnalysis(method)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                            selectedAnalysis?.id === method.id ? "border-accent bg-accent" : "border-muted-foreground",
                          )}
                        >
                          {selectedAnalysis?.id === method.id && <Check className="w-3 h-3 text-accent-foreground" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{method.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Package */}
          {currentStep === "package" && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground">Pilih Paket Layanan</h1>
                <p className="text-muted-foreground mt-2">
                  Metode terpilih: <span className="font-medium text-accent">{selectedAnalysis?.name}</span>
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {pricingPackages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md relative",
                      selectedPackage?.id === pkg.id
                        ? "border-2 border-accent bg-accent/5"
                        : "border-border hover:border-accent/50",
                      pkg.id === "premium" && "md:scale-105",
                    )}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    {pkg.id === "premium" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Best Deal
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-semibold text-foreground">{pkg.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                      </div>

                      <div className="text-center mb-6">
                        <span className="text-sm text-muted-foreground">Mulai</span>
                        <div className="text-2xl font-bold text-foreground">{pkg.priceFormatted}</div>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-accent flex-shrink-0" />
                            <span className="text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div
                        className={cn(
                          "w-full h-10 rounded-full flex items-center justify-center font-medium text-sm",
                          selectedPackage?.id === pkg.id
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-secondary-foreground",
                        )}
                      >
                        {selectedPackage?.id === pkg.id ? "Terpilih" : "Pilih Paket"}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Research Details */}
          {currentStep === "details" && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground">Detail Penelitian</h1>
                <p className="text-muted-foreground mt-2">Ceritakan tentang penelitian Anda</p>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="mb-6 p-4 bg-secondary/50 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Pesanan Anda</p>
                        <p className="font-medium text-foreground">
                          {selectedAnalysis?.name} - Paket {selectedPackage?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-xl font-bold text-accent">{selectedPackage?.priceFormatted}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="title">Judul Penelitian</Label>
                      <Input
                        id="title"
                        placeholder="Masukkan judul skripsi/tesis/penelitian Anda"
                        value={researchTitle}
                        onChange={(e) => setResearchTitle(e.target.value)}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Deskripsi Penelitian</Label>
                      <Textarea
                        id="description"
                        placeholder="Jelaskan secara singkat tentang penelitian Anda, variabel yang digunakan, jumlah data, dll."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === "analysis"}
              className="rounded-full gap-2 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>

            <Button
              onClick={handleNext}
              disabled={
                (currentStep === "analysis" && !canProceedToPackage) ||
                (currentStep === "package" && !canProceedToDetails) ||
                (currentStep === "details" && !canProceedToCheckout)
              }
              className="rounded-full gap-2"
            >
              {currentStep === "details" ? "Lanjut ke Checkout" : "Lanjutkan"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
