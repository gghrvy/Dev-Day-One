"use client"

import { use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { IS_DEMO } from "@/lib/demo"
import { formatDate } from "@/lib/format"
import { PageHeader } from "@/components/layout/page-header"
import { PageBody, EmptyState } from "@/components/layout/page-body"
import { ArchGraph, TYPE_STYLE } from "@/components/architecture/arch-graph"
import { Button } from "@/components/ui/button"
import { SkeletonText } from "@/components/ui/skeleton"
import type { ArchitectureGraph } from "@/types"

export default function ArchitecturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const qc = useQueryClient()

  const { data: graph, isLoading } = useQuery({
    queryKey: ["architecture", id],
    queryFn: () => apiFetch<ArchitectureGraph | null>(`/repos/${id}/architecture`),
  })

  const analyze = useMutation({
    mutationFn: () => apiFetch(`/repos/${id}/architecture/analyze`, { method: "POST" }),
    onSuccess: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ["architecture", id] }), 8000)
    },
  })

  const nodes = graph?.graph_data.nodes ?? []
  const edges = graph?.graph_data.edges ?? []
  const nameOf = (nodeId: string) => nodes.find((n) => n.id === nodeId)?.label ?? nodeId

  return (
    <div>
      <PageHeader
        title="Architecture"
        description="The main parts of the system and how they call each other. Select a part for details."
        meta={graph ? `Generated ${formatDate(graph.generated_at)}` : undefined}
        action={
          !IS_DEMO && (
            <Button onClick={() => analyze.mutate()} disabled={analyze.isPending}>
              {analyze.isPending ? "Analysing…" : graph ? "Analyse again" : "Generate graph"}
            </Button>
          )
        }
      />
      <PageBody>
        {isLoading && <SkeletonText lines={4} />}
        {!isLoading && !graph && (
          <EmptyState title="No architecture graph yet">
            Generate one to map the services, modules and databases. It takes about ten seconds.
          </EmptyState>
        )}
        {graph && (
          <>
            <ArchGraph graph={graph} />
            <ul aria-label="Shape key" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-fog">
              {Object.entries(TYPE_STYLE).map(([type, t]) => (
                <li key={type} className="flex items-center gap-2">
                  <span aria-hidden="true" className="inline-block h-4 w-6 bg-asphalt" style={t.style} />
                  {t.label}
                </li>
              ))}
            </ul>

            <section aria-labelledby="parts-title" className="mt-10 max-w-[60rem]">
              <h2 id="parts-title" className="text-[1.25rem] font-bold text-chalk">Parts of the system</h2>
              <ul className="mt-3">
                {nodes.map((n) => {
                  const out = edges.filter((e) => e.source === n.id)
                  return (
                    <li key={n.id} className="grid gap-1 border-b border-kerb py-4 first:border-t md:grid-cols-[14rem_1fr] md:gap-6">
                      <div>
                        <p className="font-bold text-chalk">{n.label}</p>
                        <p className="text-sm text-fog">{TYPE_STYLE[n.type]?.label ?? n.type}</p>
                      </div>
                      <div className="min-w-0">
                        {n.description && <p className="text-chalk">{n.description}</p>}
                        {out.length > 0 && (
                          <p className="mt-1 text-fog">
                            {out.map((e) => `${e.label || "uses"} ${nameOf(e.target)}`).join("; ")}
                          </p>
                        )}
                        {n.files && n.files.length > 0 && (
                          <p className="mt-1 break-all font-mono text-[0.8125rem] text-route">{n.files.join(", ")}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          </>
        )}
      </PageBody>
    </div>
  )
}
