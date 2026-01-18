"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, ArrowLeft, ArrowRight, Check, Loader2, TrendingUp, Binary, TestTube, GitBranch, Grid3x3, Network, Route, Activity, Database, Share2, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { useOrder, analysisMethods, pricingPackages } from "@/lib/order-context"
import { cn } from "@/lib/utils"
import { BookingModal } from "@/components/booking-modal"

type Step = "analysis" | "package" | "details"

const steps: { id: Step; label: string; number: number }[] = [
  { id: "analysis", label: "Pilih Analisis", number: 1 },
  { id: "package", label: "Pilih Paket", number: 2 },
  { id: "details", label: "Detail Penelitian", number: 3 },
]

// Map analysis methods to icons
const analysisIcons: Record<string, typeof BarChart3> = {
  "regresi-linear": TrendingUp,
  "regresi-logistik": Binary,
  "uji-t": TestTube,
  "anova": BarChart3,
  "korelasi": GitBranch,
  "chi-square": Grid3x3,
  "sem": Network,
  "path-analysis": Route,
  "faktor-analysis": Activity,
  "cluster-analysis": Database,
  "time-series": Activity,
  "deskriptif": ShieldCheck,
}

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
  const [customAnalysisName, setCustomAnalysisName] = useState("")
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState("")

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

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {analysisMethods.map((method, index) => {
                  // Skip time-series and deskriptif, render them separately
                  if (method.id === "time-series" || method.id === "deskriptif") return null
                  
                  const Icon = analysisIcons[method.id] || BarChart3
                  const isSelected = selectedAnalysis?.id === method.id
                  
                  return (
                    <motion.div
                      key={method.id}
                      className={cn(
                        "bg-card rounded-xl p-6 border-2 cursor-pointer group text-center relative shadow-sm transition-all",
                        isSelected
                          ? "border-accent shadow-xl"
                          : "border-border hover:border-accent hover:shadow-xl",
                      )}
                      onClick={() => setSelectedAnalysis(method)}
                      initial={{ opacity: 0, scale: 0.7, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 120
                      }}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-accent-foreground" />
                        </div>
                      )}
                      <div className={cn(
                        "w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 transition-all",
                        isSelected ? "bg-accent/20" : "bg-accent/10 group-hover:bg-accent/20 group-hover:scale-110"
                      )}>
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <h3 className={cn(
                        "text-sm sm:text-base font-medium mb-2 transition-colors",
                        isSelected ? "text-accent" : "text-foreground group-hover:text-accent"
                      )}>
                        {method.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Mulai dari Rp 250.000
                      </p>
                    </motion.div>
                  )
                })}

                {/* Other Card - with custom input */}
                <motion.div
                  className={cn(
                    "bg-card rounded-xl p-6 border-2 cursor-pointer group text-center relative shadow-sm transition-all",
                    selectedAnalysis?.id === "time-series"
                      ? "border-accent shadow-xl"
                      : "border-border hover:border-accent hover:shadow-xl",
                  )}
                  onClick={() => {
                    const otherMethod = analysisMethods.find(m => m.id === "time-series")
                    if (otherMethod) setSelectedAnalysis(otherMethod)
                  }}
                  initial={{ opacity: 0, scale: 0.7, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 10 * 0.05,
                    type: "spring",
                    stiffness: 120
                  }}
                >
                  {selectedAnalysis?.id === "time-series" && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-accent-foreground" />
                    </div>
                  )}
                  <h3 className={cn(
                    "text-sm sm:text-base font-medium mb-2 transition-colors",
                    selectedAnalysis?.id === "time-series" ? "text-accent" : "text-foreground group-hover:text-accent"
                  )}>
                    Lainnya
                  </h3>
                  <Input
                    placeholder="Masukkan jenis analisis"
                    value={customAnalysisName}
                    onChange={(e) => setCustomAnalysisName(e.target.value)}
                    onClick={(e) => {
                      e.stopPropagation()
                      const otherMethod = analysisMethods.find(m => m.id === "time-series")
                      if (otherMethod) setSelectedAnalysis(otherMethod)
                    }}
                    className="mt-2 text-xs sm:text-sm h-8"
                  />
                </motion.div>

                {/* Help/Contact Card */}
                <motion.div
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-gradient-to-br from-slate-100 to-blue-50 rounded-xl p-6 border-2 border-border hover:border-accent hover:shadow-xl transition-all cursor-pointer group text-center shadow-sm"
                  initial={{ opacity: 0, scale: 0.7, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 11 * 0.05,
                    type: "spring",
                    stiffness: 120
                  }}
                >
                  <h3 className="text-sm sm:text-base font-medium mb-2 text-foreground group-hover:text-accent transition-colors">
                    Masih bingung jenis analisismu?
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Jadwalkan konsultasi atau hubungi kami
                  </p>
                </motion.div>
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

              <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                {pricingPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    className={cn(
                      "bg-card rounded-2xl p-6 sm:p-8 border-2 cursor-pointer transition-all relative flex flex-col h-full group",
                      selectedPackage?.id === pkg.id
                        ? "border-accent shadow-xl ring-2 ring-accent/20"
                        : "border-border hover:border-accent/50 shadow-sm hover:shadow-xl",
                    )}
                    onClick={() => setSelectedPackage(pkg)}
                    initial={{ opacity: 0, y: 50, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.15,
                      type: "spring",
                      stiffness: 100
                    }}
                  >
                    {/* Selection Checkmark */}
                    {selectedPackage?.id === pkg.id && (
                      <motion.div 
                        className="absolute -top-3 -right-3 w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-lg"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <Check className="w-5 h-5 text-accent-foreground" />
                      </motion.div>
                    )}

                    {/* Package Badge */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className={cn(
                        "inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold",
                        pkg.name === "Premium" 
                          ? "bg-purple-100 text-purple-700" 
                          : pkg.name === "Standard"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                      )}>
                        {pkg.name}
                      </span>
                    </div>

                    <div className="text-center mb-6 mt-4">
                      <p className="text-sm text-muted-foreground">{pkg.description}</p>
                    </div>

                    <div className="text-center mb-8">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Mulai dari</span>
                      <div className="text-4xl sm:text-5xl font-bold text-foreground mt-2 mb-1">{pkg.priceFormatted}</div>
                      <span className="text-xs text-muted-foreground">per analisis</span>
                    </div>

                    <div className="space-y-1 mb-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-1">Fitur Utama:</p>
                    </div>

                    <ul className="space-y-3 mb-8 flex-grow">
                      {pkg.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3 text-sm">
                          <div className="mt-0.5">
                            <Check className="w-5 h-5 text-accent flex-shrink-0" />
                          </div>
                          <span className="text-foreground leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={cn(
                        "w-full rounded-full shadow-md hover:shadow-lg transition-all mt-auto",
                        selectedPackage?.id === pkg.id
                          ? "bg-accent text-accent-foreground hover:bg-accent/90 ring-2 ring-accent/30"
                          : "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary group-hover:scale-105"
                      )}
                    >
                      {selectedPackage?.id === pkg.id ? "✓ Terpilih" : "Pilih Paket"}
                    </Button>
                  </motion.div>
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
                      <Label htmlFor="deliveryDate">Pengiriman hasil analisa data</Label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="h-12"
                      />
                    </div>

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

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        userName={user?.name}
        userEmail={user?.email}
      />
    </div>
  )
}
