"use client"

import { Modal } from "@/components/ui/modal"
import type { EmployeeWithSector } from "@/types/employee"
import type { OxideMillProductionWithRelations } from "@/types/oxide-mill-production"
import type { Shift } from "@/types/shift"

import { OxideMillProductionForm } from "./oxide-mill-production-form"

export type OxideMillProductionModalProps = {
  open: boolean
  record?: OxideMillProductionWithRelations
  shifts: Shift[]
  employees: EmployeeWithSector[]
  onClose: () => void
  onSuccess: () => void
}

export function OxideMillProductionModal({
  open,
  record,
  shifts,
  employees,
  onClose,
  onSuccess
}: OxideMillProductionModalProps) {
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
      <OxideMillProductionForm
        record={record}
        shifts={shifts}
        employees={employees}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
