import { format, subDays } from "date-fns"

import { MixerProductionManager } from "@/components/features/mixer-production/mixer-production-manager"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { EmployeeService } from "@/services/employee-service"
import { MixerProductionService } from "@/services/mixer-production-service"
import { ShiftService } from "@/services/shift-service"

export const dynamic = "force-dynamic"

type MixerPageProps = {
  searchParams: Promise<{
    dateFrom?: string
    dateTo?: string
    shiftId?: string
    batchNumber?: string
  }>
}

export default async function MixerPage({ searchParams }: MixerPageProps) {
  const params = await searchParams
  const today = format(new Date(), "yyyy-MM-dd")
  const defaultDateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd")

  const filters = {
    dateFrom: params.dateFrom ?? defaultDateFrom,
    dateTo: params.dateTo ?? today,
    shiftId: params.shiftId ?? "",
    batchNumber: params.batchNumber ?? ""
  }

  const listFilters = {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    shiftId: filters.shiftId || undefined,
    batchNumber: filters.batchNumber || undefined
  }

  const mixerService = new MixerProductionService()
  const shiftService = new ShiftService()
  const employeeService = new EmployeeService()

  const [recordsResult, shiftsResult, employeesResult] = await Promise.all([
    mixerService.list(listFilters),
    shiftService.list(),
    employeeService.list()
  ])

  if (!recordsResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Misturador"
          description="Produção de massa com batelada, volumes, densidade e histórico por turno."
        />
        <ErrorState message={recordsResult.message} />
      </div>
    )
  }

  const masterDataError = !shiftsResult.success
    ? shiftsResult.message
    : !employeesResult.success
      ? employeesResult.message
      : null

  if (masterDataError) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Misturador"
          description="Produção de massa com batelada, volumes, densidade e histórico por turno."
        />
        <ErrorState message={masterDataError} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Misturador"
        description="Produção de massa com batelada, volumes, densidade e histórico por turno."
      />

      <MixerProductionManager
        initialRecords={recordsResult.data ?? []}
        shifts={shiftsResult.data ?? []}
        employees={employeesResult.data ?? []}
        filters={filters}
      />
    </div>
  )
}
