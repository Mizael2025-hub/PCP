import { format, subDays } from "date-fns"

import { LossesDashboardView } from "@/components/features/losses-dashboard/losses-dashboard-view"
import { LossesExportAction } from "@/components/features/losses-dashboard/losses-export-action"
import { LossesPeriodFilters } from "@/components/features/losses-dashboard/losses-period-filters"
import { ReportsNav } from "@/components/features/reports/reports-nav"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { buildLossesExportPayload } from "@/lib/export/losses-export"
import { LossesDashboardService } from "@/services/losses-dashboard-service"

export const dynamic = "force-dynamic"

type PerdasPageProps = {
  searchParams: Promise<{
    dateFrom?: string
    dateTo?: string
  }>
}

export default async function PerdasPage({ searchParams }: PerdasPageProps) {
  const params = await searchParams
  const today = format(new Date(), "yyyy-MM-dd")
  const defaultDateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd")

  const lossesService = new LossesDashboardService()

  const filters = lossesService.resolveFilters(
    {
      dateFrom: params.dateFrom,
      dateTo: params.dateTo
    },
    {
      dateFrom: defaultDateFrom,
      dateTo: today
    }
  )

  const dashboardResult = await lossesService.getDashboard(filters)

  if (!dashboardResult.success || !dashboardResult.data) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Dashboard de perdas"
          description="Cruzamento de refugo na lixação e produção na empastadeira."
        />
        <ErrorState message={dashboardResult.message ?? "Erro interno."} />
      </div>
    )
  }

  const exportPayload = buildLossesExportPayload(dashboardResult.data, filters)

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Dashboard de perdas"
        description="Indicadores, gráficos e resumos cruzando lixação e empastadeira no período selecionado."
        actions={<LossesExportAction payload={exportPayload} />}
      />

      <ReportsNav />

      <LossesPeriodFilters filters={filters} />

      <LossesDashboardView dashboard={dashboardResult.data} />
    </div>
  )
}
