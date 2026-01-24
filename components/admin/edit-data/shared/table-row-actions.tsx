"use client"

import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

interface TableRowActionsProps {
  onEdit: () => void
  onDelete: () => void
}

export function TableRowActions({ onEdit, onDelete }: TableRowActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 hover:bg-blue-50"
        onClick={onEdit}
      >
        <Pencil className="w-4 h-4 text-blue-600" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 hover:bg-red-50"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </Button>
    </div>
  )
}
