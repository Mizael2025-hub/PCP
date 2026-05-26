"use client"

import { cn } from "@/lib/utils/cn"
import { useRouter } from "next/navigation"

export type GridCastingTab = "apontamentos" | "paradas"

export type GridCastingTabsProps = {
  activeTab: GridCastingTab
  queryString?: string
}

const TABS: { id: GridCastingTab; label: string }[] = [
  { id: "apontamentos", label: "Apontamentos" },
  { id: "paradas", label: "Paradas" }
]

export function GridCastingTabs({
  activeTab,
  queryString
}: GridCastingTabsProps) {
  const router = useRouter()

  function navigate(tab: GridCastingTab) {
    const params = new URLSearchParams(queryString ?? "")

    if (tab === "paradas") {
      params.set("tab", "paradas")
    } else {
      params.delete("tab")
    }

    const query = params.toString()

    router.push(
      query ? `/producao/grid-casting?${query}` : "/producao/grid-casting"
    )
  }

  return (
    <div
      className="mb-6 flex gap-1 rounded-ios-card border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900"
      role="tablist"
      aria-label="Seções da fundidora"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => navigate(tab.id)}
          className={cn(
            "apple-pressable flex-1 rounded-ios-btn px-4 py-2 text-sm font-medium transition-all duration-300",
            activeTab === tab.id
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
