import { format, subDays } from "date-fns"

import { FormationRecordManager } from "@/components/features/formation-records/formation-record-manager"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { EmployeeService } from "@/services/employee-service"
import { FormationRecordService } from "@/services/formation-record-service"
import {
  FORMATION_STATUSES,
  type FormationStatus
} from "@/types/formation-record"

export const dynamic = "force-dynamic"

type FormacaoPageProps = {
  searchParams: Promise<{
    dateFrom?: string
    dateTo?: string
    status?: string
    operatorId?: string
  }>
}

function parseStatus(value: string | undefined): FormationStatus | undefined {
  if (!value) {
    return undefined
  }

  return FORMATION_STATUSES.includes(value as FormationStatus)
    ? (value as FormationStatus)
    : undefined
}

export default async function FormacaoPage({
  searchParams
}: FormacaoPageProps) {
  const params = await searchParams
  const today = format(new Date(), "yyyy-MM-dd")
  const defaultDateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd")

  const filters = {
    dateFrom: params.dateFrom ?? defaultDateFrom,
    dateTo: params.dateTo ?? today,
    status: params.status ?? "",
    operatorId: params.operatorId ?? ""
  }

  const listFilters = {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    status: parseStatus(filters.status || undefined),
    operatorId: filters.operatorId || undefined
  }

  const formationService = new FormationRecordService()
  const employeeService = new EmployeeService()

  const [recordsResult, employeesResult, batteryLotsResult] = await Promise.all(
    [
      formationService.list(listFilters),
      employeeService.list(),
      formationService.listBatteryLotCodes()
    ]
  )

  if (!recordsResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Formação"
          description="Registro master-detail de formação com linhas dinâmicas e histórico."
        />
        <ErrorState message={recordsResult.message} />
      </div>
    )
  }

  if (!employeesResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Formação"
          description="Registro master-detail de formação com linhas dinâmicas e histórico."
        />
        <ErrorState message={employeesResult.message} />
      </div>
    )
  }

  if (!batteryLotsResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Formação"
          description="Registro master-detail de formação com linhas dinâmicas e histórico."
        />
        <ErrorState message={batteryLotsResult.message} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Formação"
        description="Registro master-detail de formação com linhas dinâmicas e histórico."
      />

      <FormationRecordManager
        initialRecords={recordsResult.data ?? []}
        employees={employeesResult.data ?? []}
        batteryLotCodes={batteryLotsResult.data ?? []}
        filters={filters}
      />
    </div>
  )
}
