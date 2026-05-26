"use client"

import { Modal } from "@/components/ui/modal"
import type { EmployeeWithSector } from "@/types/employee"
import type { LeadBallProductionWithRelations } from "@/types/lead-ball-production"
import type { Shift } from "@/types/shift"

import { LeadBallProductionForm } from "./lead-ball-production-form"

export type LeadBallProductionModalProps = {
  open: boolean
  record?: LeadBallProductionWithRelations
  shifts: Shift[]
  employees: EmployeeWithSector[]
  onClose: () => void
  onSuccess: () => void
}

export function LeadBallProductionModal({
  open,
  record,
  shifts,
  employees,
  onClose,
  onSuccess
}: LeadBallProductionModalProps) {
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
      <LeadBallProductionForm
        record={record}
        shifts={shifts}
        employees={employees}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
