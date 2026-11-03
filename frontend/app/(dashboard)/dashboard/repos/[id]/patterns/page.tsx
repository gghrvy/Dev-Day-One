"use client"

import { use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { IS_DEMO } from "@/lib/demo"
import { PageHeader } from "@/components/layout/page-header"
import { PageBody, EmptyState } from "@/components/layout/page-body"
import { PatternCard } from "@/components/patterns/pattern-card"
import { Button } from "@/components/ui/button"
import { SkeletonList } from "@/components/ui/skeleton"
import type { PatternDetection } from "@/types"

export default function PatternsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const qc = useQueryClient()

  const { data: detection, isLoading } = useQuery({
    queryKey: ["patterns", id],
    queryFn: () => apiFetch<PatternDetection | null>(`/repos/${id}/patterns`),
  })

  const detect = useMutation({
    mutationFn: () => apiFetch(`/repos/${id}/patterns/detect`, { method: "POST" }),
    onSuccess: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ["patterns", id] }), 5000)
    },
  })

  return (
    <div>
      <PageHeader
        title="Patterns"
        description="Design patterns found in the code, with the evidence for each."
        meta={detection ? `${detection.patterns.length} patterns found` : undefined}
        action={
          !IS_DEMO && (
            <Button onClick={() => detect.mutate()} disabled={detect.isPending}>
              {detect.isPending ? "Detecting…" : detection ? "Detect again" : "Detect patterns"}
            </Button>
          )
        }
      />
      <PageBody>
        {isLoading && <SkeletonList rows={4} />}
        {!isLoading && !detection && (
          <EmptyState title="No patterns detected yet">Run detection to analyse how this codebase is organised.</EmptyState>
        )}
        {detection && (
          <div className="grid gap-10 xl:grid-cols-12">
            <ul className="xl:col-span-8">
              {detection.patterns.map((p) => <PatternCard key={p.name} pattern={p} />)}
            </ul>
            {detection.raw_analysis && (
              <section aria-labelledby="summary-title" className="xl:col-span-4">
                <h2 id="summary-title" className="text-[1.25rem] font-bold text-chalk">Summary</h2>
                <div className="mt-3 space-y-3 text-fog">
                  {detection.raw_analysis.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
                </div>
              </section>
            )}
          </div>
        )}
      </PageBody>
    </div>
  )
}
