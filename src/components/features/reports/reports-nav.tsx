"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils/cn"

const REPORT_LINKS = [
  {
    href: "/relatorios",
    label: "Consolidado"
  },
  {
    href: "/relatorios/balanco-massa",
    label: "Balanço de massa"
  },
  {
    href: "/relatorios/perdas",
    label: "Perdas"
  }
] as const

export function ReportsNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap gap-2">
      {REPORT_LINKS.map((link) => {
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "apple-pressable rounded-ios-btn px-4 py-2 text-sm font-medium transition-all duration-300",
              isActive
                ? "bg-blue-500 text-white"
                : "border border-zinc-200 bg-white text-zinc-700 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
