import { format, subDays } from "date-fns"

import { AssemblyProductionManager } from "@/components/features/assembly-production/assembly-production-manager"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { AssemblyProductionService } from "@/services/assembly-production-service"
import { EmployeeService } from "@/services/employee-service"
import { MachineService } from "@/services/machine-service"
import { SectorService } from "@/services/sector-service"
import { ShiftService } from "@/services/shift-service"

export const dynamic = "force-dynamic"

type AssemblyPageProps = {
  searchParams: Promise<{
    dateFrom?: string
    dateTo?: string
    shiftId?: string
    batteryLotCode?: string
    epCode?: string
  }>
}

export default async function AssemblyPage({
  searchParams
}: AssemblyPageProps) {
  const params = await searchParams
  const today = format(new Date(), "yyyy-MM-dd")
  const defaultDateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd")

  const filters = {
    dateFrom: params.dateFrom ?? defaultDateFrom,
    dateTo: params.dateTo ?? today,
    shiftId: params.shiftId ?? "",
    batteryLotCode: params.batteryLotCode ?? "",
    epCode: params.epCode ?? ""
  }

  const listFilters = {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    shiftId: filters.shiftId || undefined,
    batteryLotCode: filters.batteryLotCode || undefined,
    epCode: filters.epCode || undefined
  }

  const assemblyService = new AssemblyProductionService()
  const sectorService = new SectorService()
  const shiftService = new ShiftService()
  const machineService = new MachineService()
  const employeeService = new EmployeeService()

  const [
    recordsResult,
    availablePastingResult,
    sectorsResult,
    shiftsResult,
    machinesResult,
    employeesResult
  ] = await Promise.all([
    assemblyService.list(listFilters),
    assemblyService.listAvailablePasting(),
    sectorService.list(),
    shiftService.list(),
    machineService.list(),
    employeeService.list()
  ])

  if (!recordsResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Montagem"
          description="Geração de lote da bateria, rastreabilidade com EP Code e histórico."
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
          : !availablePastingResult.success
            ? availablePastingResult.message
            : null

  if (masterDataError) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Montagem"
          description="Geração de lote da bateria, rastreabilidade com EP Code e histórico."
        />
        <ErrorState message={masterDataError} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Montagem"
        description="Geração de lote da bateria, rastreabilidade com EP Code, características dinâmicas e histórico."
      />

      <AssemblyProductionManager
        initialRecords={recordsResult.data ?? []}
        sectors={sectorsResult.data ?? []}
        shifts={shiftsResult.data ?? []}
        machines={machinesResult.data ?? []}
        employees={employeesResult.data ?? []}
        availablePasting={availablePastingResult.data ?? []}
        filters={filters}
      />
    </div>
  )
}
