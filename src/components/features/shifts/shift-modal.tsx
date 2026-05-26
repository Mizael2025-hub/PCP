"use client"

import { Modal } from "@/components/ui/modal"
import type { Shift } from "@/types/shift"

import { ShiftForm } from "./shift-form"

export type ShiftModalProps = {
  open: boolean
  shift?: Shift
  onClose: () => void
  onSuccess: () => void
}

export function ShiftModal({
  open,
  shift,
  onClose,
  onSuccess
}: ShiftModalProps) {
  const isEditing = Boolean(shift)

  function handleSuccess() {
    onSuccess()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar turno" : "Novo turno"}
    >
      <ShiftForm shift={shift} onSuccess={handleSuccess} onCancel={onClose} />
    </Modal>
  )
}
