"use client"

import { X } from "lucide-react"
import { useEffect, type ReactNode } from "react"

import { cn } from "@/lib/utils/cn"

export type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "animate-slide-in-bottom w-full rounded-t-ios-modal bg-white p-6 pb-safe transition-all duration-300 ease-out dark:bg-zinc-900 sm:w-96 sm:rounded-ios-card",
          className
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700 sm:hidden" />

        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-xl font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="apple-pressable rounded-ios-btn p-1 text-zinc-500 transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
