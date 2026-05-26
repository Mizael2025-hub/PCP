"use client"

import { Modal } from "@/components/ui/modal"
import type { EmployeeWithSector } from "@/types/employee"
import type { SandingScrapWithRelations } from "@/types/sanding-scrap"

import { SandingScrapForm } from "./sanding-scrap-form"

export type SandingScrapModalProps = {
  open: boolean
  record?: SandingScrapWithRelations
  employees: EmployeeWithSector[]
  onClose: () => void
  onSuccess: () => void
}

export function SandingScrapModal({
  open,
  record,
  employees,
  onClose,
  onSuccess
}: SandingScrapModalProps) {
  const isEditing = Boolean(record)

  function handleSuccess() {
    onSuccess()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar apontamento" : "Novo refugo"}
    >
      <SandingScrapForm
        record={record}
        employees={employees}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
