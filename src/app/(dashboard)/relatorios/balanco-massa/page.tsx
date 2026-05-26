import { format, subDays } from "date-fns"

import { MassBalanceDashboardView } from "@/components/features/mass-balance/mass-balance-dashboard"
import { ReportFilters } from "@/components/features/reports/report-filters"
import { ReportsNav } from "@/components/features/reports/reports-nav"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { MassBalanceService } from "@/services/mass-balance-service"
import { SectorService } from "@/services/sector-service"
import { ShiftService } from "@/services/shift-service"

export const dynamic = "force-dynamic"

type BalancoMassaPageProps = {
  searchParams: Promise<{
    dateFrom?: string
    dateTo?: string
    shiftId?: string
    sectorId?: string
  }>
}

export default async function BalancoMassaPage({
  searchParams
}: BalancoMassaPageProps) {
  const params = await searchParams
  const today = format(new Date(), "yyyy-MM-dd")
  const defaultDateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd")

  const massBalanceService = new MassBalanceService()
  const shiftService = new ShiftService()
  const sectorService = new SectorService()

  const filters = massBalanceService.resolveFilters(
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
    massBalanceService.getDashboard(listFilters),
    shiftService.list(),
    sectorService.list()
  ])

  if (!dashboardResult.success || !dashboardResult.data) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Balanço de massa"
          description="Cruzamento de consumo de chumbo, misturador, fundidora e lixação."
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
          title="Balanço de massa"
          description="Cruzamento de consumo de chumbo, misturador, fundidora e lixação."
        />
        <ErrorState message={masterDataError} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Balanço de massa"
        description="Cruzamento automático entre consumo de chumbo, misturador, fundidora e refugo na lixação."
      />

      <ReportsNav />

      <ReportFilters
        filters={filters}
        shifts={shiftsResult.data ?? []}
        sectors={sectorsResult.data ?? []}
        basePath="/relatorios/balanco-massa"
      />

      <MassBalanceDashboardView dashboard={dashboardResult.data} />
    </div>
  )
}
