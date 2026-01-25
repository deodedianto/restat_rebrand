"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Database, FileText, Menu, X, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { DashboardView } from "@/components/admin/dashboard"
import { EditDataView } from "@/components/admin/edit-data"
import { ArtikelView } from "@/components/admin/artikel"
import { useAuth } from "@/lib/auth-context"

type MenuItem = "dashboard" | "edit-data" | "artikel"

export default function AdminPage() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const [activeMenu, setActiveMenu] = useState<MenuItem>("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Check authentication and role
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log('❌ No user, redirecting to login')
        router.push('/login')
      } else if (user.role !== 'admin' && user.role !== 'analyst') {
        console.log('❌ User is not admin/analyst, redirecting to dashboard')
        router.push('/dashboard')
      } else {
        console.log('✅ Admin authenticated:', { email: user.email, role: user.role })
      }
    }
  }, [user, isLoading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user || (user.role !== 'admin' && user.role !== 'analyst')) {
    return null
  }

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
            "fixed lg:sticky top-0 h-screen bg-white border-r border-border shadow-lg z-40 transition-transform duration-300 flex flex-col",
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
              <div className="flex-1">
                <h1 className="text-xl font-bold text-slate-800">ReStat</h1>
                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-slate-600 mb-2">Logged in as:</p>
              <p className="text-sm font-medium text-slate-800 truncate">{user.email}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
          
          <div className="p-4 border-t border-border bg-white">
            <Button 
              variant="outline" 
              className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
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
