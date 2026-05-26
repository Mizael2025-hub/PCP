"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"

import { AuthProvider } from "@/components/providers/auth-provider"

type AppProvidersProps = {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>{children}</AuthProvider>
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "rounded-ios-btn border border-zinc-200 dark:border-zinc-800"
          }
        }}
      />
    </ThemeProvider>
  )
}
