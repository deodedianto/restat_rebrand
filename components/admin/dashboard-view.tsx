"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Wallet, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Sample data
const sampleOrders = [
  // January 2026
  { id: "ORD-001", date: "2026-01-15", deadline: "2026-01-25", customer: "John Doe", analysis: "Regresi Linear", package: "Premium", price: 700000, analyst: "Lukman", analystFee: 350000, status: "Selesai" },
  { id: "ORD-002", date: "2026-01-14", deadline: "2026-01-22", customer: "Jane Smith", analysis: "ANOVA", package: "Standard", price: 500000, analyst: "Lani", analystFee: 250000, status: "Progress" },
  { id: "ORD-003", date: "2026-01-13", deadline: "2026-01-20", customer: "Bob Wilson", analysis: "Uji T", package: "Basic", price: 250000, analyst: "Hamka", analystFee: 125000, status: "Menunggu" },
  // December 2025
  { id: "ORD-004", date: "2025-12-20", deadline: "2025-12-30", customer: "Alice Chen", analysis: "Chi-Square", package: "Premium", price: 700000, analyst: "Lukman", analystFee: 350000, status: "Selesai" },
  { id: "ORD-005", date: "2025-12-18", deadline: "2025-12-28", customer: "David Lee", analysis: "Regresi", package: "Standard", price: 500000, analyst: "Lani", analystFee: 250000, status: "Selesai" },
  { id: "ORD-006", date: "2025-12-15", deadline: "2025-12-25", customer: "Emma Watson", analysis: "ANOVA", package: "Basic", price: 250000, analyst: "Hamka", analystFee: 125000, status: "Selesai" },
  { id: "ORD-007", date: "2025-12-10", deadline: "2025-12-20", customer: "Frank Miller", analysis: "Uji T", package: "Premium", price: 700000, analyst: "Lukman", analystFee: 350000, status: "Selesai" },
  { id: "ORD-008", date: "2025-12-08", deadline: "2025-12-18", customer: "Grace Park", analysis: "Korelasi", package: "Standard", price: 500000, analyst: "Lani", analystFee: 250000, status: "Selesai" },
]

const sampleAnalystPayments = [
  // January 2026
  { id: "PAY-001", month: "Januari 2026", analyst: "Lukman", total: 1050000, accountNumber: "1234567890 (BCA)", status: "Dibayar" },
  { id: "PAY-002", month: "Januari 2026", analyst: "Lani", total: 750000, accountNumber: "9876543210 (Mandiri)", status: "Menunggu" },
  { id: "PAY-003", month: "Januari 2026", analyst: "Hamka", total: 375000, accountNumber: "5555666677 (BNI)", status: "Dibayar" },
  // December 2025
  { id: "PAY-004", month: "Desember 2025", analyst: "Lukman", total: 1400000, accountNumber: "1234567890 (BCA)", status: "Dibayar" },
  { id: "PAY-005", month: "Desember 2025", analyst: "Lani", total: 1000000, accountNumber: "9876543210 (Mandiri)", status: "Dibayar" },
  { id: "PAY-006", month: "Desember 2025", analyst: "Hamka", total: 250000, accountNumber: "5555666677 (BNI)", status: "Dibayar" },
  // November 2025
  { id: "PAY-007", month: "November 2025", analyst: "Lukman", total: 1200000, accountNumber: "1234567890 (BCA)", status: "Dibayar" },
  { id: "PAY-008", month: "November 2025", analyst: "Lani", total: 900000, accountNumber: "9876543210 (Mandiri)", status: "Dibayar" },
  { id: "PAY-009", month: "November 2025", analyst: "Hamka", total: 450000, accountNumber: "5555666677 (BNI)", status: "Dibayar" },
]

const samplePengeluaran = [
  // January 2026
  { id: "EXP-001", date: "2026-01-10", type: "Operasional - Server Hosting", amount: 500000 },
  { id: "EXP-002", date: "2026-01-05", type: "Gaji Analis", amount: 5000000 },
  { id: "EXP-003", date: "2026-01-08", type: "Marketing - Iklan Google Ads", amount: 1000000 },
  { id: "EXP-004", date: "2026-01-12", type: "Operasional - Listrik & Internet", amount: 750000 },
  // December 2025
  { id: "EXP-005", date: "2025-12-10", type: "Operasional - Server Hosting", amount: 500000 },
  { id: "EXP-006", date: "2025-12-05", type: "Gaji Analis", amount: 4500000 },
  { id: "EXP-007", date: "2025-12-15", type: "Marketing - Iklan Facebook", amount: 800000 },
  { id: "EXP-008", date: "2025-12-20", type: "Operasional - Supplies", amount: 300000 },
]

// Monthly financial data for chart
const monthlyData = [
  { month: "Jul", pendapatan: 2800000, pengeluaran: 5200000, pendapatanBersih: -2400000 },
  { month: "Aug", pendapatan: 3100000, pengeluaran: 5400000, pendapatanBersih: -2300000 },
  { month: "Sep", pendapatan: 3600000, pengeluaran: 5600000, pendapatanBersih: -2000000 },
  { month: "Oct", pendapatan: 4200000, pengeluaran: 5800000, pendapatanBersih: -1600000 },
  { month: "Nov", pendapatan: 5500000, pengeluaran: 6000000, pendapatanBersih: -500000 },
  { month: "Dec", pendapatan: 7900000, pengeluaran: 6100000, pendapatanBersih: 1800000 },
  { month: "Jan", pendapatan: 8450000, pengeluaran: 7250000, pendapatanBersih: 1200000 },
]

export function DashboardView() {
  const [selectedMonth, setSelectedMonth] = useState("2026-01")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Calculate stats (filtered by month)
  const totalPendapatan = sampleOrders
    .filter(order => order.date.startsWith(selectedMonth))
    .reduce((sum, order) => sum + order.price, 0)

  const totalPengeluaran = samplePengeluaran
    .filter(exp => exp.date.startsWith(selectedMonth))
    .reduce((sum, exp) => sum + exp.amount, 0)

  const pendapatanBersih = totalPendapatan - totalPengeluaran

  // Calculate previous month stats for comparison
  const prevMonth = new Date(selectedMonth + "-01")
  prevMonth.setMonth(prevMonth.getMonth() - 1)
  const prevMonthStr = prevMonth.toISOString().slice(0, 7)

  const prevTotalPendapatan = sampleOrders
    .filter(order => order.date.startsWith(prevMonthStr))
    .reduce((sum, order) => sum + order.price, 0)

  const prevTotalPengeluaran = samplePengeluaran
    .filter(exp => exp.date.startsWith(prevMonthStr))
    .reduce((sum, exp) => sum + exp.amount, 0)

  const prevPendapatanBersih = prevTotalPendapatan - prevTotalPengeluaran

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { percentage: null, absolute: current }
    const percentage = ((current - previous) / previous) * 100
    const absolute = current - previous
    return { percentage, absolute }
  }

  const totalPendapatanChange = calculateChange(totalPendapatan, prevTotalPendapatan)
  const totalPengeluaranChange = calculateChange(totalPengeluaran, prevTotalPengeluaran)
  const pendapatanBersihChange = calculateChange(pendapatanBersih, prevPendapatanBersih)

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-600 mt-1">Ringkasan keuangan dan statistik</p>
      </div>

      {/* Month Filter */}
      <div className="mb-6">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium"
        >
          <option value="2026-01">Januari 2026</option>
          <option value="2025-12">Desember 2025</option>
          <option value="2025-11">November 2025</option>
          <option value="2025-10">Oktober 2025</option>
        </select>
      </div>

      {/* Financial Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Pendapatan */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2">Total Pendapatan</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalPendapatan)}</p>
                {totalPendapatanChange.percentage !== null && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <span className={cn(
                      "flex items-center",
                      totalPendapatanChange.percentage >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {totalPendapatanChange.percentage >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                      {totalPendapatanChange.percentage.toFixed(1)}%
                    </span>
                    <span className={cn(
                      "flex items-center",
                      totalPendapatanChange.absolute >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {totalPendapatanChange.absolute >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                      {formatCurrency(totalPendapatanChange.absolute)}
                    </span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
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
                {totalPengeluaranChange.percentage !== null && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <span className={cn(
                      "flex items-center",
                      totalPengeluaranChange.percentage <= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {totalPengeluaranChange.percentage >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                      {totalPengeluaranChange.percentage.toFixed(1)}%
                    </span>
                    <span className={cn(
                      "flex items-center",
                      totalPengeluaranChange.absolute <= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {totalPengeluaranChange.absolute >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                      {formatCurrency(totalPengeluaranChange.absolute)}
                    </span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
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
                {pendapatanBersihChange.percentage !== null && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <span className={cn(
                      "flex items-center",
                      pendapatanBersihChange.percentage >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {pendapatanBersihChange.percentage >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                      {pendapatanBersihChange.percentage.toFixed(1)}%
                    </span>
                    <span className={cn(
                      "flex items-center",
                      pendapatanBersihChange.absolute >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {pendapatanBersihChange.absolute >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                      {formatCurrency(pendapatanBersihChange.absolute)}
                    </span>
                  </div>
                )}
              </div>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
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

      {/* Monthly Combo Chart */}
      <Card className="border-0 shadow-lg mb-8">
        <CardHeader>
          <CardTitle>Tren Keuangan Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="pendapatan" fill="#10b981" name="Pendapatan" />
              <Bar dataKey="pengeluaran" fill="#ef4444" name="Pengeluaran" />
              <Line type="monotone" dataKey="pendapatanBersih" stroke="#3b82f6" strokeWidth={2} name="Pendapatan Bersih" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pembayaran Analis */}
      <Card className="border-0 shadow-lg mb-8">
        <CardHeader>
          <CardTitle>Pembayaran Analis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Bulan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nama Analis</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">No Rekening</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sampleAnalystPayments.filter(payment => {
                  const monthMap: Record<string, string> = {
                    "Januari 2026": "2026-01",
                    "Desember 2025": "2025-12",
                    "November 2025": "2025-11",
                    "Oktober 2025": "2025-10",
                  }
                  return monthMap[payment.month] === selectedMonth
                }).map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-600">{payment.month}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{payment.analyst}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{formatCurrency(payment.total)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{payment.accountNumber}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        payment.status === "Dibayar" ? "bg-green-100 text-green-700" :
                        payment.status === "Menunggu" ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Order Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ID Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Analisis</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Harga</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sampleOrders.filter(order => order.date.startsWith(selectedMonth)).slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{order.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{order.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{order.customer}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{order.analysis}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{formatCurrency(order.price)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        order.status === "Selesai" ? "bg-green-100 text-green-700" :
                        order.status === "Progress" ? "bg-blue-100 text-blue-700" :
                        "bg-orange-100 text-orange-700"
                      )}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
