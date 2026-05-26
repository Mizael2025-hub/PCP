"use client"

import { Battery, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { deleteBatteryModelAction } from "@/actions/battery-model-actions"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Modal } from "@/components/ui/modal"
import type { BatteryModel } from "@/types/battery-model"

import { BatteryModelModal } from "./battery-model-modal"
import { BatteryModelsTable } from "./battery-models-table"

export type BatteryModelsManagerProps = {
  initialBatteryModels: BatteryModel[]
}

export function BatteryModelsManager({
  initialBatteryModels
}: BatteryModelsManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBatteryModel, setEditingBatteryModel] = useState<
    BatteryModel | undefined
  >()
  const [deletingBatteryModel, setDeletingBatteryModel] =
    useState<BatteryModel | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleRefresh() {
    router.refresh()
  }

  function openCreate() {
    setEditingBatteryModel(undefined)
    setModalOpen(true)
  }

  function openEdit(batteryModel: BatteryModel) {
    setEditingBatteryModel(batteryModel)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingBatteryModel(undefined)
  }

  function openDeleteConfirm(batteryModel: BatteryModel) {
    setDeletingBatteryModel(batteryModel)
  }

  function closeDeleteConfirm() {
    setDeletingBatteryModel(null)
  }

  async function confirmDelete() {
    if (!deletingBatteryModel) {
      return
    }

    setDeletingId(deletingBatteryModel.id)

    try {
      const result = await deleteBatteryModelAction(deletingBatteryModel.id)

      if (!result.success) {
        toast.error(result.message ?? "Erro ao excluir modelo de bateria.")
        return
      }

      toast.success(result.message ?? "Modelo de bateria excluído com sucesso.")
      closeDeleteConfirm()
      handleRefresh()
    } catch (error) {
      console.error("[BatteryModelsManager.confirmDelete]", error)
      toast.error("Erro interno.")
    } finally {
      setDeletingId(null)
    }
  }

  const hasBatteryModels = initialBatteryModels.length > 0

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button type="button" onClick={openCreate} icon={Plus}>
          Novo modelo
        </Button>
      </div>

      {hasBatteryModels ? (
        <BatteryModelsTable
          data={initialBatteryModels}
          onEdit={openEdit}
          onDelete={openDeleteConfirm}
          deletingId={deletingId}
        />
      ) : (
        <EmptyState
          icon={Battery}
          title="Nenhum modelo de bateria cadastrado"
          description="Cadastre os modelos com código, nome e peso nominal de referência."
          action={
            <Button type="button" onClick={openCreate} icon={Plus}>
              Novo modelo
            </Button>
          }
        />
      )}

      <BatteryModelModal
        open={modalOpen}
        batteryModel={editingBatteryModel}
        onClose={closeModal}
        onSuccess={handleRefresh}
      />

      <Modal
        open={Boolean(deletingBatteryModel)}
        onClose={closeDeleteConfirm}
        title="Excluir modelo de bateria"
      >
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Tem certeza que deseja excluir{" "}
          <strong className="text-zinc-900 dark:text-zinc-100">
            {deletingBatteryModel?.name}
          </strong>
          ? Esta ação não pode ser desfeita.
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
