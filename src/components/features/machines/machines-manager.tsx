"use client"

import { Cog, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { deleteMachineAction } from "@/actions/machine-actions"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Modal } from "@/components/ui/modal"
import { toastFromActionResponse } from "@/lib/utils/toast-action"
import type { MachineWithSector } from "@/types/machine"
import type { Sector } from "@/types/sector"

import { MachineModal } from "./machine-modal"
import { MachinesTable } from "./machines-table"

export type MachinesManagerProps = {
  initialMachines: MachineWithSector[]
  sectors: Sector[]
}

export function MachinesManager({
  initialMachines,
  sectors
}: MachinesManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMachine, setEditingMachine] = useState<
    MachineWithSector | undefined
  >()
  const [deletingMachine, setDeletingMachine] =
    useState<MachineWithSector | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const canCreate = sectors.length > 0

  function handleRefresh() {
    router.refresh()
  }

  function openCreate() {
    if (!canCreate) {
      toast.error("Cadastre um setor antes de criar máquinas.")
      return
    }

    setEditingMachine(undefined)
    setModalOpen(true)
  }

  function openEdit(machine: MachineWithSector) {
    setEditingMachine(machine)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingMachine(undefined)
  }

  function openDeleteConfirm(machine: MachineWithSector) {
    setDeletingMachine(machine)
  }

  function closeDeleteConfirm() {
    setDeletingMachine(null)
  }

  async function confirmDelete() {
    if (!deletingMachine) {
      return
    }

    setDeletingId(deletingMachine.id)

    try {
      const result = await deleteMachineAction(deletingMachine.id)

      const ok = toastFromActionResponse(result, {
        successFallback: "Máquina desativada com sucesso.",
        errorFallback: "Erro ao excluir máquina."
      })
      if (!ok) return

      closeDeleteConfirm()
      handleRefresh()
    } catch (error) {
      console.error("[MachinesManager.confirmDelete]", error)
      toast.error("Erro interno.")
    } finally {
      setDeletingId(null)
    }
  }

  const hasMachines = initialMachines.length > 0

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          type="button"
          onClick={openCreate}
          icon={Plus}
          disabled={!canCreate}
        >
          Nova máquina
        </Button>
      </div>

      {hasMachines ? (
        <MachinesTable
          data={initialMachines}
          sectors={sectors}
          onEdit={openEdit}
          onDelete={openDeleteConfirm}
          deletingId={deletingId}
        />
      ) : (
        <EmptyState
          icon={Cog}
          title="Nenhuma máquina cadastrada"
          description={
            canCreate
              ? "Cadastre equipamentos vinculados aos setores da planta."
              : "Cadastre ao menos um setor antes de criar máquinas."
          }
          action={
            canCreate ? (
              <Button type="button" onClick={openCreate} icon={Plus}>
                Nova máquina
              </Button>
            ) : undefined
          }
        />
      )}

      <MachineModal
        open={modalOpen}
        machine={editingMachine}
        sectors={sectors}
        onClose={closeModal}
        onSuccess={handleRefresh}
      />

      <Modal
        open={Boolean(deletingMachine)}
        onClose={closeDeleteConfirm}
        title="Excluir máquina"
      >
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Tem certeza que deseja excluir{" "}
          <strong className="text-zinc-900 dark:text-zinc-100">
            {deletingMachine?.name}
          </strong>
          ? O registro será desativado e não aparecerá mais na listagem.
        </p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={closeDeleteConfirm}
            disabled={deletingId !== null}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={confirmDelete}
            isLoading={deletingId !== null}
          >
            Excluir
          </Button>
        </div>
      </Modal>
    </>
  )
}
