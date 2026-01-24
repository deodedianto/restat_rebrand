"use client"

import { DataTableWrapper } from "./shared/data-table-wrapper"
import { DataTable } from "./use-edit-data"

interface HargaAnalisisTableProps {
  hargaAnalisis: any[]
  formatCurrency: (value: number) => string
  onAdd: (table: DataTable) => void
  onEdit: (item: any, table: DataTable) => void
}

export function HargaAnalisisTable({ hargaAnalisis, formatCurrency, onAdd, onEdit }: HargaAnalisisTableProps) {
  return (
    <DataTableWrapper
      title="Data Harga Analisis"
      onAdd={() => onAdd("harga-analisis")}
      addButtonText="Tambahkan Harga Analisis"
    >
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nama Analisis</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Jenis Paket</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Harga</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {hargaAnalisis.map((price) => (
            <tr 
              key={price.id} 
              onClick={() => onEdit(price, "harga-analisis")}
              className="hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3 text-sm">{price.name}</td>
              <td className="px-4 py-3 text-sm">{price.package}</td>
              <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(price.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableWrapper>
  )
}
