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
import { Loader2 } from "lucide-react"

interface ReferralRewardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReferralRewardDialog({ open, onOpenChange }: ReferralRewardDialogProps) {
  const { settings, updateSettings, resetSettings } = useReferralSettings()
  const [formData, setFormData] = useState<ReferralSettings>(settings)
  const [error, setError] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

  // Update form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData(settings)
      setError("")
    }
  }, [open, settings])

  const handleSave = async () => {
    // Validation for referred user discount
    if (formData.discountValue <= 0) {
      setError("Nilai diskon untuk referred user harus lebih dari 0")
      return
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      setError("Persentase diskon tidak boleh lebih dari 100%")
      return
    }

    // Validation for referrer reward
    if (formData.rewardValue <= 0) {
      setError("Nilai reward untuk referrer harus lebih dari 0")
      return
    }

    if (formData.rewardType === 'percentage' && formData.rewardValue > 100) {
      setError("Persentase reward tidak boleh lebih dari 100%")
      return
    }

    setIsSaving(true)
    const success = await updateSettings(formData)
    setIsSaving(false)
    
    if (success) {
      alert("Pengaturan reward referal berhasil disimpan!")
      onOpenChange(false)
    } else {
      setError("Gagal menyimpan pengaturan")
    }
  }

  const handleReset = async () => {
    if (confirm("Reset ke pengaturan default? Perubahan ini tidak dapat dibatalkan.")) {
      setIsSaving(true)
      await resetSettings()
      setIsSaving(false)
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
            Atur diskon untuk referred user dan reward untuk referrer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[500px] overflow-y-auto">
          {/* Section 1: Diskon untuk Referred User */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-800">
              Diskon untuk Referred User (Teman yang Menggunakan Kode)
            </h4>
            <div className="space-y-2">
              <Label htmlFor="discount-type">Jenis Diskon</Label>
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
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background"
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
              <p className="text-xs text-muted-foreground">
                {formData.discountType === 'percentage' 
                  ? 'Contoh: 10 = 10% diskon dari harga order' 
                  : 'Contoh: 50000 = Rp 50.000 diskon'}
              </p>
            </div>
          </div>

          {/* Section 2: Reward untuk Referrer */}
          <div className="space-y-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="text-sm font-semibold text-slate-800">
              Reward untuk Referrer (Pemilik Kode Referal)
            </h4>
            <div className="space-y-2">
              <Label htmlFor="reward-type">Jenis Reward</Label>
              <select
                id="reward-type"
                value={formData.rewardType}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    rewardType: e.target.value as 'percentage' | 'fixed'
                  })
                  setError("")
                }}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background"
              >
                <option value="percentage">Persentase (%) dari total order</option>
                <option value="fixed">Nominal (Rp) tetap</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward-value">
                {formData.rewardType === 'percentage' 
                  ? 'Nilai Persentase (%)' 
                  : 'Nilai Nominal (Rp)'}
              </Label>
              <Input
                id="reward-value"
                type="number"
                value={formData.rewardValue}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    rewardValue: parseInt(e.target.value) || 0 
                  })
                  setError("")
                }}
                min="0"
                max={formData.rewardType === 'percentage' ? "100" : undefined}
                placeholder={formData.rewardType === 'percentage' ? "Contoh: 10" : "Contoh: 10000"}
              />
              <p className="text-xs text-muted-foreground">
                {formData.rewardType === 'percentage' 
                  ? 'Contoh: 10 = 10% reward dari harga order' 
                  : 'Contoh: 10000 = Rp 10.000 reward per order'}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>ℹ️ Cara Kerja:</strong> Ketika seseorang menggunakan kode referal:
              <br />• <strong>Referred user</strong> mendapat diskon sesuai pengaturan atas
              <br />• <strong>Referrer</strong> mendapat reward sesuai pengaturan tengah (setelah order dibayar)
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleReset}
            type="button"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Default'
            )}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
