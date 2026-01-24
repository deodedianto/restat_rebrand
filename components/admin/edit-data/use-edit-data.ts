import { useState, useEffect } from "react"
import {
  validateOrder,
  validatePengeluaran,
  validateHargaAnalisis,
  validateAnalis,
} from "@/lib/validation/admin-schemas"
import { getAllAdminOrders, saveAllAdminOrders, updateOrderAnalyst, type AdminOrder } from "@/lib/utils/order-sync"

export type DataTable = "order" | "pengeluaran" | "harga-analisis" | "analis"

// Initial sample data
// Default sort: 1) Unassigned analyst, 2) Paid orders, 3) Oldest first
const initialOrders = [
  // Priority 1: Unassigned + Paid (oldest first) - NEEDS ASSIGNMENT
  { id: "ORD-001", no: 5, date: "2026-01-10", deadline: "2026-01-20", customer: "Alice Wong", analysis: "Regresi Logistik", package: "Premium", price: 700000, analyst: "-", analystFee: 0, workStatus: "Menunggu", paymentStatus: "Dibayar" },
  { id: "ORD-002", no: 4, date: "2026-01-12", deadline: "2026-01-22", customer: "Bob Chen", analysis: "SEM", package: "Standard", price: 500000, analyst: "-", analystFee: 0, workStatus: "Menunggu", paymentStatus: "Dibayar" },
  
  // Priority 2: Unassigned + Unpaid (oldest first)
  { id: "ORD-003", no: 3, date: "2026-01-11", deadline: "2026-01-21", customer: "Charlie Lee", analysis: "ANOVA", package: "Basic", price: 250000, analyst: "-", analystFee: 0, workStatus: "Menunggu", paymentStatus: "Belum Dibayar" },
  
  // Priority 3: Assigned + Paid (oldest first) - ALREADY ASSIGNED
  { id: "ORD-004", no: 2, date: "2026-01-08", deadline: "2026-01-18", customer: "Diana Putra", analysis: "Regresi Linear", package: "Premium", price: 700000, analyst: "Lukman", analystFee: 350000, workStatus: "Diproses", paymentStatus: "Dibayar" },
  { id: "ORD-005", no: 1, date: "2026-01-09", deadline: "2026-01-19", customer: "Eko Santoso", analysis: "Uji T", package: "Standard", price: 500000, analyst: "Lani", analystFee: 250000, workStatus: "Selesai", paymentStatus: "Dibayar" },
]

const initialPengeluaran = [
  { id: "EXP-001", date: "2026-01-10", type: "Fee Analis", name: "Lukman", notes: "Fee analisis bulan Januari", amount: 500000 },
  { id: "EXP-002", date: "2026-01-05", type: "Fee Referal", name: "john@example.com", notes: "Komisi referral program", amount: 150000 },
  { id: "EXP-003", date: "2026-01-08", type: "Biaya Iklan", name: "Google Ads", notes: "Kampanye iklan minggu pertama", amount: 1000000 },
  { id: "EXP-004", date: "2026-01-12", type: "Web Development", name: "PT Digital Solution", notes: "Maintenance website", amount: 2000000 },
]

const initialHargaAnalisis = [
  { id: "1", name: "Regresi Linear", package: "Basic", price: 250000 },
  { id: "2", name: "Regresi Linear", package: "Standard", price: 500000 },
  { id: "3", name: "Regresi Linear", package: "Premium", price: 700000 },
]

const initialAnalis = [
  { id: "1", name: "Lukman", whatsapp: "+62812345678", bankName: "BCA", bankAccountNumber: "1234567890" },
  { id: "2", name: "Lani", whatsapp: "+62823456789", bankName: "Mandiri", bankAccountNumber: "0987654321" },
  { id: "3", name: "Hamka", whatsapp: "+62834567890", bankName: "BNI", bankAccountNumber: "1122334455" },
]

// Sample users for Fee Referal dropdown
const initialUsers = [
  { id: "user-1", name: "John Doe", email: "john@example.com", referralCode: "REF001" },
  { id: "user-2", name: "Jane Smith", email: "jane@example.com", referralCode: "REF002" },
  { id: "user-3", name: "Bob Wilson", email: "bob@example.com", referralCode: "REF003" },
]

export function useEditData() {
  // Load orders from shared storage
  const loadOrders = () => {
    const adminOrders = getAllAdminOrders()
    // If no orders exist, use initial sample data
    return adminOrders.length > 0 ? adminOrders : initialOrders
  }

  // Data state
  const [orders, setOrders] = useState(loadOrders())
  const [pengeluaran, setPengeluaran] = useState(initialPengeluaran)
  const [hargaAnalisis, setHargaAnalisis] = useState(initialHargaAnalisis)
  const [analis, setAnalis] = useState(initialAnalis)
  const [users] = useState(initialUsers)

  // Auto-reload orders when component mounts or window gains focus
  useEffect(() => {
    const handleFocus = () => {
      setOrders(loadOrders())
    }

    window.addEventListener('focus', handleFocus)
    
    // Initial load
    setOrders(loadOrders())

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // UI state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deletingItem, setDeletingItem] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<any>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isAddMode, setIsAddMode] = useState(false)

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
        // Calculate next "no" - find max no and add 1 (higher numbers = more recent)
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

  const handleSaveEdit = () => {
    if (!editingItem) return
    
    if (!validateForm(editFormData, editingItem.table)) {
      return
    }
    
    if (isAddMode) {
      let newItem = { ...editFormData }
      
      switch (editingItem.table) {
        case "order":
          newItem.id = `ORD-${String(orders.length + 1).padStart(3, '0')}`
          const newOrders = [...orders, newItem]
          setOrders(newOrders)
          // Save to shared storage
          saveAllAdminOrders(newOrders)
          break
        case "pengeluaran":
          newItem.id = `EXP-${String(pengeluaran.length + 1).padStart(3, '0')}`
          setPengeluaran([...pengeluaran, newItem])
          break
        case "harga-analisis":
          newItem.id = String(hargaAnalisis.length + 1)
          setHargaAnalisis([...hargaAnalisis, newItem])
          break
        case "analis":
          newItem.id = String(analis.length + 1)
          setAnalis([...analis, newItem])
          break
      }
      
      alert("Data berhasil ditambahkan!")
    } else {
      switch (editingItem.table) {
        case "order":
          // Check if analyst was changed
          const oldOrder = orders.find(item => item.id === editFormData.id)
          const analystChanged = oldOrder && oldOrder.analyst !== editFormData.analyst
          
          // Auto-update workStatus if: paid + analyst assigned + currently "Menunggu"
          let finalFormData = { ...editFormData }
          if (analystChanged) {
            const hasAnalyst = editFormData.analyst && editFormData.analyst !== "-" && editFormData.analyst.trim() !== ""
            if (editFormData.paymentStatus === "Dibayar" && hasAnalyst && editFormData.workStatus === "Menunggu") {
              finalFormData.workStatus = "Diproses"
            }
          }
          
          const updatedOrders = orders.map(item => item.id === finalFormData.id ? finalFormData : item)
          setOrders(updatedOrders)
          // Save to shared storage
          saveAllAdminOrders(updatedOrders)
          break
        case "pengeluaran":
          setPengeluaran(pengeluaran.map(item => item.id === editFormData.id ? editFormData : item))
          break
        case "harga-analisis":
          setHargaAnalisis(hargaAnalisis.map(item => item.id === editFormData.id ? editFormData : item))
          break
        case "analis":
          setAnalis(analis.map(item => item.id === editFormData.id ? editFormData : item))
          break
      }
      
      alert("Data berhasil diupdate!")
    }
    
    setIsEditDialogOpen(false)
    setEditingItem(null)
    setEditFormData({})
    setValidationErrors({})
    setIsAddMode(false)
  }

  const handleDelete = (item: any, table: DataTable) => {
    setDeletingItem({ ...item, table })
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deletingItem) return
    
    switch (deletingItem.table) {
      case "order":
        const filteredOrders = orders.filter(item => item.id !== deletingItem.id)
        setOrders(filteredOrders)
        // Save to shared storage
        saveAllAdminOrders(filteredOrders)
        break
      case "pengeluaran":
        setPengeluaran(pengeluaran.filter(item => item.id !== deletingItem.id))
        break
      case "harga-analisis":
        setHargaAnalisis(hargaAnalisis.filter(item => item.id !== deletingItem.id))
        break
      case "analis":
        setAnalis(analis.filter(item => item.id !== deletingItem.id))
        break
    }
    
    alert("Data berhasil dihapus!")
    setIsDeleteDialogOpen(false)
    setDeletingItem(null)
  }

  return {
    // Data
    orders,
    pengeluaran,
    hargaAnalisis,
    analis,
    users,
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
