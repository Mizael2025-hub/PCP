"use client"

import { useAppStore } from "@/stores/app-store"

import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { TabBar } from "@/components/layout/tab-bar"

type DashboardShellProps = {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar variant="desktop" />

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="animate-fade-in absolute inset-0 bg-black/40"
            aria-label="Fechar menu"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 z-10">
            <Sidebar
              variant="mobile"
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <Navbar />

        <main className="flex-1 px-4 py-6 pb-24 transition-all duration-300 md:px-6 md:pb-6">
          {children}
        </main>

        <TabBar />
      </div>
    </div>
  )
}
