"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Pencil, Trash2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type DataTable = "order" | "pengeluaran" | "harga-analisis" | "analis"

// Sample data (same as before)
const sampleOrders = [
  { id: "ORD-001", no: 1, date: "2026-01-15", deadline: "2026-01-25", customer: "John Doe", analysis: "Regresi Linear", package: "Premium", price: 700000, analyst: "Lukman", analystFee: 350000, status: "Selesai" },
  { id: "ORD-002", no: 2, date: "2026-01-14", deadline: "2026-01-22", customer: "Jane Smith", analysis: "ANOVA", package: "Standard", price: 500000, analyst: "Lani", analystFee: 250000, status: "Progress" },
  { id: "ORD-003", no: 3, date: "2026-01-13", deadline: "2026-01-20", customer: "Bob Wilson", analysis: "Uji T", package: "Basic", price: 250000, analyst: "Hamka", analystFee: 125000, status: "Menunggu" },
]

const samplePengeluaran = [
  { id: "EXP-001", date: "2026-01-10", type: "Operasional - Server Hosting", amount: 500000 },
  { id: "EXP-002", date: "2026-01-05", type: "Gaji Analis", amount: 5000000 },
  { id: "EXP-003", date: "2026-01-08", type: "Marketing - Iklan Google Ads", amount: 1000000 },
]

const sampleHargaAnalisis = [
  { id: "1", name: "Regresi Linear", package: "Basic", price: 250000 },
  { id: "2", name: "Regresi Linear", package: "Standard", price: 500000 },
  { id: "3", name: "Regresi Linear", package: "Premium", price: 700000 },
]

const sampleAnalis = [
  { id: "1", name: "Lukman", description: "Ahli statistik dengan pengalaman 5+ tahun", expertise: "Statistik Inferensial, SEM, Regresi", photo: "/authors/team1-1-.webp", whatsapp: "08123456789", bankAccount: "BCA - 1234567890" },
  { id: "2", name: "Lani", description: "Spesialis analisis data kuantitatif", expertise: "Regresi & Korelasi, ANOVA", photo: "/authors/team1-1-.webp", whatsapp: "08234567890", bankAccount: "Mandiri - 0987654321" },
]

export function EditDataView() {
  const [activeTab, setActiveTab] = useState<DataTable>("order")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deletingItem, setDeletingItem] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<any>({})

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleEdit = (item: any, table: DataTable) => {
    setEditingItem({ ...item, table })
    setEditFormData(item)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    console.log("Saving edit:", editFormData)
    alert("Data berhasil diupdate!")
    setIsEditDialogOpen(false)
    setEditingItem(null)
    setEditFormData({})
  }

  const handleDelete = (item: any, table: DataTable) => {
    setDeletingItem({ ...item, table })
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    console.log("Deleting:", deletingItem)
    alert("Data berhasil dihapus!")
    setIsDeleteDialogOpen(false)
    setDeletingItem(null)
  }

  const dataTableTabs = [
    { id: "order" as DataTable, label: "Order" },
    { id: "pengeluaran" as DataTable, label: "Pengeluaran" },
    { id: "harga-analisis" as DataTable, label: "Harga Analisis" },
    { id: "analis" as DataTable, label: "Analis" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Edit Data</h2>
        <p className="text-slate-600 mt-1">Kelola data order, pengeluaran, harga, dan analis</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
        {dataTableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap",
              activeTab === tab.id
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order Table */}
      {activeTab === "order" && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Deadline</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Analisis</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Paket</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Harga</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Analyst</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Fee Analis</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sampleOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{order.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{order.no}</td>
                      <td className="px-4 py-3 text-sm">{order.date}</td>
                      <td className="px-4 py-3 text-sm">{order.deadline}</td>
                      <td className="px-4 py-3 text-sm">{order.customer}</td>
                      <td className="px-4 py-3 text-sm">{order.analysis}</td>
                      <td className="px-4 py-3 text-sm">{order.package}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(order.price)}</td>
                      <td className="px-4 py-3 text-sm">{order.analyst}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(order.analystFee)}</td>
                      <td className="px-4 py-3 text-sm">{order.status}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            onClick={() => handleEdit(order, "order")}
                          >
                            <Pencil className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            onClick={() => handleDelete(order, "order")}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pengeluaran Table */}
      {activeTab === "pengeluaran" && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Jenis Pengeluaran</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Harga</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {samplePengeluaran.map((expense) => (
                    <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{expense.id}</td>
                      <td className="px-4 py-3 text-sm">{expense.date}</td>
                      <td className="px-4 py-3 text-sm">{expense.type}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(expense.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            onClick={() => handleEdit(expense, "pengeluaran")}
                          >
                            <Pencil className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            onClick={() => handleDelete(expense, "pengeluaran")}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Harga Analisis Table */}
      {activeTab === "harga-analisis" && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nama Analisis</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Jenis Paket</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Harga</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sampleHargaAnalisis.map((price) => (
                    <tr key={price.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{price.id}</td>
                      <td className="px-4 py-3 text-sm">{price.name}</td>
                      <td className="px-4 py-3 text-sm">{price.package}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(price.price)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            onClick={() => handleEdit(price, "harga-analisis")}
                          >
                            <Pencil className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            onClick={() => handleDelete(price, "harga-analisis")}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analis Table */}
      {activeTab === "analis" && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nama</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Keahlian</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sampleAnalis.map((analyst) => (
                    <tr key={analyst.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{analyst.id}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{analyst.name}</td>
                      <td className="px-4 py-3 text-sm">{analyst.expertise}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            onClick={() => handleEdit(analyst, "analis")}
                          >
                            <Pencil className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            onClick={() => handleDelete(analyst, "analis")}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog - Generic for all tables */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data</DialogTitle>
            <DialogDescription>
              Ubah data yang dipilih
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Order Form */}
            {editingItem?.table === "order" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-no">No</Label>
                  <Input
                    id="edit-no"
                    type="number"
                    value={editFormData.no || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, no: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-date">Tanggal</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={editFormData.date || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-deadline">Deadline</Label>
                    <Input
                      id="edit-deadline"
                      type="date"
                      value={editFormData.deadline || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-customer">Customer</Label>
                  <Input
                    id="edit-customer"
                    value={editFormData.customer || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, customer: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-analysis">Jenis Analisis</Label>
                  <Input
                    id="edit-analysis"
                    value={editFormData.analysis || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, analysis: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-package">Paket</Label>
                  <select
                    id="edit-package"
                    value={editFormData.package || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, package: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Harga</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={editFormData.price || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, price: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-analyst-fee">Fee Analis</Label>
                    <Input
                      id="edit-analyst-fee"
                      type="number"
                      value={editFormData.analystFee || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, analystFee: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-analyst">Analyst</Label>
                  <Input
                    id="edit-analyst"
                    value={editFormData.analyst || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, analyst: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <select
                    id="edit-status"
                    value={editFormData.status || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="Menunggu">Menunggu</option>
                    <option value="Progress">Progress</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </>
            )}

            {/* Pengeluaran Form */}
            {editingItem?.table === "pengeluaran" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Tanggal</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editFormData.date || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Jenis Pengeluaran</Label>
                  <Input
                    id="edit-type"
                    value={editFormData.type || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Harga</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    value={editFormData.amount || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, amount: parseInt(e.target.value) })}
                  />
                </div>
              </>
            )}

            {/* Harga Analisis Form */}
            {editingItem?.table === "harga-analisis" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nama Analisis</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-package">Jenis Paket</Label>
                  <select
                    id="edit-package"
                    value={editFormData.package || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, package: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Harga</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editFormData.price || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, price: parseInt(e.target.value) })}
                  />
                </div>
              </>
            )}

            {/* Analis Form */}
            {editingItem?.table === "analis" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nama</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Deskripsi</Label>
                  <Textarea
                    id="edit-description"
                    value={editFormData.description || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-expertise">Keahlian</Label>
                  <Input
                    id="edit-expertise"
                    value={editFormData.expertise || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, expertise: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-photo">Photo URL</Label>
                  <Input
                    id="edit-photo"
                    value={editFormData.photo || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, photo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-whatsapp">Whatsapp</Label>
                  <Input
                    id="edit-whatsapp"
                    value={editFormData.whatsapp || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-bank">Rekening Bank</Label>
                  <Input
                    id="edit-bank"
                    value={editFormData.bankAccount || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, bankAccount: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini tidak dapat dibatalkan
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          {deletingItem && (
            <div className="py-4">
              <p className="text-sm text-slate-600">
                Apakah Anda yakin ingin menghapus data ini?
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Ya, Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
