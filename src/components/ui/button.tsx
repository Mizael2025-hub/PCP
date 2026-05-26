import { Loader2, type LucideIcon } from "lucide-react"
import { forwardRef, type ButtonHTMLAttributes } from "react"

import { cn } from "@/lib/utils/cn"

const variantStyles = {
  primary: "bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-400",
  secondary:
    "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
  destructive: "bg-apple-red/10 text-apple-red hover:bg-apple-red/15",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
} as const

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base"
} as const

export type ButtonVariant = keyof typeof variantStyles
export type ButtonSize = keyof typeof sizeStyles

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  icon?: LucideIcon
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      icon: Icon,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          "apple-pressable inline-flex items-center justify-center gap-2 rounded-ios-btn font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
        ) : Icon ? (
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
