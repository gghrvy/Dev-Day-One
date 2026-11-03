"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { setToastHandler } from "@/lib/toast-bridge"
import { cn } from "@/lib/utils"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  useEffect(() => {
    setToastHandler(toast)
  }, [toast])

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const icons = { success: CheckCircle2, error: AlertCircle, info: Info }
  const colors = {
    success: "border-l-route text-route",
    error: "border-l-alert text-alert",
    info: "border-l-signal text-signal",
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div role="status" aria-live="polite" className="fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.type]
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(
                  "flex max-w-sm items-start gap-2.5 rounded-[var(--radius-control)] border border-kerb border-l-2 bg-asphalt px-3.5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
                  colors[t.type]
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p className="text-sm text-chalk">{t.message}</p>
                <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="ml-1 rounded-[var(--radius-control)] p-0.5 text-fog hover:text-chalk">
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
