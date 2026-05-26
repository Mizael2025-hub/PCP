import { format, subDays } from "date-fns"

import { GridCastingDowntimeManager } from "@/components/features/grid-casting/grid-casting-downtime-manager"
import { GridCastingManager } from "@/components/features/grid-casting/grid-casting-manager"
import {
  GridCastingTabs,
  type GridCastingTab
} from "@/components/features/grid-casting/grid-casting-tabs"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { BatteryModelService } from "@/services/battery-model-service"
import { EmployeeService } from "@/services/employee-service"
import { GridCastingDowntimeService } from "@/services/grid-casting-downtime-service"
import { GridCastingService } from "@/services/grid-casting-service"
import { LeadAlloyService } from "@/services/lead-alloy-service"
import { MachineService } from "@/services/machine-service"
import { SectorService } from "@/services/sector-service"
import { ShiftService } from "@/services/shift-service"

export const dynamic = "force-dynamic"

type GridCastingPageProps = {
  searchParams: Promise<{
    tab?: string
    dateFrom?: string
    dateTo?: string
    shiftId?: string
    productionId?: string
  }>
}

function resolveTab(tab?: string): GridCastingTab {
  return tab === "paradas" ? "paradas" : "apontamentos"
}

function buildQueryString(params: {
  dateFrom: string
  dateTo: string
  shiftId: string
  productionId: string
}): string {
  const search = new URLSearchParams()

  if (params.dateFrom) {
    search.set("dateFrom", params.dateFrom)
  }

  if (params.dateTo) {
    search.set("dateTo", params.dateTo)
  }

  if (params.shiftId) {
    search.set("shiftId", params.shiftId)
  }

  if (params.productionId) {
    search.set("productionId", params.productionId)
  }

  return search.toString()
}

export default async function GridCastingPage({
  searchParams
}: GridCastingPageProps) {
  const params = await searchParams
  const activeTab = resolveTab(params.tab)
  const today = format(new Date(), "yyyy-MM-dd")
  const defaultDateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd")

  const filters = {
    dateFrom: params.dateFrom ?? defaultDateFrom,
    dateTo: params.dateTo ?? today,
    shiftId: params.shiftId ?? "",
    productionId: params.productionId ?? ""
  }

  const queryString = buildQueryString(filters)

  const gridCastingService = new GridCastingService()
  const gridCastingDowntimeService = new GridCastingDowntimeService()
  const sectorService = new SectorService()
  const shiftService = new ShiftService()
  const machineService = new MachineService()
  const employeeService = new EmployeeService()
  const leadAlloyService = new LeadAlloyService()
  const batteryModelService = new BatteryModelService()

  const listFilters = {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    shiftId: filters.shiftId || undefined
  }

  const downtimeListFilters = {
    ...listFilters,
    productionId: filters.productionId || undefined
  }

  const [
    recordsResult,
    downtimesResult,
    productionOptionsResult,
    sectorsResult,
    shiftsResult,
    machinesResult,
    employeesResult,
    alloysResult,
    batteryModelsResult
  ] = await Promise.all([
    gridCastingService.list(listFilters),
    gridCastingDowntimeService.list(downtimeListFilters),
    gridCastingDowntimeService.listProductionOptions(listFilters),
    sectorService.list(),
    shiftService.list(),
    machineService.list(),
    employeeService.list(),
    leadAlloyService.list(),
    batteryModelService.list()
  ])

  const primaryError =
    activeTab === "paradas"
      ? !downtimesResult.success
        ? downtimesResult.message
        : !productionOptionsResult.success
          ? productionOptionsResult.message
          : null
      : !recordsResult.success
        ? recordsResult.message
        : null

  if (primaryError) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Fundidora de Grades"
          description="Apontamentos de produção e paradas de máquina."
        />
        <ErrorState message={primaryError} />
      </div>
    )
  }

  const masterDataError = !sectorsResult.success
    ? sectorsResult.message
    : !shiftsResult.success
      ? shiftsResult.message
      : !machinesResult.success
        ? machinesResult.message
        : !employeesResult.success
          ? employeesResult.message
          : !alloysResult.success
            ? alloysResult.message
            : !batteryModelsResult.success
              ? batteryModelsResult.message
              : null

  if (masterDataError) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Fundidora de Grades"
          description="Apontamentos de produção e paradas de máquina."
        />
        <ErrorState message={masterDataError} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Fundidora de Grades"
        description="Apontamentos de produção e paradas de máquina."
      />

      <GridCastingTabs activeTab={activeTab} queryString={queryString} />

      {activeTab === "paradas" ? (
        <GridCastingDowntimeManager
          initialRecords={downtimesResult.data ?? []}
          productions={productionOptionsResult.data ?? []}
          shifts={shiftsResult.data ?? []}
          filters={filters}
        />
      ) : (
        <GridCastingManager
          initialRecords={recordsResult.data ?? []}
          sectors={sectorsResult.data ?? []}
          shifts={shiftsResult.data ?? []}
          machines={machinesResult.data ?? []}
          employees={employeesResult.data ?? []}
          alloys={alloysResult.data ?? []}
          batteryModels={batteryModelsResult.data ?? []}
          filters={{
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            shiftId: filters.shiftId
          }}
        />
      )}
    </div>
  )
}
