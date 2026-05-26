"use client"

import { useEffect } from "react"

import { getSessionAction } from "@/actions/auth-actions"
import { createClient } from "@/lib/supabase/client"
import { useAppStore } from "@/stores/app-store"

type AuthProviderProps = {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const setAuth = useAppStore((state) => state.setAuth)
  const clearAuth = useAppStore((state) => state.clearAuth)
  const setAuthLoading = useAppStore((state) => state.setAuthLoading)

  useEffect(() => {
    let isMounted = true

    async function hydrateSession() {
      setAuthLoading(true)

      const result = await getSessionAction()

      if (!isMounted) {
        return
      }

      if (result.success && result.data) {
        setAuth(result.data.user, result.data.profile)
        return
      }

      clearAuth()
    }

    void hydrateSession()

    const supabase = createClient()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return
      }

      if (!session?.user) {
        clearAuth()
        return
      }

      void getSessionAction().then((result) => {
        if (!isMounted) {
          return
        }

        if (result.success && result.data) {
          setAuth(result.data.user, result.data.profile)
          return
        }

        clearAuth()
      })
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [clearAuth, setAuth, setAuthLoading])

  return children
}
