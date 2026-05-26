import { PageHeader } from "@/components/ui/page-header"
import { TableSkeleton } from "@/components/ui/skeleton"

export default function FuncionariosLoading() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Funcionários"
        description="Cadastro de operadores vinculados aos setores."
      />
      <TableSkeleton rows={6} />
    </div>
  )
}
