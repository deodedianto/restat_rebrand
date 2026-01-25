import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"

// Helper function to get referral settings from localStorage
function getReferralSettings() {
  try {
    const stored = localStorage.getItem('restat_referral_settings')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error reading referral settings:', error)
  }
  // Default settings
  return {
    discountType: 'percentage',
    discountValue: 10
  }
}

export function useDashboardStats() {
  const [selectedMonth, setSelectedMonth] = useState("")
  const [availableMonths, setAvailableMonths] = useState<{ value: string; label: string }[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [analystPayments, setAnalystPayments] = useState<any[]>([])
  const [referralPayouts, setReferralPayouts] = useState<any[]>([])
  const [unpaidOrders, setUnpaidOrders] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  // Load data from Supabase
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        // Load ALL orders (we'll filter by paid status later for revenue)
        const { data: ordersData } = await supabase
          .from('orders')
          .select(`
            *,
            user:users(name, email, whatsapp, phone, referral_code, bank_name, bank_account_number),
            analyst:analysts(name, whatsapp, bank_name, bank_account_number)
          `)
          .eq('is_record_deleted', false)
          .order('order_date', { ascending: false })

        const transformedOrders = ordersData?.map((o: any) => ({
          id: o.order_number,
          date: o.order_date,
          deadline: o.deadline_date,
          customer: o.user?.email || 'Unknown',
          customerName: o.user?.name || 'Unknown',
          analysis: o.metode_analisis || 'Unknown',
          package: o.jenis_paket || 'Basic',
          price: o.price,
          analyst: o.analyst?.name || '-',
          analystId: o.analyst_id,
          analystFee: o.analyst_fee || 0,
          analystBankName: o.analyst?.bank_name || 'N/A',
          analystBankAccount: o.analyst?.bank_account_number || 'N/A',
          status: o.work_status,
          paymentStatus: o.payment_status,
          workStatus: o.work_status,
          referralCodeUsed: o.referral_code_used,
          userId: o.user_id,
          userName: o.user?.name || o.user?.email || 'Unknown',
          userReferralCode: o.user?.referral_code,
          userBankName: o.user?.bank_name,
          userBankAccount: o.user?.bank_account_number,
        })) || []
        setOrders(transformedOrders)

        // Load all expenses
        const { data: expensesData } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false })

        const transformedExpenses = expensesData?.map(e => ({
          id: e.id,
          date: e.date,
          type: e.type,
          amount: e.amount,
        })) || []
        setExpenses(transformedExpenses)

        // Calculate analyst payments from COMPLETED orders (payment = Dibayar AND work = Selesai)
        const completedOrders = ordersData?.filter((o: any) => {
          return o.payment_status === 'Dibayar' && 
            o.work_status === 'Selesai' &&
            o.analyst_id && 
            o.analyst_fee
        }) || []

        // Group by analyst and month
        const analystPaymentsMap = new Map<string, any>()
        completedOrders.forEach((o: any) => {
          // Parse date properly to avoid timezone issues
          const [year, month, day] = o.order_date.split('-')
          const orderDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          const monthName = orderDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
          const key = `${o.analyst_id}-${monthName}`
          
          if (!analystPaymentsMap.has(key)) {
            analystPaymentsMap.set(key, {
              id: key,
              month: monthName,
              analystId: o.analyst_id,
              analyst: o.analyst?.name || 'Unknown',
              total: 0,
              accountNumber: `${o.analyst?.bank_account_number || 'N/A'} (${o.analyst?.bank_name || 'N/A'})`,
              status: 'Belum Dibayar', // Default status
            })
          }
          
          const payment = analystPaymentsMap.get(key)
          payment.total += o.analyst_fee
        })

        setAnalystPayments(Array.from(analystPaymentsMap.values()))

        // Calculate referral payouts from PAID orders that used a referral code
        const paidOrdersWithReferral = ordersData?.filter((o: any) => 
          o.payment_status === 'Dibayar' && 
          o.referral_code_used
        ) || []

        // Group by referrer (the person who owns the referral code used)
        const referralPayoutsMap = new Map<string, any>()
        
        for (const order of paidOrdersWithReferral) {
          // Find the user who owns this referral code
          const { data: referrerData } = await supabase
            .from('users')
            .select('id, name, email, referral_code, bank_name, bank_account_number')
            .eq('referral_code', order.referral_code_used)
            .single()

          if (referrerData) {
            const orderDate = new Date(order.order_date)
            const key = `${referrerData.id}-${order.id}`
            
            // Calculate referral reward based on settings
            const settings = getReferralSettings()
            let referralReward = 0
            if (settings.discountType === 'percentage') {
              referralReward = Math.floor(order.price * (settings.discountValue / 100))
            } else {
              referralReward = settings.discountValue
            }
            
            if (!referralPayoutsMap.has(key)) {
              referralPayoutsMap.set(key, {
                id: key,
                date: order.order_date,
                userName: referrerData.name || referrerData.email || 'Unknown',
                referralCode: referrerData.referral_code || 'N/A',
                amount: referralReward,
                bankName: referrerData.bank_name || 'N/A',
                accountNumber: referrerData.bank_account_number || 'N/A',
                status: 'Belum Dibayar', // Default status
                orderId: order.order_number,
              })
            }
          }
        }

        setReferralPayouts(Array.from(referralPayoutsMap.values()))

        // Load unpaid orders for follow-up
        const unpaidOrdersData = ordersData?.filter((o: any) => o.payment_status === 'Belum Dibayar')
        const transformedUnpaidOrders = unpaidOrdersData?.map(o => ({
          id: o.order_number,
          date: o.order_date,
          customer: o.user?.name || o.user?.email || 'Unknown',
          email: o.user?.email || 'N/A',
          phone: o.user?.whatsapp || o.user?.phone || 'N/A',
          analysis: o.metode_analisis || 'Unknown',
          package: o.jenis_paket || 'Basic',
          total: o.price,
        })) || []
        setUnpaidOrders(transformedUnpaidOrders)

        // Generate available months from actual data
        const monthsSet = new Set<string>()
        ordersData?.forEach((o: any) => {
          const monthStr = o.order_date.slice(0, 7) // YYYY-MM
          monthsSet.add(monthStr)
        })
        expensesData?.forEach((e: any) => {
          const monthStr = e.date.slice(0, 7)
          monthsSet.add(monthStr)
        })

        const sortedMonths = Array.from(monthsSet).sort().reverse()
        const monthOptions = sortedMonths.map(monthStr => {
          // Parse YYYY-MM format correctly (e.g., "2026-01")
          const [year, month] = monthStr.split('-')
          const date = new Date(parseInt(year), parseInt(month) - 1, 1) // Month is 0-indexed
          const label = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
          return { value: monthStr, label }
        })

        setAvailableMonths(monthOptions)
        
        // Set default selected month to the most recent one
        if (monthOptions.length > 0 && !selectedMonth) {
          setSelectedMonth(monthOptions[0].value)
        }

        // Calculate monthly trend data based on available data (last 7 months of actual data)
        const calculateMonthlyTrend = () => {
          // Get all unique months from orders and expenses
          const allMonthsSet = new Set<string>()
          ordersData?.forEach((o: any) => {
            allMonthsSet.add(o.order_date.slice(0, 7))
          })
          expensesData?.forEach((e: any) => {
            allMonthsSet.add(e.date.slice(0, 7))
          })
          
          // Sort months and take the last 7
          const sortedMonths = Array.from(allMonthsSet).sort()
          const last7Months = sortedMonths.slice(-7)
          
          const monthsData = last7Months.map(monthStr => {
            // Parse month for label
            const [year, month] = monthStr.split('-')
            const date = new Date(parseInt(year), parseInt(month) - 1, 1)
            const monthLabel = date.toLocaleDateString('en-US', { month: 'short' })
            
            // Calculate revenue for this month (paid orders only)
            const monthRevenue = ordersData?.filter((o: any) => 
              o.order_date.startsWith(monthStr) && o.payment_status === 'Dibayar'
            ).reduce((sum: number, o: any) => sum + o.price, 0) || 0
            
            // Calculate expenses for this month
            const monthExpenses = expensesData?.filter((e: any) => 
              e.date.startsWith(monthStr)
            ).reduce((sum: number, e: any) => sum + e.amount, 0) || 0
            
            return {
              month: monthLabel,
              pendapatan: monthRevenue,
              pengeluaran: monthExpenses,
              pendapatanBersih: monthRevenue - monthExpenses
            }
          })
          
          return monthsData
        }
        
        setMonthlyData(calculateMonthlyTrend())

      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()

    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel('dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadDashboardData()
      })
      .subscribe()

    const expensesSubscription = supabase
      .channel('dashboard-expenses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        loadDashboardData()
      })
      .subscribe()

    return () => {
      ordersSubscription.unsubscribe()
      expensesSubscription.unsubscribe()
    }
  }, []) // Only run on mount

  // Calculate stats (filtered by month)
  const totalPendapatan = orders
    .filter(order => order.date.startsWith(selectedMonth) && order.paymentStatus === 'Dibayar')
    .reduce((sum, order) => sum + order.price, 0)

  const totalPengeluaran = expenses
    .filter(exp => exp.date.startsWith(selectedMonth))
    .reduce((sum, exp) => sum + exp.amount, 0)

  const pendapatanBersih = totalPendapatan - totalPengeluaran

  // Calculate previous month stats for comparison
  let prevMonthStr = ''
  if (selectedMonth) {
    const [year, month] = selectedMonth.split('-')
    const prevMonth = new Date(parseInt(year), parseInt(month) - 1, 1)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    const prevYear = prevMonth.getFullYear()
    const prevMonthNum = String(prevMonth.getMonth() + 1).padStart(2, '0')
    prevMonthStr = `${prevYear}-${prevMonthNum}`
  }

  const prevTotalPendapatan = orders
    .filter(order => order.date.startsWith(prevMonthStr) && order.paymentStatus === 'Dibayar')
    .reduce((sum, order) => sum + order.price, 0)

  const prevTotalPengeluaran = expenses
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
  let monthName = ''
  if (selectedMonth) {
    const [year, month] = selectedMonth.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    monthName = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  }
  
  const recentAnalystPayments = analystPayments
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
  const referralPayments = referralPayouts
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
  const followUpOrders = unpaidOrders
    .map(order => {
      const orderDate = new Date(order.date)
      const daysOverdue = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
      return {
        ...order,
        daysOverdue
      }
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue) // Sort by most overdue first
    .slice(0, 10)

  return {
    selectedMonth,
    setSelectedMonth,
    availableMonths,
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
    monthlyData,
    isLoading,
  }
}
