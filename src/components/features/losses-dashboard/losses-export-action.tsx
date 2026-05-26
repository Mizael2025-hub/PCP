"use client"

import { FileSpreadsheet } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  exportLossesToExcel,
  type LossesExportPayload
} from "@/lib/export/losses-export"

export type LossesExportActionProps = {
  payload: LossesExportPayload
}

export function LossesExportAction({ payload }: LossesExportActionProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleExport() {
    setIsLoading(true)

    try {
      const result = await exportLossesToExcel(payload)

      if (result.success) {
        toast.success(result.message)
        return
      }

      toast.info(result.message)
    } catch (error) {
      console.error("[LossesExportAction.handleExport]", error)
      toast.error("Não foi possível preparar a exportação.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      icon={FileSpreadsheet}
      isLoading={isLoading}
      onClick={handleExport}
    >
      Exportar Excel
    </Button>
  )
}
