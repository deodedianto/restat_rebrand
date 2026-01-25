"use client"

import { useDashboardStats } from "./use-dashboard-stats"
import { FinancialScorecards } from "./financial-scorecards"
import { FinancialChart } from "./financial-chart"
import { PembayaranAnalisTable } from "./pembayaran-analis-table"
import { PembayaranReferalTable } from "./pembayaran-referal-table"
import { ButuhFollowUpTable } from "./butuh-follow-up-table"

export function DashboardView() {
  const stats = useDashboardStats()

  if (stats.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-600 mt-1">Ringkasan keuangan dan statistik</p>
      </div>

      {/* Month Filter */}
      <div className="mb-6">
        <select
          value={stats.selectedMonth}
          onChange={(e) => stats.setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium"
        >
          {stats.availableMonths.length === 0 ? (
            <option value="">Belum ada data</option>
          ) : (
            stats.availableMonths.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Financial Stats Cards */}
      <FinancialScorecards
        totalPendapatan={stats.totalPendapatan}
        totalPengeluaran={stats.totalPengeluaran}
        pendapatanBersih={stats.pendapatanBersih}
        totalPendapatanChange={stats.totalPendapatanChange}
        totalPengeluaranChange={stats.totalPengeluaranChange}
        pendapatanBersihChange={stats.pendapatanBersihChange}
        formatCurrency={stats.formatCurrency}
      />

      {/* Financial Chart */}
      <FinancialChart
        data={stats.monthlyData}
        formatCurrency={stats.formatCurrency}
      />

      {/* Pembayaran Analis Table */}
      <PembayaranAnalisTable
        payments={stats.recentAnalystPayments}
        formatCurrency={stats.formatCurrency}
      />

      {/* Pembayaran Program Referal Table */}
      <div className="mb-8">
        <PembayaranReferalTable
          payments={stats.referralPayments}
          formatCurrency={stats.formatCurrency}
        />
      </div>

      {/* Butuh di Follow up Table */}
      <ButuhFollowUpTable
        orders={stats.followUpOrders}
        formatCurrency={stats.formatCurrency}
      />
    </div>
  )
}
