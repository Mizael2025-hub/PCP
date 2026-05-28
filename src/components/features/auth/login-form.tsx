"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { getSessionAction, loginAction } from "@/actions/auth-actions"
import { toastFromActionResponse } from "@/lib/utils/toast-action"
import { useAppStore } from "@/stores/app-store"
import { loginSchema, type LoginSchema } from "@/validations/auth/login-schema"

type LoginFormProps = {
  redirectTo?: string
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter()
  const setAuth = useAppStore((state) => state.setAuth)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  async function onSubmit(data: LoginSchema) {
    setIsSubmitting(true)

    try {
      const result = await loginAction(data)

      const ok = toastFromActionResponse(result, {
        successFallback: "Login realizado.",
        errorFallback: "Erro ao entrar.",
        showSuccess: false
      })

      if (!ok) return

      const sessionResult = await getSessionAction()

      if (sessionResult.success && sessionResult.data) {
        setAuth(sessionResult.data.user, sessionResult.data.profile)
      }

      router.push(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/")
      router.refresh()
    } catch (error) {
      console.error("[LoginForm.onSubmit]", error)
      toast.error("Erro interno.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1">
        <label
          htmlFor="email"
          className={`text-sm font-medium ${errors.email ? "text-apple-red" : "text-zinc-700 dark:text-zinc-300"}`}
        >
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          className={`w-full origin-left scale-[0.93] rounded-ios-btn border px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60 ${
            errors.email
              ? "border-apple-red/10 bg-apple-red/5 text-apple-red"
              : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
          }`}
          placeholder="seu@email.com"
          {...register("email")}
        />
        {errors.email && (
          <span className="text-[12px] text-apple-red">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="password"
          className={`text-sm font-medium ${errors.password ? "text-apple-red" : "text-zinc-700 dark:text-zinc-300"}`}
        >
          Senha
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={isSubmitting}
          className={`w-full origin-left scale-[0.93] rounded-ios-btn border px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60 ${
            errors.password
              ? "border-apple-red/10 bg-apple-red/5 text-apple-red"
              : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
          }`}
          placeholder="••••••"
          {...register("password")}
        />
        {errors.password && (
          <span className="text-[12px] text-apple-red">
            {errors.password.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="apple-pressable mt-2 flex items-center justify-center gap-2 rounded-ios-btn bg-blue-500 px-4 py-2 font-medium text-white transition-all duration-300 disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </button>
    </form>
  )
}
