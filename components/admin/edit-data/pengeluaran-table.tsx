"use client"

import { DataTableWrapper } from "./shared/data-table-wrapper"
import { TableRowActions } from "./shared/table-row-actions"
import { DataTable } from "./use-edit-data"

interface PengeluaranTableProps {
  pengeluaran: any[]
  formatCurrency: (value: number) => string
  onAdd: (table: DataTable) => void
  onEdit: (item: any, table: DataTable) => void
  onDelete: (item: any, table: DataTable) => void
}

export function PengeluaranTable({ pengeluaran, formatCurrency, onAdd, onEdit, onDelete }: PengeluaranTableProps) {
  return (
    <DataTableWrapper
      title="Data Pengeluaran"
      onAdd={() => onAdd("pengeluaran")}
      addButtonText="Tambahkan Pengeluaran"
    >
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
          {pengeluaran.map((expense) => (
            <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 text-sm font-medium">{expense.id}</td>
              <td className="px-4 py-3 text-sm">{expense.date}</td>
              <td className="px-4 py-3 text-sm">{expense.type}</td>
              <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(expense.amount)}</td>
              <td className="px-4 py-3">
                <TableRowActions
                  onEdit={() => onEdit(expense, "pengeluaran")}
                  onDelete={() => onDelete(expense, "pengeluaran")}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableWrapper>
  )
}
