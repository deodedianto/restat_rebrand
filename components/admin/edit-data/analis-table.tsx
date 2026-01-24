"use client"

import { DataTableWrapper } from "./shared/data-table-wrapper"
import { DataTable } from "./use-edit-data"

interface AnalisTableProps {
  analis: any[]
  onAdd: (table: DataTable) => void
  onEdit: (item: any, table: DataTable) => void
}

export function AnalisTable({ analis, onAdd, onEdit }: AnalisTableProps) {
  return (
    <DataTableWrapper
      title="Data Analis"
      onAdd={() => onAdd("analis")}
      addButtonText="Tambahkan Analis"
    >
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nama</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">No WhatsApp</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nama Bank</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">No Rekening</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {analis.map((analyst) => (
            <tr 
              key={analyst.id} 
              onClick={() => onEdit(analyst, "analis")}
              className="hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3 text-sm font-semibold">{analyst.name}</td>
              <td className="px-4 py-3 text-sm">{analyst.whatsapp}</td>
              <td className="px-4 py-3 text-sm">{analyst.bankName}</td>
              <td className="px-4 py-3 text-sm">{analyst.bankAccountNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableWrapper>
  )
}
