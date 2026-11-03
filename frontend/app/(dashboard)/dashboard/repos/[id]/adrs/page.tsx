"use client"

import { use } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { IS_DEMO } from "@/lib/demo"
import { PageHeader } from "@/components/layout/page-header"
import { PageBody, EmptyState } from "@/components/layout/page-body"
import { AdrCard } from "@/components/adrs/adr-card"
import { Button } from "@/components/ui/button"
import { SkeletonList } from "@/components/ui/skeleton"
import type { Adr } from "@/types"

export default function AdrsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: adrs = [], isLoading } = useQuery({
    queryKey: ["adrs", id],
    queryFn: () => apiFetch<Adr[]>(`/repos/${id}/adrs`),
  })

  return (
    <div>
      <PageHeader
        title="Decisions"
        description="Architecture decision records: what was decided, why, and what it costs."
        meta={adrs.length ? `${adrs.length} records` : undefined}
        action={
          !IS_DEMO && (
            <Button asChild>
              <Link href={`/dashboard/repos/${id}/adrs/new`}>New record</Link>
            </Button>
          )
        }
      />
      <PageBody>
        {isLoading && <SkeletonList rows={3} />}
        {!isLoading && adrs.length === 0 && (
          <EmptyState title="No decision records yet">Write one when you make a choice future teammates will ask about.</EmptyState>
        )}
        {adrs.length > 0 && (
          <ul className="max-w-[60rem]">
            {adrs.map((adr) => <AdrCard key={adr.id} adr={adr} repoId={id} />)}
          </ul>
        )}
      </PageBody>
    </div>
  )
}
