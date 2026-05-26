"use client"

import { Grid3X3, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import type { BatteryModel } from "@/types/battery-model"
import type { EmployeeWithSector } from "@/types/employee"
import type { GridCastingProductionWithRelations } from "@/types/grid-casting"
import type { LeadAlloy } from "@/types/lead-alloy"
import type { MachineWithSector } from "@/types/machine"
import type { Sector } from "@/types/sector"
import type { Shift } from "@/types/shift"

import { GridCastingModal } from "./grid-casting-modal"
import { GridCastingTable } from "./grid-casting-table"

export type GridCastingManagerProps = {
  initialRecords: GridCastingProductionWithRelations[]
  sectors: Sector[]
  shifts: Shift[]
  machines: MachineWithSector[]
  employees: EmployeeWithSector[]
  alloys: LeadAlloy[]
  batteryModels: BatteryModel[]
  filters: {
    dateFrom: string
    dateTo: string
    shiftId: string
  }
}

export function GridCastingManager({
  initialRecords,
  sectors,
  shifts,
  machines,
  employees,
  alloys,
  batteryModels,
  filters
}: GridCastingManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<
    GridCastingProductionWithRelations | undefined
  >()

  const canCreate =
    sectors.length > 0 &&
    shifts.length > 0 &&
    machines.length > 0 &&
    employees.length > 0 &&
    alloys.length > 0 &&
    batteryModels.length > 0

  function handleRefresh() {
    router.refresh()
  }

  function openCreate() {
    if (!canCreate) {
      toast.error(
        "Complete os cadastros base (setores, turnos, máquinas, funcionários, ligas e modelos) antes de registrar apontamentos."
      )
      return
    }

    setEditingRecord(undefined)
    setModalOpen(true)
  }

  function openEdit(record: GridCastingProductionWithRelations) {
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
        <GridCastingTable
          data={initialRecords}
          shifts={shifts}
          filters={filters}
          onEdit={openEdit}
        />
      ) : (
        <EmptyState
          icon={Grid3X3}
          title="Nenhum apontamento no período"
          description={
            canCreate
              ? "Registre a produção da fundidora de grades para o turno selecionado."
              : "Complete os cadastros em Configurações antes de registrar apontamentos."
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

      <GridCastingModal
        open={modalOpen}
        record={editingRecord}
        sectors={sectors}
        shifts={shifts}
        machines={machines}
        employees={employees}
        alloys={alloys}
        batteryModels={batteryModels}
        onClose={closeModal}
        onSuccess={handleRefresh}
      />
    </>
  )
}
