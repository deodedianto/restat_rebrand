"use client"

import { DataTableWrapper } from "./shared/data-table-wrapper"
import { TableRowActions } from "./shared/table-row-actions"
import { DataTable } from "./use-edit-data"

interface AnalisTableProps {
  analis: any[]
  onAdd: (table: DataTable) => void
  onEdit: (item: any, table: DataTable) => void
  onDelete: (item: any, table: DataTable) => void
}

export function AnalisTable({ analis, onAdd, onEdit, onDelete }: AnalisTableProps) {
  return (
    <DataTableWrapper
      title="Data Analis"
      onAdd={() => onAdd("analis")}
      addButtonText="Tambahkan Analis"
    >
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nama</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">No WhatsApp</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nama Bank</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">No Rekening</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {analis.map((analyst) => (
            <tr key={analyst.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 text-sm font-medium">{analyst.id}</td>
              <td className="px-4 py-3 text-sm font-semibold">{analyst.name}</td>
              <td className="px-4 py-3 text-sm">{analyst.whatsapp}</td>
              <td className="px-4 py-3 text-sm">{analyst.bankName}</td>
              <td className="px-4 py-3 text-sm">{analyst.bankAccountNumber}</td>
              <td className="px-4 py-3">
                <TableRowActions
                  onEdit={() => onEdit(analyst, "analis")}
                  onDelete={() => onDelete(analyst, "analis")}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableWrapper>
  )
}
