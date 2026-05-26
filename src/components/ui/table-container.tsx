import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils/cn"

export type TableContainerProps = HTMLAttributes<HTMLDivElement> & {
  toolbar?: ReactNode
}

export function TableContainer({
  className,
  toolbar,
  children,
  ...props
}: TableContainerProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-ios-card border border-zinc-200 bg-white shadow-sm transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
      {...props}
    >
      {toolbar && (
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}
