"use client"

import { Loader2, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { logoutAction } from "@/actions/auth-actions"
import { toastFromActionResponse } from "@/lib/utils/toast-action"
import { useAppStore } from "@/stores/app-store"

export function LogoutButton() {
  const router = useRouter()
  const clearAuth = useAppStore((state) => state.clearAuth)
  const profile = useAppStore((state) => state.profile)
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogout() {
    setIsLoading(true)

    try {
      const result = await logoutAction()

      const ok = toastFromActionResponse(result, {
        errorFallback: "Erro ao sair.",
        showSuccess: false
      })
      if (!ok) return

      clearAuth()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("[LogoutButton.handleLogout]", error)
      toast.error("Erro interno.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {profile && (
        <p className="text-sm text-zinc-500">
          Olá,{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {profile.full_name}
          </span>
        </p>
      )}

      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        className="apple-pressable flex items-center justify-center gap-2 rounded-ios-btn bg-apple-red/10 px-4 py-2 font-medium text-apple-red transition-all duration-300 disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            Saindo...
          </>
        ) : (
          <>
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Sair
          </>
        )}
      </button>
    </div>
  )
}
