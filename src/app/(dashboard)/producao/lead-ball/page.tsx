import { format, subDays } from "date-fns"

import { LeadBallProductionManager } from "@/components/features/lead-ball-production/lead-ball-production-manager"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { EmployeeService } from "@/services/employee-service"
import { LeadBallProductionService } from "@/services/lead-ball-production-service"
import { ShiftService } from "@/services/shift-service"

export const dynamic = "force-dynamic"

type LeadBallPageProps = {
  searchParams: Promise<{
    dateFrom?: string
    dateTo?: string
    shiftId?: string
    siloNumber?: string
  }>
}

function parseSiloNumber(value?: string): number | undefined {
  if (!value) {
    return undefined
  }

  const parsed = Number.parseInt(value, 10)

  if (Number.isNaN(parsed) || parsed <= 0) {
    return undefined
  }

  return parsed
}

export default async function LeadBallPage({
  searchParams
}: LeadBallPageProps) {
  const params = await searchParams
  const today = format(new Date(), "yyyy-MM-dd")
  const defaultDateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd")

  const filters = {
    dateFrom: params.dateFrom ?? defaultDateFrom,
    dateTo: params.dateTo ?? today,
    shiftId: params.shiftId ?? "",
    siloNumber: params.siloNumber ?? ""
  }

  const listFilters = {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    shiftId: filters.shiftId || undefined,
    siloNumber: parseSiloNumber(filters.siloNumber)
  }

  const leadBallService = new LeadBallProductionService()
  const shiftService = new ShiftService()
  const employeeService = new EmployeeService()

  const [recordsResult, shiftsResult, employeesResult] = await Promise.all([
    leadBallService.list(listFilters),
    shiftService.list(),
    employeeService.list()
  ])

  if (!recordsResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Boleira"
          description="Produção de bola de chumbo por silo e turno."
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
          title="Boleira"
          description="Produção de bola de chumbo por silo e turno."
        />
        <ErrorState message={masterDataError} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Boleira"
        description="Produção de bola de chumbo por silo e turno."
      />

      <LeadBallProductionManager
        initialRecords={recordsResult.data ?? []}
        shifts={shiftsResult.data ?? []}
        employees={employeesResult.data ?? []}
        filters={filters}
      />
    </div>
  )
}
