"use client"

import { DataTableWrapper } from "./shared/data-table-wrapper"
import { TableRowActions } from "./shared/table-row-actions"
import { DataTable } from "./use-edit-data"

interface OrderTableProps {
  orders: any[]
  formatCurrency: (value: number) => string
  onAdd: (table: DataTable) => void
  onEdit: (item: any, table: DataTable) => void
  onDelete: (item: any, table: DataTable) => void
}

export function OrderTable({ orders, formatCurrency, onAdd, onEdit, onDelete }: OrderTableProps) {
  return (
    <DataTableWrapper
      title="Data Order"
      onAdd={() => onAdd("order")}
      addButtonText="Tambahkan Order"
    >
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
          {orders.map((order) => (
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
                <TableRowActions
                  onEdit={() => onEdit(order, "order")}
                  onDelete={() => onDelete(order, "order")}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableWrapper>
  )
}
