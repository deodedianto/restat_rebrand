"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { BarChart3, ChevronDown, ChevronUp, Pencil, X, Check, CreditCard, Trash2 } from "lucide-react"
import { useOrder } from "@/lib/order-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export interface WorkHistoryItem {
  id: number
  type: string
  date: string
  time?: string
  status: "Selesai" | "Sedang Dikerjakan" | "Dijadwalkan" | "Belum Dibayar" | "Dibayar"
  note: string
  orderId?: string
  // Order details for unpaid payments
  orderDetails?: {
    analysisMethod: {
      id: string
      name: string
      description: string
    }
    package: {
      id: string
      name: string
      price: number
      priceFormatted: string
      description: string
      features: string[]
    }
    researchTitle: string
    description: string
    deliveryDate?: string
    totalPrice: number
  }
}

interface WorkProgressProps {
  initialWorkHistory?: WorkHistoryItem[]
  onUpdateNote?: (id: number, note: string) => void
  onWorkHistoryChange?: (workHistory: WorkHistoryItem[]) => void
  userId?: string
}

const defaultWorkHistory: WorkHistoryItem[] = [
  { id: 1, type: "Konsultasi", date: "10 Januari 2025", time: "20:30", status: "Selesai", note: "" },
  { id: 2, type: "Pembayaran", date: "14 Januari 2025", time: "", status: "Selesai", note: "" },
  { id: 3, type: "Pengerjaan", date: "15 Januari 2025", time: "", status: "Sedang Dikerjakan", note: "" },
  { id: 4, type: "Pengerjaan", date: "18 Januari 2025", time: "", status: "Sedang Dikerjakan", note: "" },
  { id: 5, type: "Konsultasi", date: "16 Januari 2025", time: "", status: "Dijadwalkan", note: "" },
]

export function WorkProgress({ initialWorkHistory, onUpdateNote, onWorkHistoryChange, userId }: WorkProgressProps) {
  const router = useRouter()
  const { restoreOrderFromWorkHistory } = useOrder()
  const [isOpen, setIsOpen] = useState(false)
  
  // Load work history from localStorage if userId is provided
  const loadWorkHistory = () => {
    if (userId) {
      const workHistoryKey = `work_history_${userId}`
      const stored = localStorage.getItem(workHistoryKey)
      return stored ? JSON.parse(stored) : defaultWorkHistory
    }
    return initialWorkHistory || defaultWorkHistory
  }
  
  const [workHistory, setWorkHistory] = useState(() => {
    const loaded = loadWorkHistory()
    // Update past consultations on initial load
    return loaded
  })
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [editingNoteValue, setEditingNoteValue] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<WorkHistoryItem | null>(null)

  // Utility function to check if a consultation date/time has passed
  const isConsultationPast = (dateStr: string, timeStr?: string): boolean => {
    try {
      // Parse Indonesian date format: "25 Januari 2026"
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
      
      const consultDate = new Date(year, month, day)
      
      // If time is provided, set it
      if (timeStr) {
        const timeParts = timeStr.split(':')
        if (timeParts.length === 2) {
          consultDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0)
        }
      } else {
        // If no time, set to end of day
        consultDate.setHours(23, 59, 59, 999)
      }
      
      return consultDate < new Date()
    } catch (error) {
      console.error('Error parsing date:', error)
      return false
    }
  }

  // Automatically update statuses for past consultations
  const updatePastConsultations = (history: WorkHistoryItem[]): WorkHistoryItem[] => {
    let hasChanges = false
    const updated = history.map(item => {
      if (item.type === "Konsultasi" && item.status === "Dijadwalkan") {
        if (isConsultationPast(item.date, item.time)) {
          hasChanges = true
          return { ...item, status: "Selesai" as const }
        }
      }
      return item
    })
    
    // Save to localStorage if there were changes
    if (hasChanges && userId) {
      const workHistoryKey = `work_history_${userId}`
      localStorage.setItem(workHistoryKey, JSON.stringify(updated))
    }
    
    return updated
  }

  const handleEditNote = (id: number, currentNote: string) => {
    setEditingNoteId(id)
    setEditingNoteValue(currentNote)
  }

  const handleSaveNote = (id: number) => {
    const updatedHistory = workHistory.map((item) =>
      item.id === id ? { ...item, note: editingNoteValue } : item
    )
    setWorkHistory(updatedHistory)
    if (onUpdateNote) {
      onUpdateNote(id, editingNoteValue)
    }
    if (onWorkHistoryChange) {
      onWorkHistoryChange(updatedHistory)
    }
    setEditingNoteId(null)
    setEditingNoteValue("")
  }

  const handleCancelEditNote = () => {
    setEditingNoteId(null)
    setEditingNoteValue("")
  }

  const handlePayment = (item: WorkHistoryItem) => {
    if (item.orderDetails) {
      // Restore order context
      restoreOrderFromWorkHistory(item)
      // Navigate to checkout
      router.push("/checkout")
    }
  }

  const handleDeleteClick = (item: WorkHistoryItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete && userId) {
      const updatedHistory = workHistory.filter((item) => item.id !== itemToDelete.id)
      setWorkHistory(updatedHistory)
      
      // Update localStorage
      const workHistoryKey = `work_history_${userId}`
      localStorage.setItem(workHistoryKey, JSON.stringify(updatedHistory))
      
      // Notify parent component
      if (onWorkHistoryChange) {
        onWorkHistoryChange(updatedHistory)
      }
      
      // Also remove the order from orders list if it exists
      if (itemToDelete.orderId) {
        const storedOrders = JSON.parse(localStorage.getItem("restat_orders") || "[]")
        const updatedOrders = storedOrders.filter((order: any) => order.id !== itemToDelete.orderId)
        localStorage.setItem("restat_orders", JSON.stringify(updatedOrders))
      }
    }
    
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  // Update past consultations on mount
  useEffect(() => {
    const updatedHistory = updatePastConsultations(workHistory)
    if (JSON.stringify(updatedHistory) !== JSON.stringify(workHistory)) {
      setWorkHistory(updatedHistory)
      if (onWorkHistoryChange) {
        onWorkHistoryChange(updatedHistory)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run only once on mount

  // Auto-open section when hash is present (on mount)
  useEffect(() => {
    const checkAndOpenSection = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash
        if (hash === "#proses-pengerjaan") {
          setIsOpen(true)
          // Scroll to section after a short delay to ensure DOM is ready
          setTimeout(() => {
            const element = document.getElementById("proses-pengerjaan")
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          }, 300)
        }
      }
    }
    
    // Check immediately
    checkAndOpenSection()
    
    // Also check after a small delay in case the component mounts before the URL is fully updated
    const timeoutId = setTimeout(checkAndOpenSection, 100)
    
    return () => clearTimeout(timeoutId)
  }, [])

  // Listen for hash changes (when user clicks link while already on dashboard)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#proses-pengerjaan") {
        setIsOpen(true)
        // Scroll to section after a short delay
        setTimeout(() => {
          const element = document.getElementById("proses-pengerjaan")
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        }, 100)
      }
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  // Export work history data type
  useEffect(() => {
    if (onWorkHistoryChange) {
      onWorkHistoryChange(workHistory)
    }
  }, [workHistory, onWorkHistoryChange])

  // Reload work history when window regains focus or hash changes
  useEffect(() => {
    const handleReload = () => {
      if (userId) {
        const workHistoryKey = `work_history_${userId}`
        const stored = localStorage.getItem(workHistoryKey)
        if (stored) {
          const newHistory = JSON.parse(stored)
          // Update past consultations automatically
          const updatedHistory = updatePastConsultations(newHistory)
          setWorkHistory(updatedHistory)
          if (onWorkHistoryChange) {
            onWorkHistoryChange(updatedHistory)
          }
        }
      }
    }

    // Reload when window regains focus (e.g., after closing modal)
    window.addEventListener('focus', handleReload)
    
    // Reload when hash changes (e.g., navigating to this section)
    window.addEventListener('hashchange', handleReload)
    
    return () => {
      window.removeEventListener('focus', handleReload)
      window.removeEventListener('hashchange', handleReload)
    }
  }, [userId, onWorkHistoryChange])

  return (
    <Card id="proses-pengerjaan" className="mb-3 sm:mb-6 border-0 shadow-md overflow-hidden bg-white py-2.5 px-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer bg-white hover:bg-slate-50 transition-colors py-2 px-4 sm:px-6 gap-0.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                  <BarChart3 className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base text-slate-800 leading-tight mb-0.5">Riwayat Pengerjaan</CardTitle>
                  <CardDescription className="text-xs text-slate-600 leading-tight">Daftar semua jadwal konsultasi dan pengerjaan analisis data</CardDescription>
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
          <CardContent className="pt-6">
            {/* Riwayat Pengerjaan Table */}
            <div className="mb-6 bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Riwayat Pengerjaan
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Jam
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Pengiriman Hasil
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Jenis Analisis
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Paket
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Harga
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Note
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {workHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 sm:px-6 py-3 text-sm font-medium text-foreground">{item.type}</td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-muted-foreground">{item.date}</td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-muted-foreground">{item.time || "-"}</td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-muted-foreground">
                          {item.orderDetails?.deliveryDate 
                            ? new Date(item.orderDetails.deliveryDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                              })
                            : "-"
                          }
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-muted-foreground">
                          {item.orderDetails?.analysisMethod.name || "-"}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-muted-foreground">
                          {item.orderDetails?.package.name || "-"}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm font-medium text-foreground">
                          {item.orderDetails?.package.priceFormatted || "-"}
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              item.status === "Selesai" || item.status === "Dibayar"
                                ? "bg-green-100 text-green-700"
                                : item.status === "Sedang Dikerjakan"
                                  ? "bg-orange-100 text-orange-700"
                                  : item.status === "Belum Dibayar"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          {editingNoteId === item.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingNoteValue}
                                onChange={(e) => setEditingNoteValue(e.target.value)}
                                placeholder="Tambahkan catatan..."
                                className="h-8 text-sm"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveNote(item.id)}
                                className="h-8 px-2 rounded-md"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEditNote}
                                className="h-8 px-2 rounded-md"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground flex-1 whitespace-pre-line">
                                {item.note || "-"}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditNote(item.id, item.note)}
                                className="h-8 w-8 p-0 hover:bg-slate-100"
                              >
                                <Pencil className="w-4 h-4 text-slate-600" />
                              </Button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <div className="flex items-center gap-2">
                            {item.status === "Belum Dibayar" && item.orderDetails ? (
                              <Button
                                size="sm"
                                onClick={() => handlePayment(item)}
                                className="h-8 px-3 rounded-md bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white gap-1"
                              >
                                <CreditCard className="w-3 h-3" />
                                Bayar
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                            
                            {item.status !== "Dibayar" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteClick(item)}
                                className="h-8 w-8 p-0 hover:bg-red-100 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Riwayat?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus riwayat ini? Tindakan ini tidak dapat dibatalkan.
              {itemToDelete && itemToDelete.orderDetails && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-foreground">{itemToDelete.orderDetails.researchTitle}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {itemToDelete.orderDetails.analysisMethod.name} - {itemToDelete.orderDetails.package.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {itemToDelete.orderDetails.package.priceFormatted}
                  </p>
                </div>
              )}
              {itemToDelete && !itemToDelete.orderDetails && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-foreground">{itemToDelete.type}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {itemToDelete.date} {itemToDelete.time && `- ${itemToDelete.time}`}
                  </p>
                  {itemToDelete.note && (
                    <p className="text-xs text-muted-foreground">{itemToDelete.note}</p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
