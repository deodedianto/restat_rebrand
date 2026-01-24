"use client"

import { useDashboardStats, monthlyData } from "./use-dashboard-stats"
import { FinancialScorecards } from "./financial-scorecards"
import { FinancialChart } from "./financial-chart"
import { PembayaranAnalisTable } from "./pembayaran-analis-table"
import { PembayaranReferalTable } from "./pembayaran-referal-table"
import { ButuhFollowUpTable } from "./butuh-follow-up-table"

export function DashboardView() {
  const stats = useDashboardStats()

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
          <option value="2026-01">Januari 2026</option>
          <option value="2025-12">Desember 2025</option>
          <option value="2025-11">November 2025</option>
          <option value="2025-10">Oktober 2025</option>
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
        data={monthlyData}
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
