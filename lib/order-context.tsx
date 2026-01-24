'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { supabase } from './supabase/client'

export interface AnalysisMethod {
  id: string
  name: string
  description: string
}

export interface PricingPackage {
  id: string
  name: string
  price: number
  priceFormatted: string
  description: string
  features: string[]
}

export interface Order {
  id: string
  userId: string
  analysisMethod: AnalysisMethod
  package: PricingPackage
  researchTitle: string
  description: string
  status: "pending" | "processing" | "completed" | "cancelled"
  createdAt: string
  totalPrice: number
}

interface OrderContextType {
  selectedAnalysis: AnalysisMethod | null
  selectedPackage: PricingPackage | null
  researchTitle: string
  description: string
  deliveryDate: string
  setSelectedAnalysis: (analysis: AnalysisMethod | null) => void
  setSelectedPackage: (pkg: PricingPackage | null) => void
  setResearchTitle: (title: string) => void
  setDescription: (desc: string) => void
  setDeliveryDate: (date: string) => void
  clearOrder: () => void
  submitOrder: (userId: string) => Promise<Order>
  createPendingPayment: (userId: string, userName: string, userEmail: string) => Promise<string>
  restoreOrderFromWorkHistory: (workHistoryItem: any) => void
  confirmPayment: (userId: string, orderId: string) => Promise<void>
  orders: Order[]
  loadOrders: () => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export const analysisMethods: AnalysisMethod[] = [
  { id: "regresi-linear", name: "Regresi Linear", description: "Analisis hubungan linear antar variabel" },
  { id: "regresi-logistik", name: "Regresi Logistik", description: "Analisis untuk variabel dependen kategorikal" },
  { id: "uji-t", name: "Uji T", description: "Perbandingan rata-rata dua kelompok" },
  { id: "anova", name: "ANOVA", description: "Perbandingan rata-rata lebih dari dua kelompok" },
  { id: "korelasi", name: "Korelasi", description: "Analisis hubungan antar variabel" },
  { id: "chi-square", name: "Chi-Square", description: "Uji independensi data kategorikal" },
  { id: "sem", name: "SEM", description: "Structural Equation Modeling" },
  { id: "path-analysis", name: "Path Analysis", description: "Analisis jalur hubungan kausal" },
  { id: "faktor-analysis", name: "Factor Analysis", description: "Reduksi dimensi dan identifikasi faktor" },
  { id: "cluster-analysis", name: "Cluster Analysis", description: "Pengelompokan data berdasarkan kesamaan" },
  { id: "time-series", name: "Time Series", description: "Analisis data berdasarkan waktu" },
  { id: "deskriptif", name: "Statistik Deskriptif", description: "Ringkasan dan visualisasi data" },
]

export const pricingPackages: PricingPackage[] = [
  {
    id: "basic",
    name: "Basic",
    price: 250000,
    priceFormatted: "Rp 250.000",
    description: "Untuk kebutuhan analisis sederhana",
    features: ["Olah Data", "Interpretasi Hasil", "Gratis Konsultasi"],
  },
  {
    id: "standard",
    name: "Standard",
    price: 500000,
    priceFormatted: "Rp 500.000",
    description: "Untuk analisis yang lebih lengkap",
    features: ["Olah Data", "Interpretasi Hasil", "Gratis Konsultasi", "Gratis Revisi", "Analisis Deskriptif"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 700000,
    priceFormatted: "Rp 700.000",
    description: "Solusi lengkap sampai lulus",
    features: [
      "Olah Data",
      "Interpretasi Hasil",
      "Gratis Konsultasi",
      "Gratis Revisi",
      "Analisis Deskriptif",
      "Bimbingan Sampai Lulus",
      "Interpretasi Bab 4 & 5",
    ],
  },
]

export function OrderProvider({ children }: { children: ReactNode }) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisMethod | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<PricingPackage | null>(null)
  const [researchTitle, setResearchTitle] = useState("")
  const [description, setDescription] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [orders, setOrders] = useState<Order[]>([])

  const clearOrder = () => {
    setSelectedAnalysis(null)
    setSelectedPackage(null)
    setResearchTitle("")
    setDescription("")
    setDeliveryDate("")
  }

  const loadOrders = () => {
    // This function is kept for backwards compatibility but doesn't do anything
    // Orders are now loaded directly from Supabase in components
  }

  const createPendingPayment = async (
    userId: string,
    userName: string,
    userEmail: string
  ): Promise<string> => {
    if (!selectedAnalysis || !selectedPackage) {
      throw new Error('Missing analysis or package')
    }

    try {
      // Get analysis_price_id from Supabase
      const { data: analysisPrice } = await supabase
        .from('analysis_prices')
        .select('id')
        .eq('name', selectedAnalysis.name)
        .eq('package', selectedPackage.name)
        .single()

      // Create order in Supabase
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          analysis_price_id: analysisPrice?.id,
          research_title: researchTitle,
          research_description: description,
          deadline_date: deliveryDate,
          price: selectedPackage.price,
          payment_status: 'Belum Dibayar',
          work_status: 'Menunggu',
        })
        .select()
        .single()

      if (error) throw error

      return order.id
    } catch (error) {
      console.error('Create pending payment error:', error)
      throw error
    }
  }

  const restoreOrderFromWorkHistory = (workHistoryItem: any) => {
    // This is used to restore order details when user wants to pay for pending order
    if (workHistoryItem.orderDetails) {
      setSelectedAnalysis(workHistoryItem.orderDetails.analysisMethod)
      setSelectedPackage(workHistoryItem.orderDetails.package)
      setResearchTitle(workHistoryItem.orderDetails.researchTitle)
      setDescription(workHistoryItem.orderDetails.description)
      setDeliveryDate(workHistoryItem.orderDetails.deliveryDate || "")
    }
  }

  const confirmPayment = async (userId: string, orderId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'Dibayar',
          paid_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Confirm payment error:', error)
      throw error
    }
  }

  const submitOrder = async (userId: string): Promise<Order> => {
    if (!selectedAnalysis || !selectedPackage) {
      throw new Error('Missing analysis or package')
    }

    try {
      // Get analysis_price_id
      const { data: analysisPrice } = await supabase
        .from('analysis_prices')
        .select('id')
        .eq('name', selectedAnalysis.name)
        .eq('package', selectedPackage.name)
        .single()

      // Create order
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          analysis_price_id: analysisPrice?.id,
          research_title: researchTitle,
          research_description: description,
          deadline_date: deliveryDate,
          price: selectedPackage.price,
          payment_status: 'Dibayar',
          work_status: 'Menunggu',
        })
        .select()
        .single()

      if (error) throw error

      const newOrder: Order = {
        id: order.id,
        userId: order.user_id,
        analysisMethod: selectedAnalysis,
        package: selectedPackage,
        researchTitle: order.research_title,
        description: order.research_description,
        status: "processing",
        createdAt: order.created_at,
        totalPrice: order.price,
      }

      clearOrder()
      return newOrder
    } catch (error) {
      console.error('Submit order error:', error)
      throw error
    }
  }

  return (
    <OrderContext.Provider
      value={{
        selectedAnalysis,
        selectedPackage,
        researchTitle,
        description,
        deliveryDate,
        setSelectedAnalysis,
        setSelectedPackage,
        setResearchTitle,
        setDescription,
        setDeliveryDate,
        clearOrder,
        submitOrder,
        createPendingPayment,
        restoreOrderFromWorkHistory,
        confirmPayment,
        orders,
        loadOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider")
  }
  return context
}
