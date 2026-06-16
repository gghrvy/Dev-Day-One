"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { RepoRow } from "@/components/repos/repo-row"
import type { Repository } from "@/types"

type SortKey = "date" | "name" | "indexed"

function sortRepos(repos: Repository[], key: SortKey): Repository[] {
  return [...repos].sort((a, b) => {
    if (key === "name") return a.name.localeCompare(b.name)
    if (key === "indexed") return (b.indexed ? 1 : 0) - (a.indexed ? 1 : 0)
    return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  })
}

export default function ReposPage() {
  const [sort, setSort] = useState<SortKey>("date")
  const { data: rawRepos, isLoading } = useQuery({
    queryKey: ["repos"],
    queryFn: () => apiFetch<Repository[]>("/repos"),
  })
  const repos = rawRepos ? sortRepos(rawRepos, sort) : undefined

  const action = (
    <div className="flex items-center gap-2">
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as SortKey)}
        className="rounded-md border border-white/[0.07] bg-transparent px-2 py-1.5 text-[11px] text-zinc-400 focus:outline-none"
      >
        <option value="date">Newest</option>
        <option value="name">Name</option>
        <option value="indexed">Indexed first</option>
      </select>
      <Link
        href="/dashboard/repos/new"
        className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-zinc-900 transition-colors hover:bg-amber-400"
      >
        <Plus className="h-3 w-3" />
        Connect repo
      </Link>
    </div>
  )

  return (
    <div>
      <PageHeader title="Repositories" meta={repos ? `${repos.length} connected` : undefined} action={action} />

      <div className="mt-4">
        {isLoading && (
          <div className="space-y-px">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-white/[0.04] px-5 py-3.5">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                <div className="h-3 w-48 rounded bg-zinc-800" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && repos?.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-zinc-600">No repositories yet.</p>
            <Link
              href="/dashboard/repos/new"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-amber-500 hover:text-amber-400"
            >
              <Plus className="h-3.5 w-3.5" />
              Connect your first repo
            </Link>
          </div>
        )}

        {repos?.map((repo) => <RepoRow key={repo.id} repo={repo} />)}
      </div>
    </div>
  )
}
