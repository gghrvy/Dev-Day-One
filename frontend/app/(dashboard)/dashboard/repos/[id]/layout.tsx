"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client"
import type { Repository } from "@/types"

export default function RepoDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: repo } = useQuery<Repository>({
    queryKey: ["repo", id],
    queryFn: () => apiFetch<Repository>(`/repos/${id}`),
  })

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 border-b border-white/[0.04] px-5 py-2.5">
        <Link
          href="/dashboard/repos"
          className="font-mono text-[9px] text-dawn-muted transition-colors hover:text-zinc-400"
        >
          Repositories
        </Link>
        <span className="font-mono text-[9px] text-zinc-700">/</span>
        <span className="font-mono text-[9px] font-medium text-zinc-400">
          {repo?.full_name ?? id}
        </span>
      </div>
      {children}
    </div>
  )
}
