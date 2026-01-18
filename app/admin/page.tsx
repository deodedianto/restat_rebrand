"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Database, FileText, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { DashboardView } from "@/components/admin/dashboard-view"
import { EditDataView } from "@/components/admin/edit-data-view"
import { ArtikelView } from "@/components/admin/artikel-view"

type MenuItem = "dashboard" | "edit-data" | "artikel"

export default function AdminPage() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const menuItems = [
    { id: "dashboard" as MenuItem, label: "Dashboard", icon: LayoutDashboard },
    { id: "edit-data" as MenuItem, label: "Edit Data", icon: Database },
    { id: "artikel" as MenuItem, label: "Artikel", icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-white shadow-lg"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-0 h-screen bg-white border-r border-border shadow-lg z-40 transition-transform duration-300",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            "w-64"
          )}
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Image
                src="/authors/logo-besar.png"
                alt="ReStat Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-800">ReStat</h1>
                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeMenu === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id)
                    setIsSidebarOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                    isActive
                      ? "bg-accent text-accent-foreground shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard View */}
            {activeMenu === "dashboard" && <DashboardView />}

            {/* Edit Data View */}
            {activeMenu === "edit-data" && <EditDataView />}

            {/* Artikel View */}
            {activeMenu === "artikel" && <ArtikelView />}
          </div>
        </main>
      </div>
    </div>
  )
}
