import { Inbox, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils/cn"

export type EmptyStateProps = {
  title: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "animate-fade-in flex flex-col items-center justify-center rounded-ios-card border border-dashed border-zinc-300 bg-white px-6 py-12 text-center transition-all duration-300 dark:border-zinc-700 dark:bg-zinc-900",
        className
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-ios-btn bg-zinc-100 dark:bg-zinc-800">
        <Icon className="h-6 w-6 text-zinc-500" strokeWidth={1.5} />
      </div>

      <h3 className="text-lg font-semibold">{title}</h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm text-zinc-500">{description}</p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
