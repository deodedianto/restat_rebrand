"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useEditData, DataTable } from "./use-edit-data"
import { OrderTable } from "./order-table"
import { PengeluaranTable } from "./pengeluaran-table"
import { HargaAnalisisTable } from "./harga-analisis-table"
import { AnalisTable } from "./analis-table"
import { EditDialog } from "./shared/edit-dialog"
import { DeleteConfirmation } from "./shared/delete-confirmation"

const dataTableTabs = [
  { id: "order" as DataTable, label: "Order" },
  { id: "pengeluaran" as DataTable, label: "Pengeluaran" },
  { id: "harga-analisis" as DataTable, label: "Harga Analisis" },
  { id: "analis" as DataTable, label: "Analis" },
]

export function EditDataView() {
  const [activeTab, setActiveTab] = useState<DataTable>("order")
  const {
    orders,
    pengeluaran,
    hargaAnalisis,
    analis,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editingItem,
    deletingItem,
    editFormData,
    setEditFormData,
    validationErrors,
    isAddMode,
    handleAdd,
    handleEdit,
    handleSaveEdit,
    handleDelete,
    handleConfirmDelete,
    formatCurrency,
  } = useEditData()

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Edit Data</h2>
        <p className="text-slate-600 mt-1">Kelola data order, pengeluaran, harga, dan analis</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
        {dataTableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap",
              activeTab === tab.id
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      {activeTab === "order" && (
        <OrderTable
          orders={orders}
          formatCurrency={formatCurrency}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {activeTab === "pengeluaran" && (
        <PengeluaranTable
          pengeluaran={pengeluaran}
          formatCurrency={formatCurrency}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {activeTab === "harga-analisis" && (
        <HargaAnalisisTable
          hargaAnalisis={hargaAnalisis}
          formatCurrency={formatCurrency}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {activeTab === "analis" && (
        <AnalisTable
          analis={analis}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Edit Dialog */}
      <EditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        isAddMode={isAddMode}
        editingItem={editingItem}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        validationErrors={validationErrors}
        onSave={handleSaveEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
