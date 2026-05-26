"use client"

import { Battery, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import type { AssemblyProductionWithRelations } from "@/types/assembly-production"
import type { EmployeeWithSector } from "@/types/employee"
import type { MachineWithSector } from "@/types/machine"
import type { PastingProduction } from "@/types/pasting-production"
import type { Sector } from "@/types/sector"
import type { Shift } from "@/types/shift"

import { AssemblyProductionModal } from "./assembly-production-modal"
import { AssemblyProductionTable } from "./assembly-production-table"

export type AssemblyProductionManagerProps = {
  initialRecords: AssemblyProductionWithRelations[]
  sectors: Sector[]
  shifts: Shift[]
  machines: MachineWithSector[]
  employees: EmployeeWithSector[]
  availablePasting: PastingProduction[]
  filters: {
    dateFrom: string
    dateTo: string
    shiftId: string
    batteryLotCode: string
    epCode: string
  }
}

export function AssemblyProductionManager({
  initialRecords,
  sectors,
  shifts,
  machines,
  employees,
  availablePasting,
  filters
}: AssemblyProductionManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<
    AssemblyProductionWithRelations | undefined
  >()

  const canCreate =
    sectors.length > 0 &&
    shifts.length > 0 &&
    machines.length > 0 &&
    employees.length > 0 &&
    availablePasting.length > 0

  function handleRefresh() {
    router.refresh()
  }

  function openCreate() {
    if (!canCreate) {
      toast.error(
        "Cadastre setores, turnos, máquinas, funcionários e EP Codes na empastadeira antes de registrar montagem."
      )
      return
    }

    setEditingRecord(undefined)
    setModalOpen(true)
  }

  function openEdit(record: AssemblyProductionWithRelations) {
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
        <AssemblyProductionTable
          data={initialRecords}
          shifts={shifts}
          filters={filters}
          onEdit={openEdit}
        />
      ) : (
        <EmptyState
          icon={Battery}
          title="Nenhum apontamento no período"
          description={
            canCreate
              ? "Registre a montagem vinculando um EP Code. O lote da bateria será gerado automaticamente."
              : "Cadastre os dados mestres e produção na empastadeira antes de registrar montagem."
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

      <AssemblyProductionModal
        open={modalOpen}
        record={editingRecord}
        sectors={sectors}
        shifts={shifts}
        machines={machines}
        employees={employees}
        availablePasting={availablePasting}
        onClose={closeModal}
        onSuccess={handleRefresh}
      />
    </>
  )
}
