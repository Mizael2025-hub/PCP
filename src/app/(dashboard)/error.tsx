"use client"

import { useRouter } from "next/navigation"

import { ErrorState } from "@/components/ui/error-state"

type DashboardErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  const router = useRouter()

  console.error("[DashboardError]", error)

  return (
    <ErrorState
      title="Erro ao carregar página"
      message="Ocorreu um problema ao exibir esta seção."
      onRetry={() => {
        reset()
        router.refresh()
      }}
    />
  )
}
