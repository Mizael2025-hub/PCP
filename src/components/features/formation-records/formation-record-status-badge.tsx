import { cn } from "@/lib/utils/cn"
import type { FormationStatus } from "@/types/formation-record"

const STATUS_LABELS: Record<FormationStatus, string> = {
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída"
}

const STATUS_STYLES: Record<FormationStatus, string> = {
  IN_PROGRESS: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  COMPLETED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
}

export type FormationRecordStatusBadgeProps = {
  status: FormationStatus | string
}

export function FormationRecordStatusBadge({
  status
}: FormationRecordStatusBadgeProps) {
  const key = status as FormationStatus
  const label = STATUS_LABELS[key] ?? status

  return (
    <span
      className={cn(
        "inline-flex rounded-ios-btn px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[key] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"
      )}
    >
      {label}
    </span>
  )
}

export const FORMATION_STATUS_OPTIONS = (
  Object.entries(STATUS_LABELS) as [FormationStatus, string][]
).map(([value, label]) => ({ value, label }))
