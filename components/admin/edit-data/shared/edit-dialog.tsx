"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { DataTable } from "../use-edit-data"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isAddMode: boolean
  editingItem: any
  editFormData: any
  setEditFormData: (data: any) => void
  validationErrors: Record<string, string>
  onSave: () => void
  onDelete: () => void
  analis?: any[]
  users?: any[]
}

export function EditDialog({
  open,
  onOpenChange,
  isAddMode,
  editingItem,
  editFormData,
  setEditFormData,
  validationErrors,
  onSave,
  onDelete,
  analis = [],
  users = [],
}: EditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isAddMode ? "Tambahkan Data Baru" : "Edit Data"}</DialogTitle>
          <DialogDescription>
            {isAddMode ? "Tambahkan data baru ke tabel" : "Ubah data yang dipilih"}
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
                  className={validationErrors.no ? "border-red-500" : ""}
                />
                {validationErrors.no && (
                  <p className="text-sm text-red-600">{validationErrors.no}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Tanggal</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editFormData.date || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className={validationErrors.date ? "border-red-500" : ""}
                  />
                  {validationErrors.date && (
                    <p className="text-sm text-red-600">{validationErrors.date}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-deadline">Deadline</Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={editFormData.deadline || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                    className={validationErrors.deadline ? "border-red-500" : ""}
                  />
                  {validationErrors.deadline && (
                    <p className="text-sm text-red-600">{validationErrors.deadline}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-customer">Customer</Label>
                <Input
                  id="edit-customer"
                  value={editFormData.customer || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, customer: e.target.value })}
                  className={validationErrors.customer ? "border-red-500" : ""}
                />
                {validationErrors.customer && (
                  <p className="text-sm text-red-600">{validationErrors.customer}</p>
                )}
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
                    className={validationErrors.price ? "border-red-500" : ""}
                  />
                  {validationErrors.price && (
                    <p className="text-sm text-red-600">{validationErrors.price}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-analyst-fee">Fee Analis</Label>
                  <Input
                    id="edit-analyst-fee"
                    type="number"
                    value={editFormData.analystFee || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, analystFee: parseInt(e.target.value) })}
                    className={validationErrors.analystFee ? "border-red-500" : ""}
                  />
                  {validationErrors.analystFee && (
                    <p className="text-sm text-red-600">{validationErrors.analystFee}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-analyst">Analyst</Label>
                <select
                  id="edit-analyst"
                  value={editFormData.analyst || ""}
                  onChange={(e) => {
                    const selectedAnalyst = e.target.value
                    // Find the selected analyst to get their fee
                    const analystData = analis.find(a => a.name === selectedAnalyst)
                    setEditFormData({ 
                      ...editFormData, 
                      analyst: selectedAnalyst,
                      // Optionally pre-fill analyst fee if available
                      analystFee: analystData?.defaultFee || editFormData.analystFee || 0
                    })
                  }}
                  className={cn(
                    "w-full h-10 px-3 rounded-md border border-input bg-background",
                    validationErrors.analyst && "border-red-500"
                  )}
                >
                  <option value="">-- Pilih Analyst --</option>
                  <option value="-">Belum Ditentukan</option>
                  {analis.map((analyst) => (
                    <option key={analyst.id} value={analyst.name}>
                      {analyst.name}
                    </option>
                  ))}
                </select>
                {validationErrors.analyst && (
                  <p className="text-sm text-red-600">{validationErrors.analyst}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-work-status">Status Pengerjaan</Label>
                  <select
                    id="edit-work-status"
                    value={editFormData.workStatus || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, workStatus: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="Menunggu">Menunggu</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-payment-status">Status Pembayaran</Label>
                  <select
                    id="edit-payment-status"
                    value={editFormData.paymentStatus || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, paymentStatus: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="Belum Dibayar">Belum Dibayar</option>
                    <option value="Dibayar">Dibayar</option>
                  </select>
                </div>
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
                  className={validationErrors.date ? "border-red-500" : ""}
                />
                {validationErrors.date && (
                  <p className="text-sm text-red-600">{validationErrors.date}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Jenis Pengeluaran</Label>
                <select
                  id="edit-type"
                  value={editFormData.type || ""}
                  onChange={(e) => {
                    setEditFormData({ 
                      ...editFormData, 
                      type: e.target.value,
                      // Clear name when type changes
                      name: ""
                    })
                  }}
                  className={cn(
                    "w-full h-10 px-3 rounded-md border border-input bg-background",
                    validationErrors.type && "border-red-500"
                  )}
                >
                  <option value="">-- Pilih Jenis Pengeluaran --</option>
                  <option value="Fee Analis">Fee Analis</option>
                  <option value="Fee Referal">Fee Referal</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Biaya Iklan">Biaya Iklan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
                {validationErrors.type && (
                  <p className="text-sm text-red-600">{validationErrors.type}</p>
                )}
              </div>
              
              {/* Conditional Nama field based on expense type */}
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  Nama
                  {(editFormData.type === "Fee Analis" || editFormData.type === "Fee Referal") && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                
                {/* Fee Analis: Dropdown from Analis table */}
                {editFormData.type === "Fee Analis" ? (
                  <>
                    <select
                      id="edit-name"
                      value={editFormData.name || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className={cn(
                        "w-full h-10 px-3 rounded-md border border-input bg-background",
                        validationErrors.name && "border-red-500"
                      )}
                    >
                      <option value="">-- Pilih Analis --</option>
                      {analis.map((analyst) => (
                        <option key={analyst.id} value={analyst.name}>
                          {analyst.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors.name && (
                      <p className="text-sm text-red-600">{validationErrors.name}</p>
                    )}
                  </>
                ) : editFormData.type === "Fee Referal" ? (
                  /* Fee Referal: Dropdown from Users */
                  <>
                    <select
                      id="edit-name"
                      value={editFormData.name || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className={cn(
                        "w-full h-10 px-3 rounded-md border border-input bg-background",
                        validationErrors.name && "border-red-500"
                      )}
                    >
                      <option value="">-- Pilih User --</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.email}>
                          {user.email} ({user.name})
                        </option>
                      ))}
                    </select>
                    {validationErrors.name && (
                      <p className="text-sm text-red-600">{validationErrors.name}</p>
                    )}
                  </>
                ) : (
                  /* Other types: Regular text input */
                  <>
                    <Input
                      id="edit-name"
                      value={editFormData.name || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className={validationErrors.name ? "border-red-500" : ""}
                      placeholder="e.g., AWS, Google Ads, Nama Vendor"
                    />
                    {validationErrors.name && (
                      <p className="text-sm text-red-600">{validationErrors.name}</p>
                    )}
                  </>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Catatan</Label>
                <Input
                  id="edit-notes"
                  value={editFormData.notes || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className={validationErrors.notes ? "border-red-500" : ""}
                  placeholder="e.g., Server hosting bulanan, Kampanye iklan minggu pertama"
                />
                {validationErrors.notes && (
                  <p className="text-sm text-red-600">{validationErrors.notes}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Harga</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editFormData.amount || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, amount: parseInt(e.target.value) })}
                  className={validationErrors.amount ? "border-red-500" : ""}
                />
                {validationErrors.amount && (
                  <p className="text-sm text-red-600">{validationErrors.amount}</p>
                )}
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
                  className={validationErrors.name ? "border-red-500" : ""}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-package">Jenis Paket</Label>
                <select
                  id="edit-package"
                  value={editFormData.package || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, package: e.target.value })}
                  className={`w-full h-10 px-3 rounded-md border border-input bg-background ${validationErrors.package ? "border-red-500" : ""}`}
                >
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
                {validationErrors.package && (
                  <p className="text-sm text-red-600">{validationErrors.package}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Harga</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editFormData.price || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, price: parseInt(e.target.value) })}
                  className={validationErrors.price ? "border-red-500" : ""}
                />
                {validationErrors.price && (
                  <p className="text-sm text-red-600">{validationErrors.price}</p>
                )}
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
                  className={validationErrors.name ? "border-red-500" : ""}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-whatsapp">No WhatsApp</Label>
                <PhoneInput
                  value={editFormData.whatsapp || ""}
                  onChange={(value) => setEditFormData({ ...editFormData, whatsapp: value })}
                  placeholder="8123456789"
                  error={!!validationErrors.whatsapp}
                />
                {validationErrors.whatsapp && (
                  <p className="text-sm text-red-600">{validationErrors.whatsapp}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bank-name">Nama Bank</Label>
                <Input
                  id="edit-bank-name"
                  placeholder="Masukkan nama bank (e.g., BCA, Mandiri)"
                  value={editFormData.bankName || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, bankName: e.target.value })}
                  className={validationErrors.bankName ? "border-red-500" : ""}
                />
                {validationErrors.bankName && (
                  <p className="text-sm text-red-600">{validationErrors.bankName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bank-account">No Rekening</Label>
                <Input
                  id="edit-bank-account"
                  placeholder="Masukkan nomor rekening"
                  value={editFormData.bankAccountNumber || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, bankAccountNumber: e.target.value })}
                  className={validationErrors.bankAccountNumber ? "border-red-500" : ""}
                />
                {validationErrors.bankAccountNumber && (
                  <p className="text-sm text-red-600">{validationErrors.bankAccountNumber}</p>
                )}
              </div>
            </>
          )}
        </div>
        <DialogFooter className="flex justify-between items-center">
          <div className="flex-1">
            {!isAddMode && (
              <Button 
                variant="destructive" 
                onClick={onDelete}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button onClick={onSave}>
              {isAddMode ? "Tambahkan" : "Simpan Perubahan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
