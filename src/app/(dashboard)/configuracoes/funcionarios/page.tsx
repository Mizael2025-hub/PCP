import { EmployeesManager } from "@/components/features/employees/employees-manager"
import { ErrorState } from "@/components/ui/error-state"
import { PageHeader } from "@/components/ui/page-header"
import { EmployeeService } from "@/services/employee-service"
import { SectorService } from "@/services/sector-service"

export const dynamic = "force-dynamic"

export default async function FuncionariosPage() {
  const employeeService = new EmployeeService()
  const sectorService = new SectorService()

  const [employeesResult, sectorsResult] = await Promise.all([
    employeeService.list(),
    sectorService.list()
  ])

  if (!employeesResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Funcionários"
          description="Cadastro de operadores vinculados aos setores."
        />
        <ErrorState message={employeesResult.message} />
      </div>
    )
  }

  if (!sectorsResult.success) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Funcionários"
          description="Cadastro de operadores vinculados aos setores."
        />
        <ErrorState message={sectorsResult.message} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Funcionários"
        description="Cadastro de operadores vinculados aos setores."
      />

      <EmployeesManager
        initialEmployees={employeesResult.data ?? []}
        sectors={sectorsResult.data ?? []}
      />
    </div>
  )
}
