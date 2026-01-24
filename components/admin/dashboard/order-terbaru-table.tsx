"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Order {
  id: string
  date: string
  customer: string
  analysis: string
  price: number
  status: string
}

interface OrderTerbaruTableProps {
  orders: Order[]
  formatCurrency: (value: number) => string
}

export function OrderTerbaruTable({ orders, formatCurrency }: OrderTerbaruTableProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Order Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Jenis Analisis</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Harga</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{order.id}</td>
                    <td className="px-4 py-3 text-sm">{order.date}</td>
                    <td className="px-4 py-3 text-sm">{order.customer}</td>
                    <td className="px-4 py-3 text-sm">{order.analysis}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(order.price)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        order.status === "Selesai" && "bg-green-100 text-green-800",
                        order.status === "Progress" && "bg-blue-100 text-blue-800",
                        order.status === "Menunggu" && "bg-yellow-100 text-yellow-800"
                      )}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Tidak ada order di bulan ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
