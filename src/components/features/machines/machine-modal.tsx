"use client"

import { Modal } from "@/components/ui/modal"
import type { MachineWithSector } from "@/types/machine"
import type { Sector } from "@/types/sector"

import { MachineForm } from "./machine-form"

export type MachineModalProps = {
  open: boolean
  machine?: MachineWithSector
  sectors: Sector[]
  onClose: () => void
  onSuccess: () => void
}

export function MachineModal({
  open,
  machine,
  sectors,
  onClose,
  onSuccess
}: MachineModalProps) {
  const isEditing = Boolean(machine)

  function handleSuccess() {
    onSuccess()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar máquina" : "Nova máquina"}
    >
      <MachineForm
        machine={machine}
        sectors={sectors}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
