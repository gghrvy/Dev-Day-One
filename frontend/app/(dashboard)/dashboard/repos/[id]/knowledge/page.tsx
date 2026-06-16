"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { KnowledgeCard } from "@/components/knowledge/knowledge-card"
import { SkeletonList } from "@/components/ui/skeleton"
import type { KnowledgeEntry } from "@/types"

export default function KnowledgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [search, setSearch] = useState("")
  const { data: allEntries = [], isLoading } = useQuery({
    queryKey: ["knowledge", id],
    queryFn: () => apiFetch<KnowledgeEntry[]>(`/repos/${id}/knowledge`),
  })
  const entries = search.trim()
    ? allEntries.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.body?.toLowerCase().includes(search.toLowerCase())
      )
    : allEntries

  const action = (
    <div className="flex items-center gap-2">
      {allEntries.length > 0 && (
        <div className="flex items-center gap-1.5 rounded-md border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5">
          <Search className="h-3 w-3 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-28 bg-transparent text-[11px] text-zinc-400 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>
      )}
      <Link
        href={`/dashboard/repos/${id}/knowledge/new`}
        className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-zinc-900 hover:bg-amber-400"
      >
        <Plus className="h-3 w-3" /> Add entry
      </Link>
    </div>
  )

  return (
    <div>
      <PageHeader title="Knowledge Base" meta={allEntries.length ? `${allEntries.length} entries` : undefined} action={action} />
      <div className="mt-2">
        {isLoading && <SkeletonList rows={3} />}
        {!isLoading && entries.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-zinc-600">No knowledge entries yet. Document the &quot;why&quot; behind your decisions.</p>
          </div>
        )}
        {entries.map((e) => <KnowledgeCard key={e.id} entry={e} />)}
      </div>
    </div>
  )
}
