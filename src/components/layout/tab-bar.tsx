"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { NAV_ITEMS } from "@/config/navigation"
import { cn } from "@/lib/utils/cn"

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function TabBar() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegação principal"
      className="apple-blur fixed bottom-0 z-50 flex h-16 w-full items-center justify-around border-t border-zinc-200/50 pb-safe md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = isActiveRoute(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "apple-pressable flex flex-1 flex-col items-center justify-center gap-1 px-1 py-2 transition-all duration-300",
              isActive
                ? "text-blue-500"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-5 w-5" strokeWidth={1.5} />
            <span className="text-[10px] font-medium leading-none">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
