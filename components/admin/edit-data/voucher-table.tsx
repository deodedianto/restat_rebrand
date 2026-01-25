import { DataTableWrapper } from "./shared/data-table-wrapper"
import type { DataTable } from "./use-edit-data"

interface VoucherTableProps {
  vouchers: any[]
  formatCurrency: (value: number) => string
  onAdd: (table: DataTable) => void
  onEdit: (item: any, table: DataTable) => void
}

export function VoucherTable({ vouchers, formatCurrency, onAdd, onEdit }: VoucherTableProps) {
  const formatDiscountValue = (type: string, value: number) => {
    if (type === 'percentage') {
      return `${value}%`
    }
    return formatCurrency(value)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <DataTableWrapper
      title="Data Voucher"
      onAdd={() => onAdd("voucher")}
    >
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Kode Voucher</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Deskripsi</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Jenis</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nilai Diskon</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Penggunaan</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Berlaku Sampai</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {vouchers.map((voucher) => (
            <tr 
              key={voucher.id} 
              onClick={() => onEdit(voucher, "voucher")}
              className="hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3 text-sm font-mono font-semibold text-blue-600">{voucher.voucherCode}</td>
              <td className="px-4 py-3 text-sm">{voucher.description || '-'}</td>
              <td className="px-4 py-3 text-sm">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  voucher.discountType === 'percentage' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {voucher.discountType === 'percentage' ? 'Persentase' : 'Nominal'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm font-semibold">
                {formatDiscountValue(voucher.discountType, voucher.discountValue)}
              </td>
              <td className="px-4 py-3 text-sm">
                {voucher.maxUsage ? `${voucher.currentUsage || 0}/${voucher.maxUsage}` : 'Unlimited'}
              </td>
              <td className="px-4 py-3 text-sm">{formatDate(voucher.validUntil)}</td>
              <td className="px-4 py-3 text-sm">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  voucher.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {voucher.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableWrapper>
  )
}
