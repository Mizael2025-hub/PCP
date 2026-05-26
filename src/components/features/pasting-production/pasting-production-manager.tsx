"use client"

import { Layers, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import type { BatteryModel } from "@/types/battery-model"
import type { EmployeeWithSector } from "@/types/employee"
import type { MachineWithSector } from "@/types/machine"
import type { PastingProductionWithRelations } from "@/types/pasting-production"
import type { Sector } from "@/types/sector"
import type { Shift } from "@/types/shift"

import { PastingProductionModal } from "./pasting-production-modal"
import { PastingProductionTable } from "./pasting-production-table"

export type PastingProductionManagerProps = {
  initialRecords: PastingProductionWithRelations[]
  sectors: Sector[]
  shifts: Shift[]
  machines: MachineWithSector[]
  employees: EmployeeWithSector[]
  batteryModels: BatteryModel[]
  filters: {
    dateFrom: string
    dateTo: string
    shiftId: string
    epCode: string
    batteryModelId: string
  }
}

export function PastingProductionManager({
  initialRecords,
  sectors,
  shifts,
  machines,
  employees,
  batteryModels,
  filters
}: PastingProductionManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<
    PastingProductionWithRelations | undefined
  >()

  const canCreate =
    sectors.length > 0 &&
    shifts.length > 0 &&
    machines.length > 0 &&
    employees.length > 0 &&
    batteryModels.length > 0

  function handleRefresh() {
    router.refresh()
  }

  function openCreate() {
    if (!canCreate) {
      toast.error(
        "Cadastre setores, turnos, máquinas, funcionários e modelos em Configurações antes de registrar produção."
      )
      return
    }

    setEditingRecord(undefined)
    setModalOpen(true)
  }

  function openEdit(record: PastingProductionWithRelations) {
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
        <PastingProductionTable
          data={initialRecords}
          shifts={shifts}
          batteryModels={batteryModels}
          filters={filters}
          onEdit={openEdit}
        />
      ) : (
        <EmptyState
          icon={Layers}
          title="Nenhum apontamento no período"
          description={
            canCreate
              ? "Registre a produção na empastadeira. O EP Code será gerado automaticamente."
              : "Cadastre os dados mestres em Configurações antes de registrar apontamentos."
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

      <PastingProductionModal
        open={modalOpen}
        record={editingRecord}
        sectors={sectors}
        shifts={shifts}
        machines={machines}
        employees={employees}
        batteryModels={batteryModels}
        onClose={closeModal}
        onSuccess={handleRefresh}
      />
    </>
  )
}
