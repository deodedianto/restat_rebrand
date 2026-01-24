"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FollowUpOrder {
  id: string
  date: string
  customer: string
  email: string
  phone: string
  analysis: string
  package: string
  total: number
  daysOverdue: number
}

interface ButuhFollowUpTableProps {
  orders: FollowUpOrder[]
  formatCurrency: (value: number) => string
}

export function ButuhFollowUpTable({ orders, formatCurrency }: ButuhFollowUpTableProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          Butuh di Follow up
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tanggal Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nama Klien</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">No WhatsApp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Jenis Analisis</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Paket</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm">{order.date}</td>
                    <td className="px-4 py-3 text-sm font-medium">{order.customer}</td>
                    <td className="px-4 py-3 text-sm">
                      <a 
                        href={`https://wa.me/${order.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 hover:underline"
                      >
                        {order.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">{order.analysis}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        order.package === "Premium" && "bg-purple-100 text-purple-800",
                        order.package === "Standard" && "bg-blue-100 text-blue-800",
                        order.package === "Basic" && "bg-slate-100 text-slate-800"
                      )}>
                        {order.package}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-600">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        order.daysOverdue >= 3 ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
                      )}>
                        {order.daysOverdue} hari
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">🎉</span>
                      <p>Tidak ada order yang perlu di follow up</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {orders.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>💡 Tips:</strong> Prioritaskan follow up untuk order yang sudah lebih dari 3 hari (ditandai dengan badge merah)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
