"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { Search, GitBranch, Settings, LayoutDashboard } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { IS_DEMO } from "@/lib/demo"
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
    ...(IS_DEMO ? [] : [{ label: "Settings", href: "/dashboard/settings", icon: Settings }]),
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
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.97 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        role="dialog" aria-modal="true" aria-label="Jump to a page"
        className="mx-4 w-full max-w-md overflow-hidden rounded-[var(--radius-panel)] border border-kerb bg-asphalt shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-kerb px-4 py-3">
          <Search className="size-4 shrink-0 text-fog" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(0)
            }}
            onKeyDown={handleKey}
            placeholder="Jump to…"
            aria-label="Jump to"
            className="flex-1 bg-transparent text-chalk placeholder:text-fog focus-visible:outline-none"
          />
          <kbd className="rounded-[var(--radius-control)] border border-kerb px-1.5 py-0.5 text-xs text-fog">Esc</kbd>
        </div>

        <div className="max-h-72 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-sm text-fog">Nothing matches. Try a repository name.</p>
          )}
          {filtered.map((item, i) => {
            const Icon = item.icon
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  "flex w-full items-center gap-3 border-l-2 px-4 py-2.5 text-left",
                  i === selected ? "border-signal bg-graphite text-chalk" : "border-transparent text-fog hover:bg-graphite"
                )}
              >
                <Icon className="size-4 shrink-0 text-fog" aria-hidden="true" />
                <div className="min-w-0">
                  <p>{item.label}</p>
                  {item.sub && <p className="truncate font-mono text-xs text-fog">{item.sub}</p>}
                </div>
              </button>
            )
          })}
        </div>

        <div className="border-t border-kerb px-4 py-2">
          <p className="text-xs text-fog">Arrow keys to move, Enter to open, Esc to close</p>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  )
}
