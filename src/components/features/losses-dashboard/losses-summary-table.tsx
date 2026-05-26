import { Card } from "@/components/ui/card"
import { TableContainer } from "@/components/ui/table-container"
import {
  formatReportInteger,
  formatReportPercent,
  formatReportWeight
} from "@/lib/utils/report-format"
import type {
  LossesModelSummary,
  LossesModuleSummary,
  LossesOperatorSummary
} from "@/types/losses-dashboard"

export type LossesSummaryTablesProps = {
  moduleSummaries: LossesModuleSummary[]
  modelSummaries: LossesModelSummary[]
  operatorSummaries: LossesOperatorSummary[]
}

function formatModulePrimary(module: LossesModuleSummary): string {
  if (
    module.primaryLabel.toLowerCase().includes("peso") ||
    module.primaryLabel.toLowerCase().includes("refugo")
  ) {
    return formatReportWeight(module.primaryValue)
  }

  if (module.primaryLabel.includes("%")) {
    return formatReportPercent(module.primaryValue)
  }

  return `${formatReportInteger(module.primaryValue)} · ${module.primaryLabel.toLowerCase()}`
}

function formatModuleSecondary(module: LossesModuleSummary): string {
  if (module.secondaryValue === undefined || !module.secondaryLabel) {
    return "—"
  }

  if (module.secondaryLabel.includes("%")) {
    return formatReportPercent(module.secondaryValue)
  }

  if (
    module.secondaryLabel.toLowerCase().includes("peso") ||
    module.secondaryLabel.toLowerCase().includes("placas")
  ) {
    return module.secondaryLabel.toLowerCase().includes("peso")
      ? formatReportWeight(module.secondaryValue)
      : formatReportInteger(module.secondaryValue)
  }

  return formatReportInteger(module.secondaryValue)
}

export function LossesSummaryTables({
  moduleSummaries,
  modelSummaries,
  operatorSummaries
}: LossesSummaryTablesProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card
        title="Resumo por módulo"
        description="Consolidado de lixação e empastadeira no período."
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
              {moduleSummaries.map((module) => (
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
                    {formatModulePrimary(module)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                    {formatModuleSecondary(module)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </Card>

      <Card
        title="Empastadeira por modelo"
        description="Volume de placas empastadas por modelo de bateria."
      >
        <TableContainer>
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60">
                <th className="px-4 py-3 font-medium">Modelo</th>
                <th className="px-4 py-3 font-medium">Registros</th>
                <th className="px-4 py-3 font-medium">Placas</th>
                <th className="px-4 py-3 font-medium">Participação</th>
              </tr>
            </thead>
            <tbody>
              {modelSummaries.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-zinc-500"
                  >
                    Sem apontamentos de empastadeira no período.
                  </td>
                </tr>
              ) : (
                modelSummaries.map((model) => (
                  <tr
                    key={model.id}
                    className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                      {model.label}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                      {formatReportInteger(model.recordCount)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                      {formatReportInteger(model.platesProduced)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                      {formatReportPercent(model.sharePercent)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableContainer>
      </Card>

      <Card
        title="Lixação por operador"
        description="Refugo e placas perdidas por operador."
        className="xl:col-span-2"
      >
        <TableContainer>
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60">
                <th className="px-4 py-3 font-medium">Operador</th>
                <th className="px-4 py-3 font-medium">Registros</th>
                <th className="px-4 py-3 font-medium">Refugo</th>
                <th className="px-4 py-3 font-medium">Placas perdidas</th>
                <th className="px-4 py-3 font-medium">Participação</th>
              </tr>
            </thead>
            <tbody>
              {operatorSummaries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-zinc-500"
                  >
                    Sem apontamentos de lixação no período.
                  </td>
                </tr>
              ) : (
                operatorSummaries.map((operator) => (
                  <tr
                    key={operator.id}
                    className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                      {operator.label}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                      {formatReportInteger(operator.recordCount)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                      {formatReportWeight(operator.scrapWeightKg)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                      {formatReportInteger(operator.platesLost)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                      {formatReportPercent(operator.sharePercent)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableContainer>
      </Card>
    </div>
  )
}
