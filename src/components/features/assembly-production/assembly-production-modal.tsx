"use client"

import { Modal } from "@/components/ui/modal"
import type { AssemblyProductionWithRelations } from "@/types/assembly-production"
import type { EmployeeWithSector } from "@/types/employee"
import type { MachineWithSector } from "@/types/machine"
import type { PastingProduction } from "@/types/pasting-production"
import type { Sector } from "@/types/sector"
import type { Shift } from "@/types/shift"

import { AssemblyProductionForm } from "./assembly-production-form"

export type AssemblyProductionModalProps = {
  open: boolean
  record?: AssemblyProductionWithRelations
  sectors: Sector[]
  shifts: Shift[]
  machines: MachineWithSector[]
  employees: EmployeeWithSector[]
  availablePasting: PastingProduction[]
  onClose: () => void
  onSuccess: () => void
}

export function AssemblyProductionModal({
  open,
  record,
  sectors,
  shifts,
  machines,
  employees,
  availablePasting,
  onClose,
  onSuccess
}: AssemblyProductionModalProps) {
  const isEditing = Boolean(record)

  function handleSuccess() {
    onSuccess()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar montagem" : "Nova montagem"}
    >
      <AssemblyProductionForm
        record={record}
        sectors={sectors}
        shifts={shifts}
        machines={machines}
        employees={employees}
        availablePasting={availablePasting}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
