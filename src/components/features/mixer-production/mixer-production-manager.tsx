"use client"

import { Blend, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import type { EmployeeWithSector } from "@/types/employee"
import type { MixerProductionWithRelations } from "@/types/mixer-production"
import type { Shift } from "@/types/shift"

import { MixerProductionModal } from "./mixer-production-modal"
import { MixerProductionTable } from "./mixer-production-table"

export type MixerProductionManagerProps = {
  initialRecords: MixerProductionWithRelations[]
  shifts: Shift[]
  employees: EmployeeWithSector[]
  filters: {
    dateFrom: string
    dateTo: string
    shiftId: string
    batchNumber: string
  }
}

export function MixerProductionManager({
  initialRecords,
  shifts,
  employees,
  filters
}: MixerProductionManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<
    MixerProductionWithRelations | undefined
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

  function openEdit(record: MixerProductionWithRelations) {
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
        <MixerProductionTable
          data={initialRecords}
          shifts={shifts}
          filters={filters}
          onEdit={openEdit}
        />
      ) : (
        <EmptyState
          icon={Blend}
          title="Nenhum apontamento no período"
          description={
            canCreate
              ? "Registre a produção de massa no misturador."
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

      <MixerProductionModal
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
