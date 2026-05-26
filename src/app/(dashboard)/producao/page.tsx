import { Factory } from "lucide-react"

import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"

export default function ProducaoPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Produção"
        description="Apontamentos de peso e paradas de máquina."
      />

      <EmptyState
        icon={Factory}
        title="Módulo em desenvolvimento"
        description="Os apontamentos de produção serão implementados na Fase 3."
      />
    </div>
  )
}
