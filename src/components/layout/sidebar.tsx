"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { NAV_ITEMS } from "@/config/navigation"
import { cn } from "@/lib/utils/cn"
import { useAppStore } from "@/stores/app-store"

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

type SidebarProps = {
  variant?: "desktop" | "mobile"
  onNavigate?: () => void
}

export function Sidebar({ variant = "desktop", onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const profile = useAppStore((state) => state.profile)
  const user = useAppStore((state) => state.user)

  return (
    <aside
      className={cn(
        "apple-blur flex h-full flex-col border-r border-zinc-200/50 transition-all duration-300 dark:border-zinc-800/50",
        variant === "desktop"
          ? "fixed inset-y-0 left-0 z-30 hidden w-64 md:flex"
          : "animate-slide-in-left h-full w-72"
      )}
    >
      <div className="flex h-14 items-center border-b border-zinc-200/50 px-4 dark:border-zinc-800/50">
        <Link
          href="/"
          onClick={onNavigate}
          className="text-lg font-semibold transition-colors duration-300 hover:text-blue-500"
        >
          PCP Baterias
        </Link>
      </div>

      <nav
        aria-label="Menu lateral"
        className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = isActiveRoute(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "apple-pressable flex items-center gap-3 rounded-ios-btn px-3 py-2.5 text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {profile && (
        <div className="border-t border-zinc-200/50 p-4 dark:border-zinc-800/50">
          <p className="truncate text-sm font-medium">{profile.full_name}</p>
          {user?.email && (
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          )}
        </div>
      )}
    </aside>
  )
}
