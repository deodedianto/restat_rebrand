"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { syncWorkHistoryToAdmin, updateOrderPaymentStatus } from "./utils/order-sync"

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
  submitOrder: (userId: string) => Order
  createPendingPayment: (userId: string, userName: string, userEmail: string) => string
  restoreOrderFromWorkHistory: (workHistoryItem: any) => void
  confirmPayment: (userId: string, orderId: string) => void
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
    const storedOrders = localStorage.getItem("restat_orders")
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders))
    }
  }

  const createPendingPayment = (userId: string, userName: string, userEmail: string): string => {
    const orderId = `ORD-${Date.now()}`
    const newOrder: Order = {
      id: orderId,
      userId,
      analysisMethod: selectedAnalysis!,
      package: selectedPackage!,
      researchTitle,
      description,
      status: "pending",
      createdAt: new Date().toISOString(),
      totalPrice: selectedPackage!.price,
    }

    // Save order
    const existingOrders = JSON.parse(localStorage.getItem("restat_orders") || "[]")
    existingOrders.push(newOrder)
    localStorage.setItem("restat_orders", JSON.stringify(existingOrders))
    setOrders(existingOrders)

    // Create work history entry for pending payment
    const workHistoryKey = `work_history_${userId}`
    const existingHistory = JSON.parse(localStorage.getItem(workHistoryKey) || "[]")
    
    const newHistoryItem = {
      id: Date.now(),
      type: "Order",
      date: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: "",
      status: "Belum Dibayar",
      note: `Judul: ${researchTitle}\nDeskripsi: ${description}`,
      orderId: orderId,
      orderDetails: {
        analysisMethod: selectedAnalysis!,
        package: selectedPackage!,
        researchTitle,
        description,
        deliveryDate,
        totalPrice: selectedPackage!.price,
      },
    }

    existingHistory.push(newHistoryItem)
    localStorage.setItem(workHistoryKey, JSON.stringify(existingHistory))

    // Sync to admin orders
    syncWorkHistoryToAdmin(newHistoryItem as any, userId, userName, userEmail)

    return orderId
  }

  const restoreOrderFromWorkHistory = (workHistoryItem: any) => {
    if (workHistoryItem.orderDetails) {
      setSelectedAnalysis(workHistoryItem.orderDetails.analysisMethod)
      setSelectedPackage(workHistoryItem.orderDetails.package)
      setResearchTitle(workHistoryItem.orderDetails.researchTitle)
      setDescription(workHistoryItem.orderDetails.description)
      setDeliveryDate(workHistoryItem.orderDetails.deliveryDate || "")
    }
  }

  const confirmPayment = (userId: string, orderId: string) => {
    // Update work history status from "Belum Dibayar" to "Dibayar"
    const workHistoryKey = `work_history_${userId}`
    const existingHistory = JSON.parse(localStorage.getItem(workHistoryKey) || "[]")
    
    const updatedHistory = existingHistory.map((item: any) => {
      if (item.orderId === orderId && item.status === "Belum Dibayar") {
        return {
          ...item,
          status: "Dibayar",
          // Keep type as "Order", don't change it
        }
      }
      return item
    })
    
    localStorage.setItem(workHistoryKey, JSON.stringify(updatedHistory))

    // Update admin order payment status
    updateOrderPaymentStatus(orderId, "Dibayar")
  }

  const submitOrder = (userId: string): Order => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId,
      analysisMethod: selectedAnalysis!,
      package: selectedPackage!,
      researchTitle,
      description,
      status: "pending",
      createdAt: new Date().toISOString(),
      totalPrice: selectedPackage!.price,
    }

    const existingOrders = JSON.parse(localStorage.getItem("restat_orders") || "[]")
    existingOrders.push(newOrder)
    localStorage.setItem("restat_orders", JSON.stringify(existingOrders))
    setOrders(existingOrders)

    clearOrder()
    return newOrder
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
