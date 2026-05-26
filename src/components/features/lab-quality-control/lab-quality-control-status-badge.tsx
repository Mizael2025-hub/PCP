import { cn } from "@/lib/utils/cn"
import type { LabQcStatus } from "@/types/lab-quality-control"

const STATUS_LABELS: Record<LabQcStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado"
}

const STATUS_STYLES: Record<LabQcStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  APPROVED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  REJECTED: "bg-apple-red/10 text-apple-red"
}

export type LabQualityControlStatusBadgeProps = {
  status: LabQcStatus | string
}

export function LabQualityControlStatusBadge({
  status
}: LabQualityControlStatusBadgeProps) {
  const key = status as LabQcStatus
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

export const LAB_QC_STATUS_OPTIONS = (
  Object.entries(STATUS_LABELS) as [LabQcStatus, string][]
).map(([value, label]) => ({ value, label }))
