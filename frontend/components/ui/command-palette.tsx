"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { Search, GitBranch, Settings, LayoutDashboard } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import type { Repository } from "@/types"

interface Item {
  label: string
  sub?: string
  href: string
  icon: React.ElementType
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: repos = [] } = useQuery<Repository[]>({
    queryKey: ["repos"],
    queryFn: () => apiFetch<Repository[]>("/repos"),
    enabled: open,
  })

  const staticItems: Item[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Repositories", href: "/dashboard/repos", icon: GitBranch },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  const repoItems: Item[] = repos.map((r) => ({
    label: r.name,
    sub: r.full_name,
    href: `/dashboard/repos/${r.id}`,
    icon: GitBranch,
  }))

  const all = [...staticItems, ...repoItems]
  const filtered = query.trim()
    ? all.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()) || i.sub?.toLowerCase().includes(query.toLowerCase()))
    : all

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
        setQuery("")
        setSelected(0)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => { setSelected(0) }, [query])

  const navigate = (href: string) => {
    router.push(href)
    setOpen(false)
    setQuery("")
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)) }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
    if (e.key === "Enter" && filtered[selected]) navigate(filtered[selected].href)
  }

  return (
    <AnimatePresence>
      {open && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.97 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="w-full max-w-md overflow-hidden rounded-xl border border-white/[0.09] bg-[#0C0C0E] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-3.5 py-3">
          <Search className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Jump to…"
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
          <kbd className="rounded border border-white/[0.07] px-1.5 py-0.5 font-mono text-[9px] text-zinc-600">ESC</kbd>
        </div>

        <div className="max-h-72 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-zinc-600">No results.</p>
          )}
          {filtered.map((item, i) => {
            const Icon = item.icon
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
                  i === selected ? "bg-white/[0.05] text-zinc-100" : "text-zinc-400 hover:bg-white/[0.03]"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                <div className="min-w-0">
                  <p className="text-[13px]">{item.label}</p>
                  {item.sub && <p className="truncate font-mono text-[10px] text-zinc-600">{item.sub}</p>}
                </div>
              </button>
            )
          })}
        </div>

        <div className="border-t border-white/[0.04] px-3.5 py-2">
          <p className="font-mono text-[9px] text-zinc-700">↑↓ navigate · Enter select · Esc close</p>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  )
}
