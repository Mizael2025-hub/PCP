import type { User } from "@supabase/supabase-js"
import { create } from "zustand"

import type { Profile } from "@/types/auth"

type AppStore = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  user: User | null
  profile: Profile | null
  isAuthLoading: boolean
  setAuth: (user: User | null, profile: Profile | null) => void
  setAuthLoading: (loading: boolean) => void
  clearAuth: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: false,

  setSidebarOpen: (open) =>
    set({
      sidebarOpen: open
    }),

  user: null,
  profile: null,
  isAuthLoading: true,

  setAuth: (user, profile) =>
    set({
      user,
      profile,
      isAuthLoading: false
    }),

  setAuthLoading: (loading) =>
    set({
      isAuthLoading: loading
    }),

  clearAuth: () =>
    set({
      user: null,
      profile: null,
      isAuthLoading: false
    })
}))
