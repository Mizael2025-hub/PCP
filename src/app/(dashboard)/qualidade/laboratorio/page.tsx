import { format, subDays } from "date-fns"

import { LabQualityControlManager } from "@/components/features/lab-quality-control/lab-quality-control-manager"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { LabQualityControlService } from "@/services/lab-quality-control-service"
import { LAB_QC_STATUSES, type LabQcStatus } from "@/types/lab-quality-control"

export const dynamic = "force-dynamic"

type LaboratorioPageProps = {
  searchParams: Promise<{
    dateFrom?: string
    dateTo?: string
    status?: string
  }>
}

function parseStatus(value: string | undefined): LabQcStatus | undefined {
  if (!value) {
    return undefined
  }

  return LAB_QC_STATUSES.includes(value as LabQcStatus)
    ? (value as LabQcStatus)
    : undefined
}

export default async function LaboratorioPage({
  searchParams
}: LaboratorioPageProps) {
  const params = await searchParams
  const today = format(new Date(), "yyyy-MM-dd")
  const defaultDateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd")
  const sampleDateFrom = format(subDays(new Date(), 90), "yyyy-MM-dd")

  const filters = {
    dateFrom: params.dateFrom ?? defaultDateFrom,
    dateTo: params.dateTo ?? today,
    status: params.status ?? ""
  }

  const listFilters = {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    status: parseStatus(filters.status || undefined)
  }

  const labService = new LabQualityControlService()

  const recordsResult = await labService.list(listFilters)
  const records = recordsResult.success ? (recordsResult.data ?? []) : []
  const linkedSourceIds = records.map((record) => record.source_id)

  const samplesResult = recordsResult.success
    ? await labService.listFormSamples(sampleDateFrom, linkedSourceIds)
    : { success: false as const, message: recordsResult.message }

  if (!recordsResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Laboratório"
          description="Controle de qualidade: ácido, densidade, temperatura e status."
        />
        <ErrorState message={recordsResult.message} />
      </div>
    )
  }

  if (!samplesResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Laboratório"
          description="Controle de qualidade: ácido, densidade, temperatura e status."
        />
        <ErrorState message={samplesResult.message} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Laboratório"
        description="Controle de qualidade: ácido, densidade, temperatura e status."
      />

      <LabQualityControlManager
        initialRecords={records}
        samples={samplesResult.data ?? []}
        filters={filters}
      />
    </div>
  )
}
