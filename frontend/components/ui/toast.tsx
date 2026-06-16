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
    success: "border-emerald-500/20 text-emerald-400",
    error: "border-red-500/20 text-red-400",
    info: "border-indigo-500/20 text-indigo-400",
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
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
                  "flex items-center gap-2.5 rounded-lg border bg-[#0C0C0E] px-3.5 py-2.5 shadow-xl",
                  colors[t.type]
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <p className="text-[12px] text-zinc-200">{t.message}</p>
                <button onClick={() => dismiss(t.id)} className="ml-1 text-zinc-600 hover:text-zinc-400">
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
