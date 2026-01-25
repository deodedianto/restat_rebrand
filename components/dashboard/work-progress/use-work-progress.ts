import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrder } from '@/lib/order-context'
import { supabase } from '@/lib/supabase/client'

export interface WorkHistoryItem {
  id: string
  type: string
  date: string
  time?: string
  status: "Selesai" | "Sedang Dikerjakan" | "Dijadwalkan" | "Belum Dibayar" | "Dibayar" | "Menunggu" | "Diproses"
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

export function useWorkProgress(userId?: string) {
  const router = useRouter()
  const { restoreOrderFromWorkHistory } = useOrder()
  const [isOpen, setIsOpen] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteValue, setEditingNoteValue] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<WorkHistoryItem | null>(null)
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadWorkHistory = async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      console.log('🔍 [WorkProgress] Loading data for userId:', userId)
      
      // Get orders (now using metode_analisis and jenis_paket columns)
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .eq('is_record_deleted', false)
        .order('created_at', { ascending: false })

      console.log('📦 [WorkProgress] Orders from Supabase:', orders)
      console.log('❌ [WorkProgress] Orders error:', ordersError)

      // Get consultations
      const { data: consultations, error: consultationsError } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_record_deleted', false)
        .order('scheduled_date', { ascending: false })

      console.log('📅 [WorkProgress] Consultations from Supabase:', consultations)
      console.log('❌ [WorkProgress] Consultations error:', consultationsError)

      // Transform orders to work history format
      const orderHistory: WorkHistoryItem[] = orders?.map((o: any) => ({
        id: o.id,
        type: 'Order',
        date: new Date(o.order_date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        status: o.payment_status === 'Belum Dibayar' ? 'Belum Dibayar' : 
                o.work_status === 'Diproses' ? 'Sedang Dikerjakan' :
                o.work_status === 'Selesai' ? 'Selesai' : 'Dibayar',
        note: `Judul: ${o.research_title}\nDeskripsi: ${o.research_description}\nPengiriman Hasil: ${new Date(o.deadline_date).toLocaleDateString('id-ID')}`,
        orderId: o.id,
        orderDetails: {
          analysisMethod: { 
            id: o.metode_analisis?.toLowerCase().replace(/\s+/g, '-') || '',
            name: o.metode_analisis || '', 
            description: '' 
          },
          package: { 
            id: o.jenis_paket?.toLowerCase() || '',
            name: o.jenis_paket || '', 
            price: o.price,
            priceFormatted: `Rp ${o.price.toLocaleString('id-ID')}`,
            description: '',
            features: []
          },
          researchTitle: o.research_title,
          description: o.research_description,
          deliveryDate: o.deadline_date,
          totalPrice: o.price,
        },
      })) || []

      // Transform consultations to work history format
      const consultationHistory: WorkHistoryItem[] = consultations?.map(c => ({
        id: c.id,
        type: 'Konsultasi',
        date: new Date(c.scheduled_date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        time: c.scheduled_time,
        status: c.status === 'Dijadwalkan' ? 'Dijadwalkan' : 'Selesai',
        note: c.notes || '',
      })) || []

      // Combine and sort by date
      const combined = [...orderHistory, ...consultationHistory]
        .sort((a, b) => {
          const dateA = new Date(a.date.split(' ').reverse().join('-'))
          const dateB = new Date(b.date.split(' ').reverse().join('-'))
          return dateB.getTime() - dateA.getTime()
        })

      console.log('✅ [WorkProgress] Final combined work history:', combined)
      console.log('📊 [WorkProgress] Total items:', combined.length, '(Orders:', orderHistory.length, ', Consultations:', consultationHistory.length, ')')
      
      setWorkHistory(combined)
    } catch (error) {
      console.error('Load work history error:', error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const updatePastConsultations = async () => {
    if (!userId) return

    const pastConsultations = workHistory.filter(item => 
      item.type === "Konsultasi" && 
      item.status === "Dijadwalkan" && 
      isConsultationPast(item.date, item.time)
    )

    if (pastConsultations.length > 0) {
      for (const consultation of pastConsultations) {
        await supabase
          .from('consultations')
          .update({ status: 'Selesai' })
          .eq('id', consultation.id)
          .eq('user_id', userId)
      }
      
      // Reload history after updates
      loadWorkHistory()
    }
  }

  useEffect(() => {
    loadWorkHistory()

    // Real-time subscription for orders
    const ordersChannel = supabase
      .channel('user-orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`,
      }, () => {
        loadWorkHistory()
      })
      .subscribe()
    
    // Real-time subscription for consultations
    const consultationsChannel = supabase
      .channel('user-consultations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'consultations',
        filter: `user_id=eq.${userId}`,
      }, () => {
        loadWorkHistory()
      })
      .subscribe()

    // Handle window focus and hash changes
    const handleFocus = () => {
      loadWorkHistory()
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
      loadWorkHistory()
      updatePastConsultations()
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('hashchange', handleHashChange)

    // Check initial hash
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
      ordersChannel.unsubscribe()
      consultationsChannel.unsubscribe()
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [userId])

  const handleEditNote = (id: string, currentNote: string) => {
    setEditingNoteId(id)
    setEditingNoteValue(currentNote)
  }

  const handleSaveNote = async (id: string) => {
    // Note: In current implementation, notes are shown but not editable
    // This functionality can be added later if needed
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

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !userId) return

    try {
      if (itemToDelete.type === 'Order') {
        const { error } = await supabase
          .from('orders')
          .update({ is_record_deleted: true })
          .eq('id', itemToDelete.id)

        if (error) {
          console.error('Delete error:', error)
          alert(`Gagal menghapus: ${error.message}`)
          return
        }
      } else if (itemToDelete.type === 'Konsultasi') {
        const { error } = await supabase
          .from('consultations')
          .update({ is_record_deleted: true })
          .eq('id', itemToDelete.id)

        if (error) {
          console.error('Delete error:', error)
          alert(`Gagal menghapus: ${error.message}`)
          return
        }
      }

      await loadWorkHistory()
    } catch (error) {
      console.error('Unexpected delete error:', error)
      alert(`Terjadi kesalahan: ${error}`)
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
    isLoading,
  }
}
