"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Shield, Users, GitBranch, MessageSquare, Database, BarChart3 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { cn } from "@/lib/utils"

interface Stats {
  total_users: number
  total_orgs: number
  total_repos: number
  indexed_repos: number
  total_chats: number
  total_index_jobs: number
}

interface AdminUser {
  id: string
  email: string | null
  is_admin: boolean
  created_at: string | null
}

interface AdminRepo {
  id: string
  full_name: string
  indexed: boolean
  is_private: boolean
  created_at: string | null
}

type Tab = "stats" | "users" | "repos"

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("stats")
  const qc = useQueryClient()

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => apiFetch<Stats>("/admin/stats"),
    retry: false,
  })

  const { data: users = [] } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiFetch<AdminUser[]>("/admin/users"),
    enabled: tab === "users",
    retry: false,
  })

  const { data: repos = [] } = useQuery({
    queryKey: ["admin", "repos"],
    queryFn: () => apiFetch<AdminRepo[]>("/admin/repos"),
    enabled: tab === "repos",
    retry: false,
  })

  const toggleAdmin = useMutation({
    mutationFn: (userId: string) =>
      apiFetch(`/admin/users/${userId}/toggle-admin`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  })

  if (statsError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-graphite">
        <div className="text-center">
          <Shield className="mx-auto mb-3 h-8 w-8 text-fog" />
          <p className="text-sm text-chalk0">Admin access required.</p>
        </div>
      </div>
    )
  }

  const statCards = stats
    ? [
        { label: "Users", value: stats.total_users, icon: Users, color: "text-route" },
        { label: "Organisations", value: stats.total_orgs, icon: Shield, color: "text-signal" },
        { label: "Repos", value: stats.total_repos, icon: GitBranch, color: "text-route" },
        { label: "Indexed", value: stats.indexed_repos, icon: Database, color: "text-route" },
        { label: "Chats", value: stats.total_chats, icon: MessageSquare, color: "text-route" },
        { label: "Index Jobs", value: stats.total_index_jobs, icon: BarChart3, color: "text-fog" },
      ]
    : []

  return (
    <div className="min-h-screen bg-graphite text-chalk">
      {/* Header */}
      <div className="border-b border-kerb bg-asphalt px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[5px] bg-signal text-[11px] font-black text-signal-ink">D</div>
            <span className="text-sm font-semibold text-chalk">Dev Day One</span>
            <span className="rounded-full border border-alert/40 px-2 py-0.5 text-xs font-bold text-alert">Admin</span>
          </div>
          <a href="/dashboard" className="text-[11px] text-fog hover:text-fog">Back to the app</a>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-6 text-xl font-extrabold tracking-tight text-chalk">Admin Panel</h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-[var(--radius-control)] border border-kerb bg-transparent p-1 w-fit">
          {(["stats", "users", "repos"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-[var(--radius-control)] px-4 py-1.5 text-[11px] font-semibold capitalize transition-colors",
                tab === t ? "bg-asphalt text-chalk" : "text-fog hover:text-fog"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {tab === "stats" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {statsLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-[var(--radius-panel)] bg-zinc-800/40" />
                ))
              : statCards.map((s) => (
                  <div key={s.label} className="rounded-[var(--radius-panel)] border border-kerb bg-asphalt p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <s.icon className={cn("h-4 w-4", s.color)} />
                      <p className="text-sm text-fog">{s.label}</p>
                    </div>
                    <p className="text-2xl font-extrabold tracking-tight text-chalk">{s.value.toLocaleString()}</p>
                  </div>
                ))}
          </div>
        )}

        {/* Users tab */}
        {tab === "users" && (
          <div className="rounded-[var(--radius-panel)] border border-kerb bg-asphalt">
            {users.length === 0 && (
              <p className="px-5 py-4 text-sm text-fog">No users found.</p>
            )}
            {users.map((u, i) => (
              <div
                key={u.id}
                className={cn("flex items-center justify-between px-5 py-3", i < users.length - 1 && "border-b border-kerb")}
              >
                <div>
                  <p className="text-sm text-chalk">{u.email ?? "—"}</p>
                  <p className="font-mono text-[10px] text-fog">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {u.is_admin && (
                    <span className="rounded-full border border-alert/40 px-2 py-0.5 text-xs font-bold text-alert">admin</span>
                  )}
                  <button
                    onClick={() => toggleAdmin.mutate(u.id)}
                    disabled={toggleAdmin.isPending}
                    className="rounded-[var(--radius-control)] border border-kerb px-2.5 py-1 text-[10px] text-chalk0 hover:border-fog hover:text-chalk disabled:opacity-50"
                  >
                    {u.is_admin ? "Revoke admin" : "Make admin"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Repos tab */}
        {tab === "repos" && (
          <div className="rounded-[var(--radius-panel)] border border-kerb bg-asphalt">
            {repos.length === 0 && (
              <p className="px-5 py-4 text-sm text-fog">No repositories found.</p>
            )}
            {repos.map((r, i) => (
              <div
                key={r.id}
                className={cn("flex items-center justify-between px-5 py-3", i < repos.length - 1 && "border-b border-kerb")}
              >
                <div>
                  <p className="font-mono text-sm text-chalk">{r.full_name}</p>
                  <p className="font-mono text-[10px] text-fog">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {r.is_private && (
                    <span className="rounded border border-zinc-700/40 px-1.5 py-0.5 font-mono text-[9px] text-chalk0">private</span>
                  )}
                  <span className={cn("rounded border px-1.5 py-0.5 font-mono text-[9px]",
                    r.indexed
                      ? "border-route/40 text-route"
                      : "border-zinc-700/40 bg-zinc-800/50 text-fog"
                  )}>
                    {r.indexed ? "indexed" : "not indexed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
