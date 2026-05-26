"use client"

import { FlaskConical, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import type { EmployeeWithSector } from "@/types/employee"
import type {
  OxideMillDailySummary,
  OxideMillProductionWithRelations
} from "@/types/oxide-mill-production"
import type { Shift } from "@/types/shift"

import { OxideMillProductionCharts } from "./oxide-mill-production-charts"
import { OxideMillProductionModal } from "./oxide-mill-production-modal"
import { OxideMillProductionTable } from "./oxide-mill-production-table"

export type OxideMillProductionManagerProps = {
  initialRecords: OxideMillProductionWithRelations[]
  dailySummary: OxideMillDailySummary[]
  shifts: Shift[]
  employees: EmployeeWithSector[]
  filters: {
    dateFrom: string
    dateTo: string
    shiftId: string
  }
}

export function OxideMillProductionManager({
  initialRecords,
  dailySummary,
  shifts,
  employees,
  filters
}: OxideMillProductionManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<
    OxideMillProductionWithRelations | undefined
  >()

  const canCreate = shifts.length > 0 && employees.length > 0

  function handleRefresh() {
    router.refresh()
  }

  function openCreate() {
    if (!canCreate) {
      toast.error(
        "Cadastre turnos e funcionários em Configurações antes de registrar produção."
      )
      return
    }

    setEditingRecord(undefined)
    setModalOpen(true)
  }

  function openEdit(record: OxideMillProductionWithRelations) {
    setEditingRecord(record)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingRecord(undefined)
  }

  const hasRecords = initialRecords.length > 0

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          type="button"
          onClick={openCreate}
          icon={Plus}
          disabled={!canCreate}
        >
          Novo apontamento
        </Button>
      </div>

      <OxideMillProductionCharts
        records={initialRecords}
        dailySummary={dailySummary}
      />

      {hasRecords ? (
        <OxideMillProductionTable
          data={initialRecords}
          shifts={shifts}
          filters={filters}
          onEdit={openEdit}
        />
      ) : (
        <EmptyState
          icon={FlaskConical}
          title="Nenhum apontamento no período"
          description={
            canCreate
              ? "Registre a produção de óxido no moinho."
              : "Cadastre turnos e funcionários em Configurações antes de registrar apontamentos."
          }
          action={
            canCreate ? (
              <Button type="button" onClick={openCreate} icon={Plus}>
                Novo apontamento
              </Button>
            ) : undefined
          }
        />
      )}

      <OxideMillProductionModal
        open={modalOpen}
        record={editingRecord}
        shifts={shifts}
        employees={employees}
        onClose={closeModal}
        onSuccess={handleRefresh}
      />
    </>
  )
}
