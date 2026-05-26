import { cn } from "@/lib/utils/cn"

export type SimpleBarChartItem = {
  label: string
  value: number
  displayValue?: string
}

export type SimpleBarChartProps = {
  items: SimpleBarChartItem[]
  valueSuffix?: string
  barClassName?: string
  emptyMessage?: string
  className?: string
}

function formatDefaultValue(value: number, suffix?: string): string {
  const formatted = value.toLocaleString("pt-BR", {
    maximumFractionDigits: 2
  })

  return suffix ? `${formatted}${suffix}` : formatted
}

export function SimpleBarChart({
  items,
  valueSuffix,
  barClassName,
  emptyMessage = "Sem dados para exibir.",
  className
}: SimpleBarChartProps) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500">{emptyMessage}</p>
    )
  }

  const maxValue = Math.max(...items.map((item) => item.value), 0)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => {
        const widthPercent =
          maxValue > 0 ? Math.max((item.value / maxValue) * 100, 4) : 4

        return (
          <div key={item.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-zinc-600 dark:text-zinc-400">
                {item.label}
              </span>
              <span className="shrink-0 tabular-nums text-zinc-700 dark:text-zinc-300">
                {item.displayValue ??
                  formatDefaultValue(item.value, valueSuffix)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={cn(
                  "h-full rounded-full bg-blue-500 transition-all duration-300",
                  barClassName
                )}
                style={{ width: `${widthPercent}%` }}
                role="img"
                aria-label={`${item.label}: ${item.displayValue ?? formatDefaultValue(item.value, valueSuffix)}`}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
