import { useState } from "react"

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
  { id: "PAY-003", month: "Januari 2026", analyst: "Hamka", total: 375000, accountNumber: "5555666677 (BNI)", status: "Belum Dibayar" },
  { id: "PAY-010", month: "Januari 2026", analyst: "Andi", total: 525000, accountNumber: "1122334455 (BRI)", status: "Belum Dibayar" },
  // December 2025
  { id: "PAY-004", month: "Desember 2025", analyst: "Lukman", total: 1400000, accountNumber: "1234567890 (BCA)", status: "Dibayar" },
  { id: "PAY-005", month: "Desember 2025", analyst: "Lani", total: 1000000, accountNumber: "9876543210 (Mandiri)", status: "Dibayar" },
  { id: "PAY-006", month: "Desember 2025", analyst: "Hamka", total: 250000, accountNumber: "5555666677 (BNI)", status: "Belum Dibayar" },
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

const sampleReferralPayments = [
  // January 2026
  { id: "REF-001", date: "2026-01-15", userName: "John Doe", referralCode: "RESTAT2024", amount: 50000, bankName: "BCA", accountNumber: "1234567890", status: "Dibayar" },
  { id: "REF-002", date: "2026-01-14", userName: "Jane Smith", referralCode: "RESTAT2025", amount: 100000, bankName: "Mandiri", accountNumber: "9876543210", status: "Belum Dibayar" },
  { id: "REF-003", date: "2026-01-12", userName: "Bob Wilson", referralCode: "RESTAT2026", amount: 75000, bankName: "BNI", accountNumber: "5555666677", status: "Menunggu" },
  { id: "REF-004", date: "2026-01-10", userName: "Alice Chen", referralCode: "RESTAT2027", amount: 200000, bankName: "BRI", accountNumber: "1111222233", status: "Belum Dibayar" },
  { id: "REF-009", date: "2026-01-08", userName: "Michael Jordan", referralCode: "RESTAT2028", amount: 120000, bankName: "BCA", accountNumber: "9988776655", status: "Diproses" },
  // December 2025
  { id: "REF-005", date: "2025-12-20", userName: "David Lee", referralCode: "RESTAT2020", amount: 150000, bankName: "BCA", accountNumber: "4444555566", status: "Dibayar" },
  { id: "REF-006", date: "2025-12-18", userName: "Emma Watson", referralCode: "RESTAT2021", amount: 80000, bankName: "Mandiri", accountNumber: "7777888899", status: "Belum Dibayar" },
  { id: "REF-007", date: "2025-12-15", userName: "Frank Miller", referralCode: "RESTAT2022", amount: 120000, bankName: "BNI", accountNumber: "3333444455", status: "Dibayar" },
  { id: "REF-008", date: "2025-12-10", userName: "Grace Park", referralCode: "RESTAT2023", amount: 90000, bankName: "BRI", accountNumber: "6666777788", status: "Dibayar" },
]

// Unpaid orders for follow-up
const sampleUnpaidOrders = [
  // January 2026
  { id: "ORD-101", date: "2026-01-20", customer: "Ahmad Rizki", email: "ahmad.rizki@example.com", phone: "+6281234567890", analysis: "Regresi Logistik", package: "Premium", total: 700000 },
  { id: "ORD-102", date: "2026-01-18", customer: "Siti Nurhaliza", email: "siti.nur@example.com", phone: "+6281234567891", analysis: "ANOVA", package: "Standard", total: 500000 },
  { id: "ORD-103", date: "2026-01-15", customer: "Budi Santoso", email: "budi.santoso@example.com", phone: "+6281234567892", analysis: "Uji T", package: "Basic", total: 250000 },
  { id: "ORD-104", date: "2026-01-17", customer: "Dewi Lestari", email: "dewi.lestari@example.com", phone: "+6281234567893", analysis: "Chi-Square", package: "Premium", total: 700000 },
  { id: "ORD-105", date: "2026-01-22", customer: "Rudi Hartono", email: "rudi.hartono@example.com", phone: "+6281234567894", analysis: "Korelasi", package: "Standard", total: 500000 },
]

export const monthlyData = [
  { month: "Jul", pendapatan: 2800000, pengeluaran: 5200000, pendapatanBersih: -2400000 },
  { month: "Aug", pendapatan: 3100000, pengeluaran: 5400000, pendapatanBersih: -2300000 },
  { month: "Sep", pendapatan: 3600000, pengeluaran: 5600000, pendapatanBersih: -2000000 },
  { month: "Oct", pendapatan: 4200000, pengeluaran: 5800000, pendapatanBersih: -1600000 },
  { month: "Nov", pendapatan: 5500000, pengeluaran: 6000000, pendapatanBersih: -500000 },
  { month: "Dec", pendapatan: 7900000, pengeluaran: 6100000, pendapatanBersih: 1800000 },
  { month: "Jan", pendapatan: 8450000, pengeluaran: 7250000, pendapatanBersih: 1200000 },
]

export function useDashboardStats() {
  const [selectedMonth, setSelectedMonth] = useState("2026-01")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Status priority for sorting (lower number = higher priority)
  const getStatusPriority = (status: string): number => {
    switch (status) {
      case "Belum Dibayar":
        return 1
      case "Menunggu":
        return 2
      case "Diproses":
        return 3
      case "Dibayar":
        return 4
      default:
        return 5
    }
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

  // Get recent analyst payments (filtered by month - by parsing the month string)
  const monthName = new Date(selectedMonth + "-01").toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  const recentAnalystPayments = sampleAnalystPayments
    .filter(payment => payment.month.toLowerCase().includes(monthName.toLowerCase().split(' ')[0]))
    .sort((a, b) => {
      // Sort by status priority first
      const priorityDiff = getStatusPriority(a.status) - getStatusPriority(b.status)
      if (priorityDiff !== 0) return priorityDiff
      // If same status, sort by total amount (descending)
      return b.total - a.total
    })
    .slice(0, 10)

  // Get referral payments (filtered by month)
  const referralPayments = sampleReferralPayments
    .filter(payment => payment.date.startsWith(selectedMonth))
    .sort((a, b) => {
      // Sort by status priority first
      const priorityDiff = getStatusPriority(a.status) - getStatusPriority(b.status)
      if (priorityDiff !== 0) return priorityDiff
      // If same status, sort by date (descending - newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    .slice(0, 10)

  // Get unpaid orders for follow-up
  const today = new Date()
  const followUpOrders = sampleUnpaidOrders
    .map(order => {
      const orderDate = new Date(order.date)
      const daysOverdue = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
      return {
        ...order,
        daysOverdue
      }
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue) // Sort by most overdue first

  return {
    selectedMonth,
    setSelectedMonth,
    formatCurrency,
    totalPendapatan,
    totalPengeluaran,
    pendapatanBersih,
    totalPendapatanChange,
    totalPengeluaranChange,
    pendapatanBersihChange,
    recentAnalystPayments,
    referralPayments,
    followUpOrders,
  }
}
