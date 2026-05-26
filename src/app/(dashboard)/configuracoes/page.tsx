import Link from "next/link"
import {
  Battery,
  Building2,
  Clock,
  Cog,
  FlaskConical,
  Users
} from "lucide-react"

import { LogoutButton } from "@/components/features/auth/logout-button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"

export default function ConfiguracoesPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Configurações"
        description="Cadastros base e preferências do sistema."
      />

      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <Link
          href="/configuracoes/setores"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-blue-500/10">
            <Building2 className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold">Setores</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Cadastro de setores da planta.
          </p>
        </Link>

        <Link
          href="/configuracoes/turnos"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-blue-500/10">
            <Clock className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold">Turnos</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Horários de início e fim dos turnos.
          </p>
        </Link>

        <Link
          href="/configuracoes/funcionarios"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-blue-500/10">
            <Users className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold">Funcionários</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Operadores vinculados aos setores da planta.
          </p>
        </Link>

        <Link
          href="/configuracoes/maquinas"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-blue-500/10">
            <Cog className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold">Máquinas</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Equipamentos vinculados aos setores da planta.
          </p>
        </Link>

        <Link
          href="/configuracoes/modelos-bateria"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-blue-500/10">
            <Battery className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold">Modelos de bateria</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Código, nome e peso nominal de referência.
          </p>
        </Link>

        <Link
          href="/configuracoes/ligas"
          className="apple-pressable block rounded-ios-card border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-500/30 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-ios-btn bg-blue-500/10">
            <FlaskConical className="h-5 w-5 text-blue-500" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold">Ligas de chumbo</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Código e descrição das ligas para fundição.
          </p>
        </Link>

        <Card
          title="Conta"
          description="Gerencie sua sessão e dados de acesso."
        >
          <LogoutButton />
        </Card>
      </div>
    </div>
  )
}
