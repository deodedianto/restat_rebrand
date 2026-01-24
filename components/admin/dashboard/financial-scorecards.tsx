"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChangeIndicator {
  percentage: number | null
  absolute: number
}

interface FinancialScorecardsProps {
  totalPendapatan: number
  totalPengeluaran: number
  pendapatanBersih: number
  totalPendapatanChange: ChangeIndicator
  totalPengeluaranChange: ChangeIndicator
  pendapatanBersihChange: ChangeIndicator
  formatCurrency: (value: number) => string
}

export function FinancialScorecards({
  totalPendapatan,
  totalPengeluaran,
  pendapatanBersih,
  totalPendapatanChange,
  totalPengeluaranChange,
  pendapatanBersihChange,
  formatCurrency,
}: FinancialScorecardsProps) {
  const renderChangeIndicator = (change: ChangeIndicator, isExpense: boolean = false) => {
    const { percentage, absolute } = change
    
    if (percentage === null) {
      return (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-slate-500">N/A</span>
        </div>
      )
    }

    const isPositive = absolute > 0
    const showGreen = isExpense ? !isPositive : isPositive
    const showRed = isExpense ? isPositive : !isPositive

    return (
      <div className={cn(
        "flex items-center gap-1 mt-1",
        showGreen && "text-green-600",
        showRed && "text-red-600"
      )}>
        {isPositive ? (
          <ArrowUp className="w-4 h-4" />
        ) : (
          <ArrowDown className="w-4 h-4" />
        )}
        <span className="text-xs font-medium">
          {Math.abs(percentage).toFixed(1)}% ({formatCurrency(Math.abs(absolute))})
        </span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Pendapatan */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Total Pendapatan</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalPendapatan)}</p>
              {renderChangeIndicator(totalPendapatanChange)}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Pengeluaran */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalPengeluaran)}</p>
              {renderChangeIndicator(totalPengeluaranChange, true)}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pendapatan Bersih */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-2">Pendapatan Bersih</p>
              <p className={cn(
                "text-2xl font-bold",
                pendapatanBersih >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(pendapatanBersih)}
              </p>
              {renderChangeIndicator(pendapatanBersihChange)}
            </div>
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              pendapatanBersih >= 0 ? "bg-blue-100" : "bg-orange-100"
            )}>
              <Wallet className={cn(
                "w-6 h-6",
                pendapatanBersih >= 0 ? "text-blue-600" : "text-orange-600"
              )} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
