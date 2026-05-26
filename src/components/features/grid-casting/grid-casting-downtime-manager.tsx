"use client"

import { AlertTriangle, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import type { GridCastingProductionWithRelations } from "@/types/grid-casting"
import type { GridCastingDowntimeWithProduction } from "@/types/grid-casting-downtime"
import type { Shift } from "@/types/shift"

import { GridCastingDowntimeModal } from "./grid-casting-downtime-modal"
import { GridCastingDowntimeTable } from "./grid-casting-downtime-table"

export type GridCastingDowntimeManagerProps = {
  initialRecords: GridCastingDowntimeWithProduction[]
  productions: GridCastingProductionWithRelations[]
  shifts: Shift[]
  filters: {
    dateFrom: string
    dateTo: string
    shiftId: string
    productionId: string
  }
}

export function GridCastingDowntimeManager({
  initialRecords,
  productions,
  shifts,
  filters
}: GridCastingDowntimeManagerProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<
    GridCastingDowntimeWithProduction | undefined
  >()

  const canCreate = productions.length > 0

  function handleRefresh() {
    router.refresh()
  }

  function openCreate() {
    if (!canCreate) {
      toast.error(
        "Registre apontamentos de produção no período filtrado antes de lançar paradas."
      )
      return
    }

    setEditingRecord(undefined)
    setModalOpen(true)
  }

  function openEdit(record: GridCastingDowntimeWithProduction) {
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
          Nova parada
        </Button>
      </div>

      {hasRecords ? (
        <GridCastingDowntimeTable
          data={initialRecords}
          productions={productions}
          shifts={shifts}
          filters={filters}
          onEdit={openEdit}
        />
      ) : (
        <EmptyState
          icon={AlertTriangle}
          title="Nenhuma parada no período"
          description={
            canCreate
              ? "Registre paradas de máquina vinculadas aos apontamentos de produção."
              : "Registre apontamentos de produção no período antes de lançar paradas."
          }
          action={
            canCreate ? (
              <Button type="button" onClick={openCreate} icon={Plus}>
                Nova parada
              </Button>
            ) : undefined
          }
        />
      )}

      <GridCastingDowntimeModal
        open={modalOpen}
        record={editingRecord}
        productions={productions}
        onClose={closeModal}
        onSuccess={handleRefresh}
      />
    </>
  )
}
