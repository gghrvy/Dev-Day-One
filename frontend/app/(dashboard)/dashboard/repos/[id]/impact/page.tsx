"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { IS_DEMO } from "@/lib/demo"
import { PageHeader } from "@/components/layout/page-header"
import { PageBody, EmptyState } from "@/components/layout/page-body"
import { ImpactForm, ImpactResult } from "@/components/impact/impact-form"
import { SkeletonList } from "@/components/ui/skeleton"
import type { ImpactAnalysis } from "@/types"

export default function ImpactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["impact", id],
    queryFn: () => apiFetch<ImpactAnalysis[]>(`/repos/${id}/impact`),
  })

  return (
    <div>
      <PageHeader
        title="Impact"
        description={
          IS_DEMO
            ? "Which files a proposed change would affect, and how risky it is. The public demo shows saved analyses."
            : "Which files a proposed change would affect, and how risky it is."
        }
      />
      <PageBody>
        {!IS_DEMO && (
          <div className="mb-10">
            <ImpactForm repoId={id} />
          </div>
        )}
        {isLoading && <SkeletonList rows={3} />}
        {!isLoading && analyses.length === 0 && (
          <EmptyState title="No analyses yet">Describe a change above to see which files it would touch.</EmptyState>
        )}
        <div className="max-w-[60rem]">
          {analyses.map((a) => <ImpactResult key={a.id} analysis={a} />)}
        </div>
      </PageBody>
    </div>
  )
}
