"use client"

import { use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { GitFork } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { ArchGraph } from "@/components/architecture/arch-graph"
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

  const action = (
    <button
      onClick={() => analyze.mutate()}
      disabled={analyze.isPending}
      className="flex items-center gap-1.5 rounded-md bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
    >
      <GitFork className="h-3 w-3" />
      {analyze.isPending ? "Analyzing…" : graph ? "Re-analyze" : "Generate graph"}
    </button>
  )

  return (
    <div>
      <PageHeader
        title="Architecture Intelligence"
        meta={graph ? `Generated ${new Date(graph.generated_at).toLocaleDateString()}` : undefined}
        action={action}
      />
      <div className="px-5 py-5">
        {isLoading && <p className="text-sm text-zinc-600">Loading…</p>}
        {!isLoading && !graph && (
          <div className="py-10 text-center">
            <GitFork className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-600">
              No architecture map yet. Click &quot;Generate graph&quot; to auto-detect services, modules, and dependencies.
            </p>
            <p className="mt-1 text-xs text-zinc-700">Takes ~10 seconds for the AI to analyze the codebase.</p>
          </div>
        )}
        {graph && <ArchGraph graph={graph} />}
        {graph && (
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { color: "bg-indigo-500", label: "Service" },
              { color: "bg-amber-500", label: "Module" },
              { color: "bg-emerald-500", label: "Database" },
              { color: "bg-pink-500", label: "External" },
              { color: "bg-purple-500", label: "Layer" },
            ].map((l) => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className={`h-2 w-2 rounded-full ${l.color}`} />
                {l.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
