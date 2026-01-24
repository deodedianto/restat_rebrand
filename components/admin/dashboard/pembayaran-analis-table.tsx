"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnalystPayment {
  id: string
  month: string
  analyst: string
  total: number
  accountNumber: string
  status: string
}

interface PembayaranAnalisTableProps {
  payments: AnalystPayment[]
  formatCurrency: (value: number) => string
}

export function PembayaranAnalisTable({ payments, formatCurrency }: PembayaranAnalisTableProps) {
  return (
    <Card className="border-0 shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Pembayaran Analis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Bulan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nama Analis</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">No Rekening</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm">{payment.month}</td>
                    <td className="px-4 py-3 text-sm font-medium">{payment.analyst}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(payment.total)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{payment.accountNumber}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        payment.status === "Dibayar"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      )}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Tidak ada pembayaran di bulan ini
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
