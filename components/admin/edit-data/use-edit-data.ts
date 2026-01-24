import { useState, useEffect } from "react"
import {
  validateOrder,
  validatePengeluaran,
  validateHargaAnalisis,
  validateAnalis,
} from "@/lib/validation/admin-schemas"
import { supabase } from "@/lib/supabase/client"

export type DataTable = "order" | "pengeluaran" | "harga-analisis" | "analis"

export function useEditData() {
  // Data state
  const [orders, setOrders] = useState<any[]>([])
  const [pengeluaran, setPengeluaran] = useState<any[]>([])
  const [hargaAnalisis, setHargaAnalisis] = useState<any[]>([])
  const [analis, setAnalis] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // UI state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deletingItem, setDeletingItem] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<any>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isAddMode, setIsAddMode] = useState(false)

  // Load all data from Supabase
  const loadAllData = async () => {
    setIsLoading(true)
    try {
      // Load orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          user:users(email, whatsapp, phone),
          analysis_price:analysis_prices(name, package, price),
          analyst:analysts(name, whatsapp)
        `)
        .eq('is_record_deleted', false)
        .order('order_number', { ascending: false })

      // Transform orders for display
      const transformedOrders = ordersData?.map(o => ({
        id: o.id,
        no: o.order_number,
        date: o.order_date,
        deadline: o.deadline_date,
        customer: o.user?.email || 'Unknown',
        analysis: o.analysis_price?.name || 'Unknown',
        package: o.analysis_price?.package || 'Unknown',
        price: o.price,
        analyst: o.analyst?.name || '-',
        analystFee: o.analyst_fee || 0,
        workStatus: o.work_status,
        paymentStatus: o.payment_status,
      })) || []
      setOrders(transformedOrders)

      // Load expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })

      const transformedExpenses = expensesData?.map(e => ({
        id: e.id,
        date: e.date,
        type: e.type,
        name: e.name,
        notes: e.notes || '',
        amount: e.amount,
      })) || []
      setPengeluaran(transformedExpenses)

      // Load analysis prices
      const { data: pricesData } = await supabase
        .from('analysis_prices')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      const transformedPrices = pricesData?.map(p => ({
        id: p.id,
        name: p.name,
        package: p.package,
        price: p.price,
      })) || []
      setHargaAnalisis(transformedPrices)

      // Load analysts
      const { data: analystsData } = await supabase
        .from('analysts')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      const transformedAnalysts = analystsData?.map(a => ({
        id: a.id,
        name: a.name,
        whatsapp: a.whatsapp,
        bankName: a.bank_name,
        bankAccountNumber: a.bank_account_number,
      })) || []
      setAnalis(transformedAnalysts)

      // Load users for referral dropdown
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email, whatsapp, referral_code')
        .order('email', { ascending: true })

      const transformedUsers = usersData?.map(u => ({
        id: u.id,
        email: u.email,
        whatsapp: u.whatsapp,
        referralCode: u.referral_code,
      })) || []
      setUsers(transformedUsers)

    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()

    // Set up real-time subscriptions
    const ordersChannel = supabase
      .channel('admin-orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
      }, () => {
        loadAllData()
      })
      .subscribe()

    const expensesChannel = supabase
      .channel('admin-expenses')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'expenses',
      }, () => {
        loadAllData()
      })
      .subscribe()

    const pricesChannel = supabase
      .channel('admin-prices')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'analysis_prices',
      }, () => {
        loadAllData()
      })
      .subscribe()

    const analystsChannel = supabase
      .channel('admin-analysts')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'analysts',
      }, () => {
        loadAllData()
      })
      .subscribe()

    return () => {
      ordersChannel.unsubscribe()
      expensesChannel.unsubscribe()
      pricesChannel.unsubscribe()
      analystsChannel.unsubscribe()
    }
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getEmptyFormData = (table: DataTable) => {
    switch (table) {
      case "order":
        const maxNo = orders.length > 0 ? Math.max(...orders.map(o => o.no)) : 0
        return {
          id: "",
          no: maxNo + 1,
          date: "",
          deadline: "",
          customer: "",
          analysis: "",
          package: "",
          price: 0,
          analyst: "",
          analystFee: 0,
          workStatus: "Menunggu",
          paymentStatus: "Belum Dibayar"
        }
      case "pengeluaran":
        return {
          id: "",
          date: "",
          type: "",
          name: "",
          notes: "",
          amount: 0
        }
      case "harga-analisis":
        return {
          id: "",
          name: "",
          package: "",
          price: 0
        }
      case "analis":
        return {
          id: "",
          name: "",
          whatsapp: "",
          bankName: "",
          bankAccountNumber: ""
        }
    }
  }

  const handleAdd = (table: DataTable) => {
    setIsAddMode(true)
    setEditingItem({ table })
    setValidationErrors({})
    setEditFormData(getEmptyFormData(table))
    setIsEditDialogOpen(true)
  }

  const handleEdit = (item: any, table: DataTable) => {
    setIsAddMode(false)
    setEditingItem({ ...item, table })
    setEditFormData(item)
    setValidationErrors({})
    setIsEditDialogOpen(true)
  }

  const validateForm = (data: any, table: DataTable): boolean => {
    setValidationErrors({})
    
    let result
    switch (table) {
      case "order":
        result = validateOrder(data)
        break
      case "pengeluaran":
        result = validatePengeluaran(data)
        break
      case "harga-analisis":
        result = validateHargaAnalisis(data)
        break
      case "analis":
        result = validateAnalis(data)
        break
      default:
        return true
    }
    
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message
        }
      })
      setValidationErrors(errors)
      return false
    }
    
    return true
  }

  const handleSaveEdit = async () => {
    if (!editingItem) return
    
    if (!validateForm(editFormData, editingItem.table)) {
      return
    }
    
    try {
      if (isAddMode) {
        // Add new record
        switch (editingItem.table) {
          case "order":
            // Note: This is simplified - in real implementation, you'd need to handle
            // user_id and analysis_price_id properly
            await supabase.from('orders').insert({
              order_number: editFormData.no,
              user_id: 'temp-user-id', // Would need proper user lookup
              research_title: editFormData.analysis,
              research_description: '',
              order_date: editFormData.date,
              deadline_date: editFormData.deadline,
              price: editFormData.price,
              analyst_fee: editFormData.analystFee,
              payment_status: editFormData.paymentStatus,
              work_status: editFormData.workStatus,
            })
            break
          case "pengeluaran":
            await supabase.from('expenses').insert({
              date: editFormData.date,
              type: editFormData.type,
              name: editFormData.name,
              notes: editFormData.notes,
              amount: editFormData.amount,
            })
            break
          case "harga-analisis":
            await supabase.from('analysis_prices').insert({
              name: editFormData.name,
              package: editFormData.package,
              price: editFormData.price,
              is_active: true,
            })
            break
          case "analis":
            await supabase.from('analysts').insert({
              name: editFormData.name,
              whatsapp: editFormData.whatsapp,
              bank_name: editFormData.bankName,
              bank_account_number: editFormData.bankAccountNumber,
              is_active: true,
            })
            break
        }
        
        alert("Data berhasil ditambahkan!")
      } else {
        // Update existing record
        switch (editingItem.table) {
          case "order":
            // Auto-update workStatus if: paid + analyst assigned + currently "Menunggu"
            let finalFormData = { ...editFormData }
            const hasAnalyst = finalFormData.analyst && finalFormData.analyst !== "-" && finalFormData.analyst.trim() !== ""
            if (finalFormData.paymentStatus === "Dibayar" && hasAnalyst && finalFormData.workStatus === "Menunggu") {
              finalFormData.workStatus = "Diproses"
            }
            
            // Find analyst_id from analyst name
            const analyst = analis.find(a => a.name === finalFormData.analyst)
            
            await supabase
              .from('orders')
              .update({
                analyst_id: analyst?.id || null,
                analyst_fee: finalFormData.analystFee,
                work_status: finalFormData.workStatus,
                payment_status: finalFormData.paymentStatus,
              })
              .eq('id', finalFormData.id)
            break
          case "pengeluaran":
            await supabase
              .from('expenses')
              .update({
                date: editFormData.date,
                type: editFormData.type,
                name: editFormData.name,
                notes: editFormData.notes,
                amount: editFormData.amount,
              })
              .eq('id', editFormData.id)
            break
          case "harga-analisis":
            await supabase
              .from('analysis_prices')
              .update({
                name: editFormData.name,
                package: editFormData.package,
                price: editFormData.price,
              })
              .eq('id', editFormData.id)
            break
          case "analis":
            await supabase
              .from('analysts')
              .update({
                name: editFormData.name,
                whatsapp: editFormData.whatsapp,
                bank_name: editFormData.bankName,
                bank_account_number: editFormData.bankAccountNumber,
              })
              .eq('id', editFormData.id)
            break
        }
        
        alert("Data berhasil diupdate!")
      }
      
      // Reload data
      await loadAllData()
      
      setIsEditDialogOpen(false)
      setEditingItem(null)
      setEditFormData({})
      setValidationErrors({})
      setIsAddMode(false)
    } catch (error) {
      console.error('Save error:', error)
      alert("Terjadi kesalahan saat menyimpan data.")
    }
  }

  const handleDelete = (item: any, table: DataTable) => {
    setDeletingItem({ ...item, table })
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    
    try {
      switch (deletingItem.table) {
        case "order":
          await supabase
            .from('orders')
            .update({ is_record_deleted: true })
            .eq('id', deletingItem.id)
          break
        case "pengeluaran":
          await supabase
            .from('expenses')
            .delete()
            .eq('id', deletingItem.id)
          break
        case "harga-analisis":
          await supabase
            .from('analysis_prices')
            .update({ is_active: false })
            .eq('id', deletingItem.id)
          break
        case "analis":
          await supabase
            .from('analysts')
            .update({ is_active: false })
            .eq('id', deletingItem.id)
          break
      }
      
      alert("Data berhasil dihapus!")
      await loadAllData()
      
      setIsDeleteDialogOpen(false)
      setDeletingItem(null)
    } catch (error) {
      console.error('Delete error:', error)
      alert("Terjadi kesalahan saat menghapus data.")
    }
  }

  return {
    // Data
    orders,
    pengeluaran,
    hargaAnalisis,
    analis,
    users,
    isLoading,
    // UI State
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editingItem,
    deletingItem,
    editFormData,
    setEditFormData,
    validationErrors,
    isAddMode,
    // Actions
    handleAdd,
    handleEdit,
    handleSaveEdit,
    handleDelete,
    handleConfirmDelete,
    formatCurrency,
  }
}
