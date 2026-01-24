import { useState } from "react"
import {
  validateOrder,
  validatePengeluaran,
  validateHargaAnalisis,
  validateAnalis,
} from "@/lib/validation/admin-schemas"

export type DataTable = "order" | "pengeluaran" | "harga-analisis" | "analis"

// Initial sample data
const initialOrders = [
  { id: "ORD-001", no: 1, date: "2026-01-15", deadline: "2026-01-25", customer: "John Doe", analysis: "Regresi Linear", package: "Premium", price: 700000, analyst: "Lukman", analystFee: 350000, status: "Selesai" },
  { id: "ORD-002", no: 2, date: "2026-01-14", deadline: "2026-01-22", customer: "Jane Smith", analysis: "ANOVA", package: "Standard", price: 500000, analyst: "Lani", analystFee: 250000, status: "Progress" },
  { id: "ORD-003", no: 3, date: "2026-01-13", deadline: "2026-01-20", customer: "Bob Wilson", analysis: "Uji T", package: "Basic", price: 250000, analyst: "Hamka", analystFee: 125000, status: "Menunggu" },
]

const initialPengeluaran = [
  { id: "EXP-001", date: "2026-01-10", type: "Operasional - Server Hosting", amount: 500000 },
  { id: "EXP-002", date: "2026-01-05", type: "Gaji Analis", amount: 5000000 },
  { id: "EXP-003", date: "2026-01-08", type: "Marketing - Iklan Google Ads", amount: 1000000 },
]

const initialHargaAnalisis = [
  { id: "1", name: "Regresi Linear", package: "Basic", price: 250000 },
  { id: "2", name: "Regresi Linear", package: "Standard", price: 500000 },
  { id: "3", name: "Regresi Linear", package: "Premium", price: 700000 },
]

const initialAnalis = [
  { id: "1", name: "Lukman", whatsapp: "+62812345678", bankName: "BCA", bankAccountNumber: "1234567890" },
  { id: "2", name: "Lani", whatsapp: "+62823456789", bankName: "Mandiri", bankAccountNumber: "0987654321" },
]

export function useEditData() {
  // Data state
  const [orders, setOrders] = useState(initialOrders)
  const [pengeluaran, setPengeluaran] = useState(initialPengeluaran)
  const [hargaAnalisis, setHargaAnalisis] = useState(initialHargaAnalisis)
  const [analis, setAnalis] = useState(initialAnalis)

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
        return {
          id: "",
          no: orders.length + 1,
          date: "",
          deadline: "",
          customer: "",
          analysis: "",
          package: "",
          price: 0,
          analyst: "",
          analystFee: 0,
          status: "Menunggu"
        }
      case "pengeluaran":
        return {
          id: "",
          date: "",
          type: "",
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
          setOrders([...orders, newItem])
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
          setOrders(orders.map(item => item.id === editFormData.id ? editFormData : item))
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
        setOrders(orders.filter(item => item.id !== deletingItem.id))
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
