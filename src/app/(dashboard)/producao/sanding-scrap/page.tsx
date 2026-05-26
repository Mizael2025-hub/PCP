import { format, subDays } from "date-fns"

import { SandingScrapManager } from "@/components/features/sanding-scrap/sanding-scrap-manager"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { EmployeeService } from "@/services/employee-service"
import { SandingScrapService } from "@/services/sanding-scrap-service"

export const dynamic = "force-dynamic"

type SandingScrapPageProps = {
  searchParams: Promise<{
    dateFrom?: string
    dateTo?: string
    operatorId?: string
  }>
}

export default async function SandingScrapPage({
  searchParams
}: SandingScrapPageProps) {
  const params = await searchParams
  const today = format(new Date(), "yyyy-MM-dd")
  const defaultDateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd")

  const filters = {
    dateFrom: params.dateFrom ?? defaultDateFrom,
    dateTo: params.dateTo ?? today,
    operatorId: params.operatorId ?? ""
  }

  const listFilters = {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    operatorId: filters.operatorId || undefined
  }

  const sandingScrapService = new SandingScrapService()
  const employeeService = new EmployeeService()

  const [recordsResult, employeesResult] = await Promise.all([
    sandingScrapService.list(listFilters),
    employeeService.list()
  ])

  if (!recordsResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Lixação"
          description="Refugo de lixação com peso, placas perdidas, histórico e gráficos."
        />
        <ErrorState message={recordsResult.message} />
      </div>
    )
  }

  if (!employeesResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Lixação"
          description="Refugo de lixação com peso, placas perdidas, histórico e gráficos."
        />
        <ErrorState message={employeesResult.message} />
      </div>
    )
  }

  const records = recordsResult.data ?? []
  const dailySummary = sandingScrapService.buildDailySummary(records)
  const operatorSummary = sandingScrapService.buildOperatorSummary(records)

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Lixação"
        description="Refugo de lixação com peso, placas perdidas, histórico e gráficos."
      />

      <SandingScrapManager
        initialRecords={records}
        dailySummary={dailySummary}
        operatorSummary={operatorSummary}
        employees={employeesResult.data ?? []}
        filters={filters}
      />
    </div>
  )
}
