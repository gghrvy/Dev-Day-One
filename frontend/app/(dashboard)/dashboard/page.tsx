"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { GitBranch, Plus, Database, MessageSquare } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import type { Repository } from "@/types"

export default function DashboardPage() {
  const { data: repos = [], isLoading } = useQuery<Repository[]>({
    queryKey: ["repos"],
    queryFn: () => apiFetch<Repository[]>("/repos"),
  })

  const indexed = repos.filter((r) => r.indexed)
  const notIndexed = repos.filter((r) => !r.indexed)
  const recent = repos.slice(0, 5)

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-extrabold tracking-tight text-zinc-50">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">Welcome back.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        <StatCard icon={GitBranch} label="Repositories" value={repos.length} color="text-indigo-400" loading={isLoading} />
        <StatCard icon={Database} label="Indexed" value={indexed.length} color="text-emerald-400" loading={isLoading} />
        <StatCard icon={MessageSquare} label="Not indexed" value={notIndexed.length} color="text-zinc-500" loading={isLoading} />
      </div>

      {/* Recent repos */}
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600">Recent repositories</p>
        <Link href="/dashboard/repos" className="text-[11px] text-zinc-600 hover:text-zinc-400">View all →</Link>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#0C0C0E]">
        {isLoading && (
          <div className="space-y-px p-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg px-4 py-3">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                <div className="h-3 w-48 rounded bg-zinc-800 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && repos.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <GitBranch className="mb-3 h-6 w-6 text-zinc-700" />
            <p className="mb-1 text-sm text-zinc-500">No repositories connected yet.</p>
            <p className="mb-4 text-[12px] text-zinc-700">Connect a GitHub repo to start asking questions.</p>
            <Link
              href="/dashboard/repos/new"
              className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-zinc-900 hover:bg-amber-400"
            >
              <Plus className="h-3 w-3" />
              Connect your first repo
            </Link>
          </div>
        )}

        {recent.map((repo, i) => (
          <Link
            key={repo.id}
            href={`/dashboard/repos/${repo.id}`}
            className={cn(
              "flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/[0.02]",
              i < recent.length - 1 && "border-b border-white/[0.04]"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={cn("h-1.5 w-1.5 shrink-0 rounded-full", repo.indexed ? "bg-emerald-500" : "bg-zinc-600")} />
              <span className="truncate font-mono text-[12px] text-zinc-300">{repo.full_name}</span>
            </div>
            <div className="ml-4 shrink-0">
              <span className={cn("font-mono text-[10px]", repo.indexed ? "text-emerald-500" : "text-zinc-600")}>
                {repo.indexed ? "indexed" : "not indexed"}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {repos.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Link
            href="/dashboard/repos/new"
            className="flex items-center gap-1.5 rounded-md border border-white/[0.07] px-3 py-1.5 text-[11px] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300"
          >
            <Plus className="h-3 w-3" />
            Connect repo
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: string
  loading: boolean
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0C0C0E] p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={cn("h-3.5 w-3.5", color)} />
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">{label}</p>
      </div>
      {loading ? (
        <div className="h-6 w-8 animate-pulse rounded bg-zinc-800" />
      ) : (
        <p className="text-2xl font-extrabold tracking-tight text-zinc-100">{value}</p>
      )}
    </div>
  )
}
