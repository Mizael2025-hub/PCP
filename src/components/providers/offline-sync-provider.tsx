"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { executeOutboxItem } from "@/lib/offline/outbox-executor"
import {
  countPendingOutbox,
  listPendingOutbox,
  markOutboxFailed,
  markOutboxSent
} from "@/lib/offline/outbox"

type OfflineSyncProviderProps = {
  children: React.ReactNode
}

function errorToMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Falha ao sincronizar."
}

export function OfflineSyncProvider({ children }: OfflineSyncProviderProps) {
  const [pendingCount, setPendingCount] = useState<number>(0)
  const isFlushingRef = useRef(false)

  async function refreshCount() {
    setPendingCount(await countPendingOutbox())
  }

  async function flushOnce() {
    if (!navigator.onLine) return
    if (isFlushingRef.current) return

    isFlushingRef.current = true
    try {
      const pending = await listPendingOutbox(10)
      if (pending.length === 0) return

      for (const item of pending) {
        try {
          const result = await executeOutboxItem(item)
          if (!result.success) {
            await markOutboxFailed(item.id, result.message ?? "Erro ao enviar.")
            continue
          }

          await markOutboxSent(item.id)
        } catch (error) {
          await markOutboxFailed(item.id, errorToMessage(error))
        }
      }
    } finally {
      isFlushingRef.current = false
      await refreshCount()
    }
  }

  useEffect(() => {
    void refreshCount()

    function handleOnline() {
      void flushOnce().then(() => {
        if (pendingCount > 0) {
          toast.success("Conexão restaurada. Sincronização em andamento…")
        }
      })
    }

    window.addEventListener("online", handleOnline)
    const interval = window.setInterval(() => void flushOnce(), 10_000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {pendingCount > 0 && (
        <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100 md:px-6">
          {navigator.onLine
            ? `${pendingCount} envio(s) pendente(s). Sincronizando…`
            : `${pendingCount} envio(s) pendente(s). Você está offline.`}
        </div>
      )}
      {children}
    </>
  )
}
