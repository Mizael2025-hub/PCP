"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

export type ErrorStateProps = {
  title?: string
  message?: string
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
}

export function ErrorState({
  title = "Algo deu errado",
  message = "Não foi possível carregar os dados. Tente novamente.",
  onRetry,
  isRetrying = false,
  className
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "animate-fade-in flex flex-col items-center justify-center rounded-ios-card border border-apple-red/20 bg-apple-red/5 px-6 py-12 text-center transition-all duration-300",
        className
      )}
      role="alert"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-ios-btn bg-apple-red/10">
        <AlertTriangle className="h-6 w-6 text-apple-red" strokeWidth={1.5} />
      </div>

      <h3 className="text-lg font-semibold text-apple-red">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="destructive"
          className="mt-6"
          onClick={onRetry}
          isLoading={isRetrying}
          icon={RefreshCw}
        >
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
