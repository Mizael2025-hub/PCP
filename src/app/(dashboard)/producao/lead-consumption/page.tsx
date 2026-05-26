import { format, subDays } from "date-fns"

import { LeadConsumptionManager } from "@/components/features/lead-consumption/lead-consumption-manager"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { LeadAlloyService } from "@/services/lead-alloy-service"
import { LeadConsumptionService } from "@/services/lead-consumption-service"
import { SectorService } from "@/services/sector-service"

export const dynamic = "force-dynamic"

type LeadConsumptionPageProps = {
  searchParams: Promise<{
    dateFrom?: string
    dateTo?: string
    alloyId?: string
    destinationSectorId?: string
  }>
}

export default async function LeadConsumptionPage({
  searchParams
}: LeadConsumptionPageProps) {
  const params = await searchParams
  const today = format(new Date(), "yyyy-MM-dd")
  const defaultDateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd")

  const filters = {
    dateFrom: params.dateFrom ?? defaultDateFrom,
    dateTo: params.dateTo ?? today,
    alloyId: params.alloyId ?? "",
    destinationSectorId: params.destinationSectorId ?? ""
  }

  const listFilters = {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    alloyId: filters.alloyId || undefined,
    destinationSectorId: filters.destinationSectorId || undefined
  }

  const consumptionService = new LeadConsumptionService()
  const alloyService = new LeadAlloyService()
  const sectorService = new SectorService()

  const [recordsResult, alloysResult, sectorsResult] = await Promise.all([
    consumptionService.list(listFilters),
    alloyService.list(),
    sectorService.list()
  ])

  if (!recordsResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Consumo de Chumbo"
          description="Registro de consumo por liga e setor de destino com histórico e gráficos."
        />
        <ErrorState message={recordsResult.message} />
      </div>
    )
  }

  const masterDataError = !alloysResult.success
    ? alloysResult.message
    : !sectorsResult.success
      ? sectorsResult.message
      : null

  if (masterDataError) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Consumo de Chumbo"
          description="Registro de consumo por liga e setor de destino com histórico e gráficos."
        />
        <ErrorState message={masterDataError} />
      </div>
    )
  }

  const records = recordsResult.data ?? []
  const dailySummary = consumptionService.buildDailySummary(records)
  const alloySummary = consumptionService.buildAlloySummary(records)
  const sectorSummary = consumptionService.buildSectorSummary(records)

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Consumo de Chumbo"
        description="Registro de consumo por liga e setor de destino com histórico e gráficos."
      />

      <LeadConsumptionManager
        initialRecords={records}
        dailySummary={dailySummary}
        alloySummary={alloySummary}
        sectorSummary={sectorSummary}
        alloys={alloysResult.data ?? []}
        sectors={sectorsResult.data ?? []}
        filters={filters}
      />
    </div>
  )
}
