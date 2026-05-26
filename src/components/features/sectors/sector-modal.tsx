"use client"

import { Modal } from "@/components/ui/modal"
import type { Sector } from "@/types/sector"

import { SectorForm } from "./sector-form"

export type SectorModalProps = {
  open: boolean
  sector?: Sector
  onClose: () => void
  onSuccess: () => void
}

export function SectorModal({
  open,
  sector,
  onClose,
  onSuccess
}: SectorModalProps) {
  const isEditing = Boolean(sector)

  function handleSuccess() {
    onSuccess()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar setor" : "Novo setor"}
    >
      <SectorForm
        sector={sector}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}
