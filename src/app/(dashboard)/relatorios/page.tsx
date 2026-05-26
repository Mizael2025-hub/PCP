import { format, subDays } from "date-fns"

import { ReportFilters } from "@/components/features/reports/report-filters"
import { ReportsDashboard } from "@/components/features/reports/reports-dashboard"
import { ReportsNav } from "@/components/features/reports/reports-nav"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { ReportService } from "@/services/report-service"
import { SectorService } from "@/services/sector-service"
import { ShiftService } from "@/services/shift-service"

export const dynamic = "force-dynamic"

type RelatoriosPageProps = {
  searchParams: Promise<{
    dateFrom?: string
    dateTo?: string
    shiftId?: string
    sectorId?: string
  }>
}

export default async function RelatoriosPage({
  searchParams
}: RelatoriosPageProps) {
  const params = await searchParams
  const today = format(new Date(), "yyyy-MM-dd")
  const defaultDateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd")

  const reportService = new ReportService()
  const shiftService = new ShiftService()
  const sectorService = new SectorService()

  const filters = reportService.resolveFilters(
    {
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      shiftId: params.shiftId,
      sectorId: params.sectorId
    },
    {
      dateFrom: defaultDateFrom,
      dateTo: today,
      shiftId: "",
      sectorId: ""
    }
  )

  const listFilters = {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    shiftId: filters.shiftId || undefined,
    sectorId: filters.sectorId || undefined
  }

  const [dashboardResult, shiftsResult, sectorsResult] = await Promise.all([
    reportService.getDashboard(listFilters),
    shiftService.list(),
    sectorService.list()
  ])

  if (!dashboardResult.success || !dashboardResult.data) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Relatórios"
          description="Indicadores consolidados de produção, qualidade e refugo."
        />
        <ErrorState message={dashboardResult.message ?? "Erro interno."} />
      </div>
    )
  }

  const masterDataError = !shiftsResult.success
    ? shiftsResult.message
    : !sectorsResult.success
      ? sectorsResult.message
      : null

  if (masterDataError) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Relatórios"
          description="Indicadores consolidados de produção, qualidade e refugo."
        />
        <ErrorState message={masterDataError} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Relatórios"
        description="Indicadores consolidados de produção, qualidade e refugo."
      />

      <ReportsNav />

      <ReportFilters
        filters={filters}
        shifts={shiftsResult.data ?? []}
        sectors={sectorsResult.data ?? []}
      />

      <ReportsDashboard dashboard={dashboardResult.data} />
    </div>
  )
}
