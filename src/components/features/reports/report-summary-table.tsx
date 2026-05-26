import { Card } from "@/components/ui/card"
import { TableContainer } from "@/components/ui/table-container"
import {
  formatReportInteger,
  formatReportWeight
} from "@/lib/utils/report-format"
import type { ReportModuleSummary } from "@/types/report"

export type ReportSummaryTableProps = {
  modules: ReportModuleSummary[]
}

function formatSecondaryValue(
  value: number | undefined,
  label: string | undefined
): string {
  if (value === undefined || !label) {
    return "—"
  }

  if (label.toLowerCase().includes("peso") || label.includes("kg")) {
    return formatReportWeight(value)
  }

  return `${formatReportInteger(value)} ${label.toLowerCase()}`
}

export function ReportSummaryTable({ modules }: ReportSummaryTableProps) {
  const activeModules = modules.filter((module) => module.recordCount > 0)

  return (
    <Card
      title="Resumo por módulo"
      description="Consolidado de apontamentos e indicadores principais no período filtrado."
    >
      <TableContainer>
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60">
              <th className="px-4 py-3 font-medium">Módulo</th>
              <th className="px-4 py-3 font-medium">Registros</th>
              <th className="px-4 py-3 font-medium">Indicador principal</th>
              <th className="px-4 py-3 font-medium">Indicador secundário</th>
            </tr>
          </thead>
          <tbody>
            {activeModules.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  Nenhum apontamento encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              activeModules.map((module) => (
                <tr
                  key={module.key}
                  className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800"
                >
                  <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                    {module.label}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                    {formatReportInteger(module.recordCount)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                    {module.primaryLabel.includes("peso") ||
                    module.primaryLabel.includes("Peso") ||
                    module.primaryLabel.includes("refugo") ||
                    module.primaryLabel.includes("Refugo") ||
                    module.primaryLabel.includes("óxido") ||
                    module.primaryLabel.includes("consumido") ||
                    module.primaryLabel.includes("bateladas")
                      ? formatReportWeight(module.primaryValue)
                      : `${formatReportInteger(module.primaryValue)} · ${module.primaryLabel.toLowerCase()}`}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                    {formatSecondaryValue(
                      module.secondaryValue,
                      module.secondaryLabel
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableContainer>
    </Card>
  )
}
