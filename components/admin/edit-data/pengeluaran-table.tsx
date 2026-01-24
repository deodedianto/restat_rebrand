"use client"

import { useState } from "react"
import { DataTableWrapper } from "./shared/data-table-wrapper"
import { DataTable } from "./use-edit-data"
import { ChevronUp, ChevronDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

type SortDirection = "asc" | "desc"

interface PengeluaranTableProps {
  pengeluaran: any[]
  formatCurrency: (value: number) => string
  onAdd: (table: DataTable) => void
  onEdit: (item: any, table: DataTable) => void
}

export function PengeluaranTable({ pengeluaran, formatCurrency, onAdd, onEdit }: PengeluaranTableProps) {
  const [sortDirection, setSortDirection] = useState<SortDirection | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSort = () => {
    if (sortDirection === null) {
      setSortDirection("asc")
    } else if (sortDirection === "asc") {
      setSortDirection("desc")
    } else {
      setSortDirection("asc")
    }
  }

  // Filter pengeluaran by search query (search in type/jenis pengeluaran)
  let filteredPengeluaran = pengeluaran.filter((expense) => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    return expense.type.toLowerCase().includes(query)
  })

  // Sort pengeluaran by date if sort is active
  let sortedPengeluaran = [...filteredPengeluaran]
  
  if (sortDirection) {
    sortedPengeluaran.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    })
  }

  const SortIcon = () => {
    if (!sortDirection) return null
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    )
  }

  return (
    <DataTableWrapper
      title="Data Pengeluaran"
      onAdd={() => onAdd("pengeluaran")}
      addButtonText="Tambahkan Pengeluaran"
    >
      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cari berdasarkan Jenis Pengeluaran..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <table className="w-full">
        <thead>
          <tr className="bg-muted/50">
            <th 
              className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase cursor-pointer hover:bg-muted/70 select-none"
              onClick={(e) => {
                e.stopPropagation()
                handleSort()
              }}
            >
              Tanggal <SortIcon />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Jenis Pengeluaran</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nama</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Catatan</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Harga</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedPengeluaran.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                {searchQuery ? "Tidak ada hasil yang cocok dengan pencarian" : "Belum ada data pengeluaran"}
              </td>
            </tr>
          ) : (
            sortedPengeluaran.map((expense) => (
              <tr 
                key={expense.id} 
                onClick={() => onEdit(expense, "pengeluaran")}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-sm">{expense.date}</td>
                <td className="px-4 py-3 text-sm">{expense.type}</td>
                <td className="px-4 py-3 text-sm">{expense.name || "-"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{expense.notes || "-"}</td>
                <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(expense.amount)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </DataTableWrapper>
  )
}
