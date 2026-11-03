"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { IS_DEMO } from "@/lib/demo"
import { PageHeader } from "@/components/layout/page-header"
import { PageBody, EmptyState } from "@/components/layout/page-body"
import { KnowledgeCard } from "@/components/knowledge/knowledge-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SkeletonList } from "@/components/ui/skeleton"
import type { KnowledgeEntry } from "@/types"

export default function KnowledgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [search, setSearch] = useState("")
  const { data: allEntries = [], isLoading } = useQuery({
    queryKey: ["knowledge", id],
    queryFn: () => apiFetch<KnowledgeEntry[]>(`/repos/${id}/knowledge`),
  })
  const q = search.trim().toLowerCase()
  const entries = q
    ? allEntries.filter((e) => e.title.toLowerCase().includes(q) || e.body?.toLowerCase().includes(q))
    : allEntries

  return (
    <div>
      <PageHeader
        title="Notes"
        description="Things the code doesn't say: gotchas, history and reasons, written by the team."
        meta={allEntries.length ? `${allEntries.length} notes` : undefined}
        action={
          !IS_DEMO && (
            <Button asChild>
              <Link href={`/dashboard/repos/${id}/knowledge/new`}>Add note</Link>
            </Button>
          )
        }
      />
      <PageBody>
        {allEntries.length > 0 && (
          <div className="mb-6 max-w-[24rem]">
            <label htmlFor="notes-search" className="sr-only">Search notes</label>
            <Input id="notes-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes" />
          </div>
        )}
        {isLoading && <SkeletonList rows={3} />}
        {!isLoading && allEntries.length === 0 && (
          <EmptyState title="No notes yet">Add one when you learn something the code doesn&apos;t explain.</EmptyState>
        )}
        {!isLoading && allEntries.length > 0 && entries.length === 0 && (
          <EmptyState title="No notes match that search">Try a file name or a single word.</EmptyState>
        )}
        {entries.length > 0 && (
          <ul className="max-w-[60rem]">
            {entries.map((e) => <KnowledgeCard key={e.id} entry={e} />)}
          </ul>
        )}
      </PageBody>
    </div>
  )
}
