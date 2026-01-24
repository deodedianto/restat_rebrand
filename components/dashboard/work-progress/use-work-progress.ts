import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useOrder } from "@/lib/order-context"
import { deleteAdminOrder } from "@/lib/utils/order-sync"

export interface WorkHistoryItem {
  id: number
  type: string
  date: string
  time?: string
  status: "Selesai" | "Sedang Dikerjakan" | "Dijadwalkan" | "Belum Dibayar" | "Dibayar"
  note: string
  orderId?: string
  orderDetails?: {
    analysisMethod: { id: string; name: string; description: string }
    package: { id: string; name: string; price: number; priceFormatted: string; description: string; features: string[] }
    researchTitle: string
    description: string
    deliveryDate?: string
    totalPrice: number
  }
}

const defaultWorkHistory: WorkHistoryItem[] = [
  { id: 1, type: "Konsultasi", date: "10 Januari 2025", time: "20:30", status: "Selesai", note: "" },
  { id: 2, type: "Pembayaran", date: "14 Januari 2025", time: "", status: "Selesai", note: "" },
  { id: 3, type: "Pengerjaan", date: "15 Januari 2025", time: "", status: "Sedang Dikerjakan", note: "" },
  { id: 4, type: "Pengerjaan", date: "18 Januari 2025", time: "", status: "Sedang Dikerjakan", note: "" },
  { id: 5, type: "Konsultasi", date: "16 Januari 2025", time: "", status: "Dijadwalkan", note: "" },
]

export function useWorkProgress(userId?: string) {
  const router = useRouter()
  const { restoreOrderFromWorkHistory } = useOrder()
  const [isOpen, setIsOpen] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [editingNoteValue, setEditingNoteValue] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<WorkHistoryItem | null>(null)

  const loadWorkHistory = () => {
    if (userId) {
      const workHistoryKey = `work_history_${userId}`
      const stored = localStorage.getItem(workHistoryKey)
      return stored ? JSON.parse(stored) : defaultWorkHistory
    }
    return defaultWorkHistory
  }

  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>(loadWorkHistory())

  const isConsultationPast = (dateStr: string, timeStr?: string): boolean => {
    try {
      const parts = dateStr.split(' ')
      if (parts.length !== 3) return false
      
      const day = parseInt(parts[0])
      const monthStr = parts[1]
      const year = parseInt(parts[2])
      
      const monthMap: Record<string, number> = {
        'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3,
        'Mei': 4, 'Juni': 5, 'Juli': 6, 'Agustus': 7,
        'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
      }
      
      const month = monthMap[monthStr]
      if (month === undefined) return false

      const consultationDate = new Date(year, month, day)

      if (timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number)
        consultationDate.setHours(hours, minutes, 0, 0)
      } else {
        consultationDate.setHours(23, 59, 59, 999)
      }

      return consultationDate < new Date()
    } catch {
      return false
    }
  }

  const updatePastConsultations = () => {
    if (!userId) return

    const updated = workHistory.map(item => {
      if (item.type === "Konsultasi" && item.status === "Dijadwalkan") {
        if (isConsultationPast(item.date, item.time)) {
          return { ...item, status: "Selesai" as const }
        }
      }
      return item
    })

    const hasChanges = JSON.stringify(updated) !== JSON.stringify(workHistory)
    if (hasChanges) {
      setWorkHistory(updated)
      const workHistoryKey = `work_history_${userId}`
      localStorage.setItem(workHistoryKey, JSON.stringify(updated))
    }
  }

  useEffect(() => {
    updatePastConsultations()

    const handleFocus = () => {
      const reloaded = loadWorkHistory()
      setWorkHistory(reloaded)
      updatePastConsultations()
    }

    const handleHashChange = () => {
      if (window.location.hash === '#proses-pengerjaan' || window.location.hash === '#riwayat-pengerjaan') {
        setIsOpen(true)
        setTimeout(() => {
          const element = document.getElementById('riwayat-pengerjaan')
          if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 200)
      }
      const reloaded = loadWorkHistory()
      setWorkHistory(reloaded)
      updatePastConsultations()
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('hashchange', handleHashChange)

    if (window.location.hash === '#proses-pengerjaan' || window.location.hash === '#riwayat-pengerjaan') {
      setTimeout(() => {
        setIsOpen(true)
        setTimeout(() => {
          const element = document.getElementById('riwayat-pengerjaan')
          if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 300)
      }, 100)
    }

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [userId])

  const saveWorkHistory = (history: WorkHistoryItem[]) => {
    setWorkHistory(history)
    if (userId) {
      const workHistoryKey = `work_history_${userId}`
      localStorage.setItem(workHistoryKey, JSON.stringify(history))
    }
  }

  const handleEditNote = (id: number, currentNote: string) => {
    setEditingNoteId(id)
    setEditingNoteValue(currentNote)
  }

  const handleSaveNote = (id: number) => {
    const updated = workHistory.map(item =>
      item.id === id ? { ...item, note: editingNoteValue } : item
    )
    saveWorkHistory(updated)
    setEditingNoteId(null)
    setEditingNoteValue("")
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setEditingNoteValue("")
  }

  const handlePayment = (item: WorkHistoryItem) => {
    if (item.orderDetails) {
      restoreOrderFromWorkHistory(item)
      router.push('/checkout')
    }
  }

  const handleDeleteClick = (item: WorkHistoryItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!itemToDelete || !userId) return

    const updated = workHistory.filter(item => item.id !== itemToDelete.id)
    saveWorkHistory(updated)

    if (itemToDelete.orderId) {
      const ordersKey = `orders_${userId}`
      const storedOrders = localStorage.getItem(ordersKey)
      if (storedOrders) {
        const orders = JSON.parse(storedOrders)
        const updatedOrders = orders.filter((order: any) => order.id !== itemToDelete.orderId)
        localStorage.setItem(ordersKey, JSON.stringify(updatedOrders))
      }

      // Delete from admin orders if this is an Order type
      if (itemToDelete.type === "Order") {
        deleteAdminOrder(itemToDelete.orderId)
      }
    }

    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  return {
    isOpen,
    setIsOpen,
    workHistory,
    editingNoteId,
    editingNoteValue,
    setEditingNoteValue,
    deleteDialogOpen,
    setDeleteDialogOpen,
    itemToDelete,
    handleEditNote,
    handleSaveNote,
    handleCancelEdit,
    handlePayment,
    handleDeleteClick,
    handleDeleteConfirm,
    formatCurrency,
  }
}
