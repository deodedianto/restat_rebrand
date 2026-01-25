"use client"

import { useState, useEffect } from "react"
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
import { useReferralSettings, ReferralSettings } from "@/lib/hooks/use-referral-settings"
import { cn } from "@/lib/utils"

interface ReferralRewardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReferralRewardDialog({ open, onOpenChange }: ReferralRewardDialogProps) {
  const { settings, updateSettings, resetSettings } = useReferralSettings()
  const [formData, setFormData] = useState<ReferralSettings>(settings)
  const [error, setError] = useState<string>("")

  // Update form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData(settings)
      setError("")
    }
  }, [open, settings])

  const handleSave = () => {
    // Validation
    if (formData.discountValue <= 0) {
      setError("Nilai reward harus lebih dari 0")
      return
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      setError("Persentase reward tidak boleh lebih dari 100%")
      return
    }

    const success = updateSettings(formData)
    if (success) {
      alert("Pengaturan reward referal berhasil disimpan!")
      onOpenChange(false)
    } else {
      setError("Gagal menyimpan pengaturan")
    }
  }

  const handleReset = () => {
    if (confirm("Reset ke pengaturan default (10%)? Perubahan ini tidak dapat dibatalkan.")) {
      resetSettings()
      alert("Pengaturan berhasil direset ke default!")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Pengaturan Reward Referal</DialogTitle>
          <DialogDescription>
            Atur jenis dan nilai reward yang diberikan ketika order menggunakan kode referal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="discount-type">Jenis Reward</Label>
            <select
              id="discount-type"
              value={formData.discountType}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  discountType: e.target.value as 'percentage' | 'fixed'
                })
                setError("")
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="percentage">Persentase (%) dari total order</option>
              <option value="fixed">Nominal (Rp) tetap</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount-value">
              {formData.discountType === 'percentage' 
                ? 'Nilai Persentase (%)' 
                : 'Nilai Nominal (Rp)'}
            </Label>
            <Input
              id="discount-value"
              type="number"
              value={formData.discountValue}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  discountValue: parseInt(e.target.value) || 0 
                })
                setError("")
              }}
              min="0"
              max={formData.discountType === 'percentage' ? "100" : undefined}
              placeholder={formData.discountType === 'percentage' ? "Contoh: 10" : "Contoh: 50000"}
            />
            {formData.discountType === 'percentage' && (
              <p className="text-xs text-muted-foreground">
                Contoh: 10 = 10% dari total order
              </p>
            )}
            {formData.discountType === 'fixed' && (
              <p className="text-xs text-muted-foreground">
                Contoh: 50000 = Rp 50.000 per order
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>ℹ️ Cara Kerja:</strong> Ketika pengguna lain menggunakan kode referal 
              dan order mereka sudah dibayar, pemilik kode referal akan mendapatkan reward 
              sesuai pengaturan ini. Reward akan muncul di dashboard admin pada bagian 
              "Pembayaran Program Referal".
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleReset}
            type="button"
          >
            Reset Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>
              Simpan Perubahan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
