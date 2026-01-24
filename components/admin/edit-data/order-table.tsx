"use client"

/**
 * Order Table Component
 * 
 * Features:
 * - Smart Default Sorting: Prioritizes unassigned, paid orders (oldest first)
 * - Search: Filter by customer, analysis, package, or analyst
 * - Manual Sorting: Click column headers to override default sort
 * 
 * Default Sort Priority (when no column is manually sorted):
 * 1. Unassigned analyst + Paid → Oldest first (NEEDS IMMEDIATE ASSIGNMENT)
 * 2. Unassigned analyst + Unpaid → Oldest first
 * 3. Assigned analyst + Paid → Oldest first (Already in progress)
 * 4. Assigned analyst + Unpaid → Oldest first
 * 
 * This ensures admins immediately see which paid orders need analyst assignment.
 */

import { useState } from "react"
import { DataTableWrapper } from "./shared/data-table-wrapper"
import { DataTable } from "./use-edit-data"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

type SortColumn = "paymentStatus" | "workStatus" | "date" | "deadline" | null
type SortDirection = "asc" | "desc"

interface OrderTableProps {
  orders: any[]
  formatCurrency: (value: number) => string
  onAdd: (table: DataTable) => void
  onEdit: (item: any, table: DataTable) => void
}

export function OrderTable({ orders, formatCurrency, onAdd, onEdit }: OrderTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [searchQuery, setSearchQuery] = useState("")

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new column with ascending as default
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Filter orders by search query (search in customer, analysis, package, analyst)
  let filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    return (
      order.customer.toLowerCase().includes(query) ||
      order.analysis.toLowerCase().includes(query) ||
      order.package.toLowerCase().includes(query) ||
      order.analyst.toLowerCase().includes(query)
    )
  })

  // Sort orders
  let sortedOrders = [...filteredOrders]
  
  if (sortColumn) {
    sortedOrders.sort((a, b) => {
      let compareA: any
      let compareB: any

      switch (sortColumn) {
        case "paymentStatus":
          compareA = a.paymentStatus
          compareB = b.paymentStatus
          break
        case "workStatus":
          compareA = a.workStatus
          compareB = b.workStatus
          break
        case "date":
          compareA = new Date(a.date).getTime()
          compareB = new Date(b.date).getTime()
          break
        case "deadline":
          compareA = new Date(a.deadline).getTime()
          compareB = new Date(b.deadline).getTime()
          break
        default:
          return 0
      }

      if (sortColumn === "date" || sortColumn === "deadline") {
        // For dates, compare as numbers
        return sortDirection === "asc" ? compareA - compareB : compareB - compareA
      } else {
        // For strings, compare alphabetically
        if (compareA < compareB) return sortDirection === "asc" ? -1 : 1
        if (compareA > compareB) return sortDirection === "asc" ? 1 : -1
        return 0
      }
    })
  } else {
    // Default sort: prioritize unassigned + paid orders, then by oldest date
    sortedOrders.sort((a, b) => {
      // Check if analyst is unassigned (null, "-", or empty)
      const aUnassigned = !a.analyst || a.analyst === "-" || a.analyst.trim() === ""
      const bUnassigned = !b.analyst || b.analyst === "-" || b.analyst.trim() === ""
      
      // 1. Unassigned orders come first
      if (aUnassigned && !bUnassigned) return -1
      if (!aUnassigned && bUnassigned) return 1
      
      // 2. Among unassigned (or both assigned), paid orders come first
      if (aUnassigned === bUnassigned) {
        const aPaid = a.paymentStatus === "Dibayar"
        const bPaid = b.paymentStatus === "Dibayar"
        
        if (aPaid && !bPaid) return -1
        if (!aPaid && bPaid) return 1
        
        // 3. Among same assignment and payment status, sort by date (oldest first)
        if (aPaid === bPaid) {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          return dateA - dateB // Ascending (oldest first)
        }
      }
      
      return 0
    })
  }

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    )
  }

  return (
    <DataTableWrapper
      title="Data Order"
      onAdd={() => onAdd("order")}
      addButtonText="Tambahkan Order"
    >
      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cari berdasarkan Customer, Analisis, Paket, atau Analis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <table className="w-full">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">No</th>
            <th 
              className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase cursor-pointer hover:bg-muted/70 select-none"
              onClick={(e) => {
                e.stopPropagation()
                handleSort("paymentStatus")
              }}
            >
              Status Pembayaran <SortIcon column="paymentStatus" />
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase cursor-pointer hover:bg-muted/70 select-none"
              onClick={(e) => {
                e.stopPropagation()
                handleSort("workStatus")
              }}
            >
              Status Pengerjaan <SortIcon column="workStatus" />
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase cursor-pointer hover:bg-muted/70 select-none"
              onClick={(e) => {
                e.stopPropagation()
                handleSort("date")
              }}
            >
              Tanggal <SortIcon column="date" />
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase cursor-pointer hover:bg-muted/70 select-none"
              onClick={(e) => {
                e.stopPropagation()
                handleSort("deadline")
              }}
            >
              Deadline <SortIcon column="deadline" />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Customer</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Analisis</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Paket</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Harga</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Analyst</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Fee Analis</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedOrders.length === 0 ? (
            <tr>
              <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                {searchQuery ? "Tidak ada hasil yang cocok dengan pencarian" : "Belum ada data order"}
              </td>
            </tr>
          ) : (
            sortedOrders.map((order) => (
              <tr 
                key={order.id} 
                onClick={() => onEdit(order, "order")}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-sm font-medium">{order.no}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    order.paymentStatus === "Dibayar" && "bg-green-100 text-green-800",
                    order.paymentStatus === "Belum Dibayar" && "bg-red-100 text-red-800"
                  )}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    order.workStatus === "Selesai" && "bg-green-100 text-green-800",
                    order.workStatus === "Diproses" && "bg-blue-100 text-blue-800",
                    order.workStatus === "Menunggu" && "bg-yellow-100 text-yellow-800"
                  )}>
                    {order.workStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{order.date}</td>
                <td className="px-4 py-3 text-sm">{order.deadline}</td>
                <td className="px-4 py-3 text-sm">{order.customer}</td>
                <td className="px-4 py-3 text-sm">{order.analysis}</td>
                <td className="px-4 py-3 text-sm">{order.package}</td>
                <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(order.price)}</td>
                <td className="px-4 py-3 text-sm">{order.analyst}</td>
                <td className="px-4 py-3 text-sm">{formatCurrency(order.analystFee)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </DataTableWrapper>
  )
}
