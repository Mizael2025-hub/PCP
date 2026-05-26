"use client"

import { BatteryCharging, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import type { EmployeeWithSector } from "@/types/employee"
import type { FormationRecordWithRelations } from "@/types/formation-record"

import { FormationRecordModal } from "./formation-record-modal"
import { FormationRecordTable } from "./formation-record-table"

export type FormationRecordManagerProps = {
  initialRecords: FormationRecordWithRelations[]
  employees: EmployeeWithSector[]
  batteryLotCodes: string[]
  filters: {
    dateFrom: string
    dateTo: string
    status: string
    operatorId: string
  }
}

export function FormationRecordManager({
  initialRecords,
  employees,
  batteryLotCodes,
  filters
}: FormationRecordManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<
    FormationRecordWithRelations | undefined
  >()

  const canCreate = employees.length > 0 && batteryLotCodes.length > 0

  function handleRefresh() {
    router.refresh()
  }

  function openCreate() {
    if (!canCreate) {
      toast.error(
        "Cadastre funcionários e montagens com lote de bateria antes de registrar formações."
      )
      return
    }

    setEditingRecord(undefined)
    setModalOpen(true)
  }

  function openEdit(record: FormationRecordWithRelations) {
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
          Nova formação
        </Button>
      </div>

      {hasRecords ? (
        <FormationRecordTable
          data={initialRecords}
          employees={employees}
          filters={filters}
          onEdit={openEdit}
        />
      ) : (
        <EmptyState
          icon={BatteryCharging}
          title="Nenhuma formação no período"
          description={
            canCreate
              ? "Registre o cabeçalho e as linhas de circuitos com medições elétricas."
              : "Cadastre funcionários e montagens com lote de bateria antes de registrar formações."
          }
          action={
            canCreate ? (
              <Button type="button" onClick={openCreate} icon={Plus}>
                Nova formação
              </Button>
            ) : undefined
          }
        />
      )}

      <FormationRecordModal
        open={modalOpen}
        record={editingRecord}
        employees={employees}
        batteryLotCodes={batteryLotCodes}
        onClose={closeModal}
        onSuccess={handleRefresh}
      />
    </>
  )
}
