"use client"

import { Modal } from "@/components/ui/modal"
import type { BatteryModel } from "@/types/battery-model"
import type { EmployeeWithSector } from "@/types/employee"
import type { GridCastingProductionWithRelations } from "@/types/grid-casting"
import type { LeadAlloy } from "@/types/lead-alloy"
import type { MachineWithSector } from "@/types/machine"
import type { Sector } from "@/types/sector"
import type { Shift } from "@/types/shift"

import { GridCastingForm } from "./grid-casting-form"

export type GridCastingModalProps = {
  open: boolean
  record?: GridCastingProductionWithRelations
  sectors: Sector[]
  shifts: Shift[]
  machines: MachineWithSector[]
  employees: EmployeeWithSector[]
  alloys: LeadAlloy[]
  batteryModels: BatteryModel[]
  onClose: () => void
  onSuccess: () => void
}

export function GridCastingModal({
  open,
  record,
  sectors,
  shifts,
  machines,
  employees,
  alloys,
  batteryModels,
  onClose,
  onSuccess
}: GridCastingModalProps) {
  const isEditing = Boolean(record)

  function handleSuccess() {
    onSuccess()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar apontamento" : "Novo apontamento"}
    >
      <GridCastingForm
        record={record}
        sectors={sectors}
        shifts={shifts}
        machines={machines}
        employees={employees}
        alloys={alloys}
        batteryModels={batteryModels}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
