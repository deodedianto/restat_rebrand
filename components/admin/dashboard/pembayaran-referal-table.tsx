"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ReferralPayment {
  id: string
  date: string
  userName: string
  referralCode: string
  amount: number
  bankName: string
  accountNumber: string
  status: string
}

interface PembayaranReferalTableProps {
  payments: ReferralPayment[]
  formatCurrency: (value: number) => string
}

export function PembayaranReferalTable({ payments, formatCurrency }: PembayaranReferalTableProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Pembayaran Program Referal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nama User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Kode Referal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nominal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Bank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">No Rekening</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm">{payment.date}</td>
                    <td className="px-4 py-3 text-sm">{payment.userName}</td>
                    <td className="px-4 py-3 text-sm font-mono text-blue-600">{payment.referralCode}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3 text-sm">{payment.bankName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{payment.accountNumber}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        payment.status === "Dibayar" && "bg-green-100 text-green-800",
                        payment.status === "Belum Dibayar" && "bg-red-100 text-red-800",
                        payment.status === "Menunggu" && "bg-yellow-100 text-yellow-800",
                        payment.status === "Diproses" && "bg-blue-100 text-blue-800"
                      )}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Tidak ada pembayaran referal di bulan ini
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
