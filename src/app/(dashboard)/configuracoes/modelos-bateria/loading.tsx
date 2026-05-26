import { PageHeader } from "@/components/ui/page-header"
import { TableSkeleton } from "@/components/ui/skeleton"

export default function ModelosBateriaLoading() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Modelos de bateria"
        description="Cadastro de modelos com código, nome e peso nominal de referência."
      />
      <TableSkeleton rows={6} />
    </div>
  )
}
