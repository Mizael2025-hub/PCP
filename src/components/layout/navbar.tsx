"use client"

import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"

import { getNavLabel } from "@/config/navigation"
import { useAppStore } from "@/stores/app-store"

export function Navbar() {
  const pathname = usePathname()
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const pageTitle = getNavLabel(pathname)

  return (
    <header className="apple-blur sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-zinc-200/50 px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="apple-pressable rounded-ios-btn p-2 text-zinc-600 transition-all duration-300 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>
    </header>
  )
}
