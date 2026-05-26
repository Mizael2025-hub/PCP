"use client"

import { FlaskConical, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import type { MixerProduction } from "@/types/mixer-production"
import type { LabQualityControlWithRelations } from "@/types/lab-quality-control"

import { LabQualityControlModal } from "./lab-quality-control-modal"
import { LabQualityControlTable } from "./lab-quality-control-table"

export type LabQualityControlManagerProps = {
  initialRecords: LabQualityControlWithRelations[]
  samples: MixerProduction[]
  filters: {
    dateFrom: string
    dateTo: string
    status: string
  }
}

export function LabQualityControlManager({
  initialRecords,
  samples,
  filters
}: LabQualityControlManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<
    LabQualityControlWithRelations | undefined
  >()

  const canCreate = samples.length > 0

  function handleRefresh() {
    router.refresh()
  }

  function openCreate() {
    if (!canCreate) {
      toast.error(
        "Cadastre apontamentos no misturador antes de registrar análises."
      )
      return
    }

    setEditingRecord(undefined)
    setModalOpen(true)
  }

  function openEdit(record: LabQualityControlWithRelations) {
    setEditingRecord(record)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingRecord(undefined)
  }

  const hasRecords = initialRecords.length > 0

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          type="button"
          onClick={openCreate}
          icon={Plus}
          disabled={!canCreate}
        >
          Nova análise
        </Button>
      </div>

      {hasRecords ? (
        <LabQualityControlTable
          data={initialRecords}
          filters={filters}
          onEdit={openEdit}
        />
      ) : (
        <EmptyState
          icon={FlaskConical}
          title="Nenhuma análise no período"
          description={
            canCreate
              ? "Registre concentração de ácido, densidade e temperatura das amostras."
              : "Cadastre apontamentos no misturador antes de registrar análises."
          }
          action={
            canCreate ? (
              <Button type="button" onClick={openCreate} icon={Plus}>
                Nova análise
              </Button>
            ) : undefined
          }
        />
      )}

      <LabQualityControlModal
        open={modalOpen}
        record={editingRecord}
        samples={samples}
        onClose={closeModal}
        onSuccess={handleRefresh}
      />
    </>
  )
}
