"use client"

import { use } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { AdrCard } from "@/components/adrs/adr-card"
import { SkeletonList } from "@/components/ui/skeleton"
import type { Adr } from "@/types"

export default function AdrsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: adrs = [], isLoading } = useQuery({
    queryKey: ["adrs", id],
    queryFn: () => apiFetch<Adr[]>(`/repos/${id}/adrs`),
  })

  const action = (
    <Link
      href={`/dashboard/repos/${id}/adrs/new`}
      className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-zinc-900 hover:bg-amber-400"
    >
      <Plus className="h-3 w-3" />
      New ADR
    </Link>
  )

  return (
    <div>
      <PageHeader title="Architecture Decision Records" meta={adrs.length ? `${adrs.length} records` : undefined} action={action} />
      <div className="mt-2">
        {isLoading && <SkeletonList rows={3} />}
        {!isLoading && adrs.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-zinc-600">No ADRs yet. Document your first architecture decision.</p>
            <Link
              href={`/dashboard/repos/${id}/adrs/new`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-amber-500 hover:text-amber-400"
            >
              <Plus className="h-3.5 w-3.5" /> Create first ADR
            </Link>
          </div>
        )}
        {adrs.map((adr) => <AdrCard key={adr.id} adr={adr} repoId={id} />)}
      </div>
    </div>
  )
}
