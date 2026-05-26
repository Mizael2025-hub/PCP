import { FlaskConical } from "lucide-react"

import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"

export default function QualidadePage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Qualidade"
        description="Controles laboratoriais e formação de baterias."
      />

      <EmptyState
        icon={FlaskConical}
        title="Módulo em desenvolvimento"
        description="Os registros de qualidade serão implementados na Fase 4."
      />
    </div>
  )
}
