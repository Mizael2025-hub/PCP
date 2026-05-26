import { Package } from "lucide-react"

import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"

export default function EstoquePage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Estoque"
        description="Controle de materiais e consumo de insumos."
      />

      <EmptyState
        icon={Package}
        title="Módulo em desenvolvimento"
        description="O controle de estoque será implementado em fase futura."
      />
    </div>
  )
}
