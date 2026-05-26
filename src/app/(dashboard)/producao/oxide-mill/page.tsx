import { format, subDays } from "date-fns"

import { OxideMillProductionManager } from "@/components/features/oxide-mill-production/oxide-mill-production-manager"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { EmployeeService } from "@/services/employee-service"
import { OxideMillProductionService } from "@/services/oxide-mill-production-service"
import { ShiftService } from "@/services/shift-service"

export const dynamic = "force-dynamic"

type OxideMillPageProps = {
  searchParams: Promise<{
    dateFrom?: string
    dateTo?: string
    shiftId?: string
  }>
}

export default async function OxideMillPage({
  searchParams
}: OxideMillPageProps) {
  const params = await searchParams
  const today = format(new Date(), "yyyy-MM-dd")
  const defaultDateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd")

  const filters = {
    dateFrom: params.dateFrom ?? defaultDateFrom,
    dateTo: params.dateTo ?? today,
    shiftId: params.shiftId ?? ""
  }

  const listFilters = {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    shiftId: filters.shiftId || undefined
  }

  const oxideMillService = new OxideMillProductionService()
  const shiftService = new ShiftService()
  const employeeService = new EmployeeService()

  const [recordsResult, shiftsResult, employeesResult] = await Promise.all([
    oxideMillService.list(listFilters),
    shiftService.list(),
    employeeService.list()
  ])

  if (!recordsResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Moinho de Óxido"
          description="Produção de óxido com peso, grau de oxidação e histórico por turno."
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
          title="Moinho de Óxido"
          description="Produção de óxido com peso, grau de oxidação e histórico por turno."
        />
        <ErrorState message={masterDataError} />
      </div>
    )
  }

  const records = recordsResult.data ?? []
  const dailySummary = oxideMillService.buildDailySummary(records)

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Moinho de Óxido"
        description="Produção de óxido com peso, grau de oxidação e histórico por turno."
      />

      <OxideMillProductionManager
        initialRecords={records}
        dailySummary={dailySummary}
        shifts={shiftsResult.data ?? []}
        employees={employeesResult.data ?? []}
        filters={filters}
      />
    </div>
  )
}
