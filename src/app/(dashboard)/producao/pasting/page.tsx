import { format, subDays } from "date-fns"

import { PastingProductionManager } from "@/components/features/pasting-production/pasting-production-manager"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { BatteryModelService } from "@/services/battery-model-service"
import { EmployeeService } from "@/services/employee-service"
import { MachineService } from "@/services/machine-service"
import { PastingProductionService } from "@/services/pasting-production-service"
import { SectorService } from "@/services/sector-service"
import { ShiftService } from "@/services/shift-service"

export const dynamic = "force-dynamic"

type PastingPageProps = {
  searchParams: Promise<{
    dateFrom?: string
    dateTo?: string
    shiftId?: string
    epCode?: string
    batteryModelId?: string
  }>
}

export default async function PastingPage({ searchParams }: PastingPageProps) {
  const params = await searchParams
  const today = format(new Date(), "yyyy-MM-dd")
  const defaultDateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd")

  const filters = {
    dateFrom: params.dateFrom ?? defaultDateFrom,
    dateTo: params.dateTo ?? today,
    shiftId: params.shiftId ?? "",
    epCode: params.epCode ?? "",
    batteryModelId: params.batteryModelId ?? ""
  }

  const listFilters = {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    shiftId: filters.shiftId || undefined,
    epCode: filters.epCode || undefined,
    batteryModelId: filters.batteryModelId || undefined
  }

  const pastingService = new PastingProductionService()
  const sectorService = new SectorService()
  const shiftService = new ShiftService()
  const machineService = new MachineService()
  const employeeService = new EmployeeService()
  const batteryModelService = new BatteryModelService()

  const [
    recordsResult,
    sectorsResult,
    shiftsResult,
    machinesResult,
    employeesResult,
    batteryModelsResult
  ] = await Promise.all([
    pastingService.list(listFilters),
    sectorService.list(),
    shiftService.list(),
    machineService.list(),
    employeeService.list(),
    batteryModelService.list()
  ])

  if (!recordsResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Empastadeira"
          description="Produção com geração automática de EP Code, rastreabilidade e histórico."
        />
        <ErrorState message={recordsResult.message} />
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
          : !batteryModelsResult.success
            ? batteryModelsResult.message
            : null

  if (masterDataError) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Empastadeira"
          description="Produção com geração automática de EP Code, rastreabilidade e histórico."
        />
        <ErrorState message={masterDataError} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Empastadeira"
        description="Produção com geração automática de EP Code, rastreabilidade e histórico."
      />

      <PastingProductionManager
        initialRecords={recordsResult.data ?? []}
        sectors={sectorsResult.data ?? []}
        shifts={shiftsResult.data ?? []}
        machines={machinesResult.data ?? []}
        employees={employeesResult.data ?? []}
        batteryModels={batteryModelsResult.data ?? []}
        filters={filters}
      />
    </div>
  )
}
