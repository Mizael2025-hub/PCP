import { redirect } from "next/navigation"

import { LogoutButton } from "@/components/features/auth/logout-button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { AuthService } from "@/services/auth-service"

export default async function DashboardPage() {
  const authService = new AuthService()
  const result = await authService.getSession()

  if (!result.success || !result.data) {
    redirect("/login")
  }

  const { profile } = result.data

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Início"
        description="Visão geral do sistema de gestão de produção."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          title="Bem-vindo"
          description={
            profile
              ? `Olá, ${profile.full_name}. Selecione um módulo no menu para começar.`
              : "Selecione um módulo no menu para começar."
          }
        />

        <Card title="Sessão" description="Gerencie sua sessão no sistema.">
          <LogoutButton />
        </Card>
      </div>
    </div>
  )
}
