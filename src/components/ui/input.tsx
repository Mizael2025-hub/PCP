import { forwardRef, type InputHTMLAttributes } from "react"

import { cn } from "@/lib/utils/cn"

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, disabled, ...props }, ref) => {
    const inputId = id ?? props.name
    const hasError = Boolean(error)

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium",
              hasError ? "text-apple-red" : "text-zinc-700 dark:text-zinc-300"
            )}
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            "w-full origin-left scale-[0.93] rounded-ios-btn border px-3 py-2 text-[16px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60",
            hasError
              ? "border-apple-red/10 bg-apple-red/5 text-apple-red"
              : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950",
            className
          )}
          {...props}
        />

        {error && <span className="text-[12px] text-apple-red">{error}</span>}
        {!error && hint && (
          <span className="text-[12px] text-zinc-500">{hint}</span>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
