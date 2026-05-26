import { PageHeader } from "@/components/ui/page-header"
import { TableSkeleton } from "@/components/ui/skeleton"

export default function TurnosLoading() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Turnos"
        description="Cadastro de turnos de trabalho da planta."
      />
      <TableSkeleton rows={6} />
    </div>
  )
}
