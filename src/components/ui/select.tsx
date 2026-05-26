import { forwardRef, type SelectHTMLAttributes } from "react"

import { cn } from "@/lib/utils/cn"

export type SelectOption = {
  value: string
  label: string
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      options,
      placeholder,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id ?? props.name
    const hasError = Boolean(error)

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              "text-sm font-medium",
              hasError ? "text-apple-red" : "text-zinc-700 dark:text-zinc-300"
            )}
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={cn(
            "w-full origin-left scale-[0.93] rounded-ios-btn border px-3 py-2 text-[16px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60",
            hasError
              ? "border-apple-red/10 bg-apple-red/5 text-apple-red"
              : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && <span className="text-[12px] text-apple-red">{error}</span>}
        {!error && hint && (
          <span className="text-[12px] text-zinc-500">{hint}</span>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"
