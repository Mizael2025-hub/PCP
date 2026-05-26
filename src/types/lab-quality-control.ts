import type { Database } from "@/lib/supabase/database.types"

export type LabQualityControl =
  Database["public"]["Tables"]["lab_quality_control"]["Row"]

export type LabQualityControlInsert =
  Database["public"]["Tables"]["lab_quality_control"]["Insert"]

export type LabQualityControlUpdate =
  Database["public"]["Tables"]["lab_quality_control"]["Update"]

export const LAB_QC_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const

export type LabQcStatus = (typeof LAB_QC_STATUSES)[number]

export type LabQcTechnicianRef = {
  id: string
  full_name: string
}

export type LabQcSampleRef = {
  id: string
  batch_number: string
  date: string
}

export type LabQualityControlWithRelations = LabQualityControl & {
  technician: LabQcTechnicianRef | null
  sample: LabQcSampleRef | null
}

export type LabQualityControlListFilters = {
  dateFrom?: string
  dateTo?: string
  status?: LabQcStatus
}
