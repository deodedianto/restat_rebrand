"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { BarChart3, ChevronDown, ChevronUp, Pencil, X, Check } from "lucide-react"

interface WorkHistoryItem {
  id: number
  type: string
  date: string
  time?: string
  status: "Selesai" | "Sedang Dikerjakan" | "Dijadwalkan"
  note: string
}

interface WorkProgressProps {
  initialWorkHistory?: WorkHistoryItem[]
  onUpdateNote?: (id: number, note: string) => void
}

const defaultWorkHistory: WorkHistoryItem[] = [
  { id: 1, type: "Konsultasi", date: "10 Januari 2025", time: "20:30", status: "Selesai", note: "" },
  { id: 2, type: "Pembayaran", date: "14 Januari 2025", time: "", status: "Selesai", note: "" },
  { id: 3, type: "Pengerjaan", date: "15 Januari 2025", time: "", status: "Sedang Dikerjakan", note: "" },
  { id: 4, type: "Konsultasi", date: "16 Januari 2025", time: "", status: "Dijadwalkan", note: "" },
]

export function WorkProgress({ initialWorkHistory = defaultWorkHistory, onUpdateNote }: WorkProgressProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [workHistory, setWorkHistory] = useState(initialWorkHistory)
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [editingNoteValue, setEditingNoteValue] = useState("")

  const handleEditNote = (id: number, currentNote: string) => {
    setEditingNoteId(id)
    setEditingNoteValue(currentNote)
  }

  const handleSaveNote = (id: number) => {
    setWorkHistory(workHistory.map((item) =>
      item.id === id ? { ...item, note: editingNoteValue } : item
    ))
    if (onUpdateNote) {
      onUpdateNote(id, editingNoteValue)
    }
    setEditingNoteId(null)
    setEditingNoteValue("")
  }

  const handleCancelEditNote = () => {
    setEditingNoteId(null)
    setEditingNoteValue("")
  }

  return (
    <Card className="mb-3 sm:mb-6 border-0 shadow-md overflow-hidden bg-white py-2.5 px-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer bg-white hover:bg-slate-50 transition-colors py-2 px-4 sm:px-6 gap-0.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                  <BarChart3 className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base text-slate-800 leading-tight mb-0.5">Proses Pengerjaan</CardTitle>
                  <CardDescription className="text-xs text-slate-600 leading-tight">Daftar semua jadwal konsultasi dan pengerjaan analisis data</CardDescription>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            {/* Riwayat Pengerjaan Table */}
            <div className="mb-6 bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Riwayat Pengerjaan
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Jam
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {workHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 sm:px-6 py-3 text-sm font-medium text-foreground">{item.type}</td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-muted-foreground">{item.date}</td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-muted-foreground">{item.time}</td>
                        <td className="px-4 sm:px-6 py-3">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              item.status === "Selesai"
                                ? "bg-green-100 text-green-700"
                                : item.status === "Sedang Dikerjakan"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          {editingNoteId === item.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingNoteValue}
                                onChange={(e) => setEditingNoteValue(e.target.value)}
                                placeholder="Tambahkan catatan..."
                                className="h-8 text-sm"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveNote(item.id)}
                                className="h-8 px-2 rounded-md"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEditNote}
                                className="h-8 px-2 rounded-md"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground flex-1">
                                {item.note || "-"}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditNote(item.id, item.note)}
                                className="h-8 w-8 p-0 hover:bg-slate-100"
                              >
                                <Pencil className="w-4 h-4 text-slate-600" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
