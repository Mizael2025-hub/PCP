"use client"

import { CircleDot, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import type { EmployeeWithSector } from "@/types/employee"
import type { LeadBallProductionWithRelations } from "@/types/lead-ball-production"
import type { Shift } from "@/types/shift"

import { LeadBallProductionModal } from "./lead-ball-production-modal"
import { LeadBallProductionTable } from "./lead-ball-production-table"

export type LeadBallProductionManagerProps = {
  initialRecords: LeadBallProductionWithRelations[]
  shifts: Shift[]
  employees: EmployeeWithSector[]
  filters: {
    dateFrom: string
    dateTo: string
    shiftId: string
    siloNumber: string
  }
}

export function LeadBallProductionManager({
  initialRecords,
  shifts,
  employees,
  filters
}: LeadBallProductionManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<
    LeadBallProductionWithRelations | undefined
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

  function openEdit(record: LeadBallProductionWithRelations) {
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

      {hasRecords ? (
        <LeadBallProductionTable
          data={initialRecords}
          shifts={shifts}
          filters={filters}
          onEdit={openEdit}
        />
      ) : (
        <EmptyState
          icon={CircleDot}
          title="Nenhum apontamento no período"
          description={
            canCreate
              ? "Registre a produção de bola de chumbo na boleira."
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

      <LeadBallProductionModal
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
