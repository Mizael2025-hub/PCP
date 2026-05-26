"use client"

import { Modal } from "@/components/ui/modal"
import type { EmployeeWithSector } from "@/types/employee"
import type { MixerProductionWithRelations } from "@/types/mixer-production"
import type { Shift } from "@/types/shift"

import { MixerProductionForm } from "./mixer-production-form"

export type MixerProductionModalProps = {
  open: boolean
  record?: MixerProductionWithRelations
  shifts: Shift[]
  employees: EmployeeWithSector[]
  onClose: () => void
  onSuccess: () => void
}

export function MixerProductionModal({
  open,
  record,
  shifts,
  employees,
  onClose,
  onSuccess
}: MixerProductionModalProps) {
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
      <MixerProductionForm
        record={record}
        shifts={shifts}
        employees={employees}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
