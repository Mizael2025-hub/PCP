"use client"

import { Modal } from "@/components/ui/modal"
import type { EmployeeWithSector } from "@/types/employee"
import type { FormationRecordWithRelations } from "@/types/formation-record"

import { FormationRecordForm } from "./formation-record-form"

export type FormationRecordModalProps = {
  open: boolean
  record?: FormationRecordWithRelations
  employees: EmployeeWithSector[]
  batteryLotCodes: string[]
  onClose: () => void
  onSuccess: () => void
}

export function FormationRecordModal({
  open,
  record,
  employees,
  batteryLotCodes,
  onClose,
  onSuccess
}: FormationRecordModalProps) {
  const isEditing = Boolean(record)

  function handleSuccess() {
    onSuccess()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar formação" : "Nova formação"}
    >
      <FormationRecordForm
        record={record}
        employees={employees}
        batteryLotCodes={batteryLotCodes}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
