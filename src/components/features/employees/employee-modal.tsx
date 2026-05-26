"use client"

import { Modal } from "@/components/ui/modal"
import type { EmployeeWithSector } from "@/types/employee"
import type { Sector } from "@/types/sector"

import { EmployeeForm } from "./employee-form"

export type EmployeeModalProps = {
  open: boolean
  employee?: EmployeeWithSector
  sectors: Sector[]
  onClose: () => void
  onSuccess: () => void
}

export function EmployeeModal({
  open,
  employee,
  sectors,
  onClose,
  onSuccess
}: EmployeeModalProps) {
  const isEditing = Boolean(employee)

  function handleSuccess() {
    onSuccess()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar funcionário" : "Novo funcionário"}
    >
      <EmployeeForm
        employee={employee}
        sectors={sectors}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
