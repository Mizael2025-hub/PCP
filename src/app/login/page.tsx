import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { LoginForm } from "@/components/features/auth/login-form"

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/")
  }

  const { next } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-ios-card border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-1 text-xl font-semibold">PCP Baterias</h1>
        <p className="mb-6 text-sm text-zinc-500">
          Entre com suas credenciais para continuar.
        </p>
        <LoginForm redirectTo={next} />
      </div>
    </main>
  )
}
