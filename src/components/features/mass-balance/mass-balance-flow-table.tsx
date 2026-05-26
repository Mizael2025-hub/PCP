import { Card } from "@/components/ui/card"
import { TableContainer } from "@/components/ui/table-container"
import { cn } from "@/lib/utils/cn"
import {
  formatReportInteger,
  formatReportPercent,
  formatReportWeight
} from "@/lib/utils/report-format"
import type { MassBalanceFlowStep } from "@/types/mass-balance"

export type MassBalanceFlowTableProps = {
  steps: MassBalanceFlowStep[]
}

const TONE_STYLES: Record<MassBalanceFlowStep["tone"], string> = {
  input: "text-blue-600 dark:text-blue-400",
  process: "text-emerald-600 dark:text-emerald-400",
  output: "text-indigo-600 dark:text-indigo-400",
  loss: "text-orange-600 dark:text-orange-400",
  balance: "text-apple-red"
}

export function MassBalanceFlowTable({ steps }: MassBalanceFlowTableProps) {
  return (
    <Card
      title="Fluxo de balanço de massa"
      description="Entrada de chumbo cruzada com misturador, fundidora e lixação."
    >
      <TableContainer>
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60">
              <th className="px-4 py-3 font-medium">Etapa</th>
              <th className="px-4 py-3 font-medium">Origem</th>
              <th className="px-4 py-3 font-medium">Registros</th>
              <th className="px-4 py-3 font-medium">Massa</th>
              <th className="px-4 py-3 font-medium">Participação</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step) => (
              <tr
                key={step.key}
                className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800"
              >
                <td className="px-4 py-3">
                  <p className={cn("font-medium", TONE_STYLES[step.tone])}>
                    {step.label}
                  </p>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {step.description}
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                  {step.key === "balance"
                    ? "—"
                    : formatReportInteger(step.recordCount)}
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                  {formatReportWeight(step.weightKg)}
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                  {formatReportPercent(step.sharePercent)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableContainer>
    </Card>
  )
}
