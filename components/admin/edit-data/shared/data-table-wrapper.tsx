"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface DataTableWrapperProps {
  title: string
  onAdd: () => void
  addButtonText: string
  children: React.ReactNode
}

export function DataTableWrapper({ title, onAdd, addButtonText, children }: DataTableWrapperProps) {
  const handleAdd = () => {
    onAdd()
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            {addButtonText}
          </Button>
        </div>
        <div className="overflow-x-auto">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
