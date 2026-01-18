"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Gift, ChevronDown, ChevronUp, Copy, Check, Users, Coins, Wallet, Tag, Loader2 } from "lucide-react"

interface User {
  referralCount?: number
  referralPoints?: number
}

interface ReferralProgramProps {
  user: User
  referralCode: string
  onGenerateCode?: () => void
  onCopyCode?: () => void
  onRedeemPoints?: () => void
}

export function ReferralProgram({
  user,
  referralCode,
  onGenerateCode,
  onCopyCode,
  onRedeemPoints,
}: ReferralProgramProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [redeemAmount, setRedeemAmount] = useState("")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleCopyCode = () => {
    if (onCopyCode) {
      onCopyCode()
    }
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleGenerateCode = () => {
    setIsGenerating(true)
    if (onGenerateCode) {
      onGenerateCode()
    }
    setTimeout(() => setIsGenerating(false), 1000)
  }

  return (
    <Card className="mb-3 sm:mb-6 border-0 shadow-md overflow-hidden bg-white py-2.5 px-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer bg-white hover:bg-slate-50 transition-colors py-2 px-4 sm:px-6 gap-0.5">
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
              {isOpen ? (
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
                <Button onClick={onRedeemPoints} className="gap-2 rounded-full">
                  <Coins className="w-4 h-4" />
                  Redeem
                </Button>
              </div>
            </div>

            {/* How it Works */}
            <div className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl">
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
                  <span>Teman Anda mendaftar dengan kode referral</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    4
                  </span>
                  <span>Dapatkan Rp 10.000 untuk setiap transaksi yang mereka lakukan</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    5
                  </span>
                  <span>Tukar poin menjadi uang tunai kapan saja</span>
                </li>
              </ol>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
