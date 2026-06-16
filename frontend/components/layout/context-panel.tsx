"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api/client"
import type { Repository } from "@/types"

const subPages = [
  { label: "Overview", segment: "" },
  { label: "Ask", segment: "/ask" },
  { label: "Onboard", segment: "/onboard" },
  { label: "Architecture", segment: "/architecture" },
  { label: "Patterns", segment: "/patterns" },
  { label: "Impact", segment: "/impact" },
  { label: "Knowledge", segment: "/knowledge" },
  { label: "ADRs", segment: "/adrs" },
  { label: "APIs", segment: "/apis" },
  { label: "Index History", segment: "/jobs" },
]

export function ContextPanel() {
  const pathname = usePathname()
  const [search, setSearch] = useState("")
  const { data: repos = [] } = useQuery<Repository[]>({
    queryKey: ["repos"],
    queryFn: () => apiFetch<Repository[]>("/repos"),
  })

  const repoMatch = pathname.match(/\/dashboard\/repos\/([^/]+)/)
  const activeRepoId = repoMatch?.[1] === "new" ? null : (repoMatch?.[1] ?? null)

  const filtered = search.trim()
    ? repos.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.full_name.toLowerCase().includes(search.toLowerCase()))
    : repos

  return (
    <div className="flex w-[168px] shrink-0 flex-col border-r border-white/[0.05] bg-[#0C0C0E]">
      <div className="px-3 pb-1 pt-3">
        <p className="text-[11px] font-bold text-dawn-text">Repositories</p>
      </div>

      {repos.length > 3 && (
        <div className="px-2 pb-1">
          <div className="flex items-center gap-1.5 rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-1">
            <Search className="h-2.5 w-2.5 shrink-0 text-zinc-700" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter…"
              className="w-full bg-transparent text-[10px] text-zinc-400 placeholder:text-zinc-700 focus:outline-none"
            />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto px-2 pb-2">
        {filtered.map((repo) => {
          const isExpanded = repo.id === activeRepoId
          const stripe = repo.indexed
            ? "bg-[#4ADE80]"
            : "bg-zinc-700 opacity-40"

          return (
            <div key={repo.id} className="mb-0.5">
              <Link
                href={`/dashboard/repos/${repo.id}`}
                className={cn(
                  "flex items-center gap-1.5 rounded-[5px] px-1.5 py-[5px] transition-colors",
                  isExpanded
                    ? "bg-[#1C1C1F] text-dawn-text"
                    : "text-zinc-500 hover:bg-[#111113] hover:text-zinc-300"
                )}
              >
                <span className={cn("h-3.5 w-0.5 shrink-0 rounded-[1px]", stripe)} />
                <span className="flex-1 truncate text-[10px] font-semibold leading-none">
                  {repo.name}
                </span>
                {repo.indexed && (
                  <ChevronDown
                    className={cn(
                      "h-[7px] w-[7px] shrink-0 text-zinc-600 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                )}
                {!repo.indexed && (
                  <span className="shrink-0 font-mono text-[8px] text-dawn-accent">•</span>
                )}
              </Link>

              {isExpanded && (
                <div className="ml-3 mt-0.5 flex flex-col gap-0.5 pl-1.5">
                  {subPages.map(({ label, segment }) => {
                    const href = `/dashboard/repos/${repo.id}${segment}`
                    const subActive =
                      segment === ""
                        ? pathname === `/dashboard/repos/${repo.id}`
                        : pathname === href
                    return (
                      <Link
                        key={label}
                        href={href}
                        className={cn(
                          "rounded-[4px] px-2 py-[4px] text-[10px] transition-colors",
                          subActive
                            ? "border-l-2 border-dawn-ai bg-[rgba(99,102,241,0.06)] pl-[6px] font-semibold text-[#818CF8]"
                            : "text-zinc-600 hover:text-zinc-400"
                        )}
                      >
                        {label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && repos.length === 0 && (
          <p className="px-1.5 py-2 text-[10px] text-zinc-700">No repositories yet.</p>
        )}
        {filtered.length === 0 && repos.length > 0 && (
          <p className="px-1.5 py-2 text-[10px] text-zinc-700">No match.</p>
        )}

        <Link
          href="/dashboard/repos/new"
          className="mt-2 px-1.5 text-[10px] text-zinc-700 transition-colors hover:text-zinc-500"
        >
          + Connect
        </Link>
      </div>
    </div>
  )
}
