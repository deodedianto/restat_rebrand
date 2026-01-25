"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { BarChart3, ChevronDown, ChevronUp, Pencil, X, Check, CreditCard, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useWorkProgress } from "./use-work-progress"
import { cn } from "@/lib/utils"

interface WorkProgressProps {
  userId?: string
}

export function WorkProgress({ userId }: WorkProgressProps) {
  const {
    isOpen,
    setIsOpen,
    workHistory,
    editingNoteId,
    editingNoteValue,
    setEditingNoteValue,
    deleteDialogOpen,
    setDeleteDialogOpen,
    itemToDelete,
    handleEditNote,
    handleSaveNote,
    handleCancelEdit,
    handlePayment,
    handleDeleteClick,
    handleDeleteConfirm,
    formatCurrency,
  } = useWorkProgress(userId)

  return (
    <>
      <Card className="mb-3 sm:mb-6 border-0 shadow-md overflow-hidden bg-white py-2.5 px-0" id="riwayat-pengerjaan">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer bg-white hover:bg-slate-50 transition-colors py-2 px-4 sm:px-6 gap-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shadow-sm">
                    <BarChart3 className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm sm:text-base text-slate-800 leading-tight mb-0.5">Riwayat Pengerjaan</CardTitle>
                    <CardDescription className="text-xs text-slate-600 leading-tight">
                      Lihat riwayat konsultasi dan pengerjaan analisis
                    </CardDescription>
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
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Riwayat Pengerjaan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Jam
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Note
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Pengiriman Hasil
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Jenis Analisis
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Paket
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {workHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-800">{item.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.time || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                            item.status === "Selesai" && "bg-green-100 text-green-800",
                            item.status === "Sedang Dikerjakan" && "bg-blue-100 text-blue-800",
                            item.status === "Dijadwalkan" && "bg-purple-100 text-purple-800",
                            item.status === "Belum Dibayar" && "bg-red-100 text-red-800",
                            item.status === "Dibayar" && "bg-green-100 text-green-800"
                          )}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                        {editingNoteId === item.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingNoteValue}
                              onChange={(e) => setEditingNoteValue(e.target.value)}
                              className="h-8 text-sm"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                              onClick={() => handleSaveNote(item.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <span className="whitespace-pre-line">{item.note || "-"}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleEditNote(item.id, item.note)}
                            >
                              <Pencil className="w-3 h-3 text-slate-400" />
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {item.orderDetails?.deliveryDate || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.orderDetails?.analysisMethod.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {item.orderDetails?.package.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {item.orderDetails ? formatCurrency(item.orderDetails.totalPrice) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {(item.type === "Order" || item.type === "Pembayaran") && item.status === "Belum Dibayar" && (
                            <Button
                              size="sm"
                              className="h-8 px-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                              onClick={() => handlePayment(item)}
                            >
                              <CreditCard className="w-3 h-3 mr-1" />
                              Bayar
                            </Button>
                          )}
                          {item.status !== "Dibayar" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-red-50"
                              onClick={() => handleDeleteClick(item)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus item ini dari riwayat?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {itemToDelete && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground">
                {itemToDelete.orderDetails?.researchTitle || itemToDelete.type}
              </p>
              {itemToDelete.orderDetails && (
                <p className="text-xs text-muted-foreground mt-1">
                  {itemToDelete.orderDetails?.analysisMethod.name} - {itemToDelete.orderDetails?.package.name}
                </p>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
