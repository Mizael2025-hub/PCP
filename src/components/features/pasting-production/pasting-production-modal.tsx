"use client"

import { Modal } from "@/components/ui/modal"
import type { BatteryModel } from "@/types/battery-model"
import type { EmployeeWithSector } from "@/types/employee"
import type { MachineWithSector } from "@/types/machine"
import type { PastingProductionWithRelations } from "@/types/pasting-production"
import type { Sector } from "@/types/sector"
import type { Shift } from "@/types/shift"

import { PastingProductionForm } from "./pasting-production-form"

export type PastingProductionModalProps = {
  open: boolean
  record?: PastingProductionWithRelations
  sectors: Sector[]
  shifts: Shift[]
  machines: MachineWithSector[]
  employees: EmployeeWithSector[]
  batteryModels: BatteryModel[]
  onClose: () => void
  onSuccess: () => void
}

export function PastingProductionModal({
  open,
  record,
  sectors,
  shifts,
  machines,
  employees,
  batteryModels,
  onClose,
  onSuccess
}: PastingProductionModalProps) {
  const isEditing = Boolean(record)

  function handleSuccess() {
    onSuccess()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar apontamento" : "Nova produção"}
    >
      <PastingProductionForm
        record={record}
        sectors={sectors}
        shifts={shifts}
        machines={machines}
        employees={employees}
        batteryModels={batteryModels}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
