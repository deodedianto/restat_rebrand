"use client"

import { DataTableWrapper } from "./shared/data-table-wrapper"
import { useReferralSettings } from "@/lib/hooks/use-referral-settings"

interface ReferralRewardTableProps {
  formatCurrency: (value: number) => string
  onEdit: () => void
}

export function ReferralRewardTable({ formatCurrency, onEdit }: ReferralRewardTableProps) {
  const { settings, isLoading } = useReferralSettings()

  const formatRewardValue = (type: string, value: number) => {
    if (type === 'percentage') {
      return `${value}%`
    }
    return formatCurrency(value)
  }

  if (isLoading) {
    return (
      <DataTableWrapper
        title="Pengaturan Reward Referal"
        onAdd={onEdit}
        addButtonText="Edit"
      >
        <p className="text-sm text-muted-foreground p-4">Memuat...</p>
      </DataTableWrapper>
    )
  }

  return (
    <DataTableWrapper
      title="Pengaturan Reward Referal"
      onAdd={onEdit}
      addButtonText="Edit"
    >
      <div className="mb-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>💡 Catatan:</strong> Pengaturan ini disimpan secara lokal di browser. 
          Reward akan dihitung otomatis ketika order dengan kode referal sudah dibayar.
        </p>
      </div>

      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Jenis Reward</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nilai Reward</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <tr 
            onClick={onEdit}
            className="hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <td className="px-4 py-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                settings.discountType === 'percentage' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {settings.discountType === 'percentage' ? 'Persentase' : 'Nominal'}
              </span>
            </td>
            <td className="px-4 py-3 text-sm font-bold text-blue-600">
              {formatRewardValue(settings.discountType, settings.discountValue)}
            </td>
          </tr>
        </tbody>
      </table>
    </DataTableWrapper>
  )
}
