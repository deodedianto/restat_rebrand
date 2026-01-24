"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface FinancialChartProps {
  data: Array<{
    month: string
    pendapatan: number
    pengeluaran: number
    pendapatanBersih: number
  }>
  formatCurrency: (value: number) => string
}

export function FinancialChart({ data, formatCurrency }: FinancialChartProps) {
  return (
    <Card className="border-0 shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Tren Keuangan Bulanan</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
            <Tooltip
              formatter={(value: any) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px'
              }}
            />
            <Legend />
            <Bar dataKey="pendapatan" fill="#10b981" name="Pendapatan" radius={[8, 8, 0, 0]} />
            <Bar dataKey="pengeluaran" fill="#ef4444" name="Pengeluaran" radius={[8, 8, 0, 0]} />
            <Line
              type="monotone"
              dataKey="pendapatanBersih"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Pendapatan Bersih"
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
