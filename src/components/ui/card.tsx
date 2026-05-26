import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils/cn"

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string
  description?: string
  footer?: ReactNode
}

export function Card({
  className,
  title,
  description,
  footer,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="mb-2 text-lg font-semibold">{title}</h3>}
          {description && (
            <p className="text-sm text-zinc-500">{description}</p>
          )}
        </div>
      )}

      {children}

      {footer && (
        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          {footer}
        </div>
      )}
    </div>
  )
}
