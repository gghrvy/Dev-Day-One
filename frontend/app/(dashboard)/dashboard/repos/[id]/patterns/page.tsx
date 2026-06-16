"use client"

import { use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Cpu } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { PatternCard } from "@/components/patterns/pattern-card"
import { SkeletonCards } from "@/components/ui/skeleton"
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

  const action = (
    <button
      onClick={() => detect.mutate()}
      disabled={detect.isPending}
      className="flex items-center gap-1.5 rounded-md bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
    >
      <Cpu className="h-3 w-3" />
      {detect.isPending ? "Detecting…" : detection ? "Re-detect" : "Detect patterns"}
    </button>
  )

  return (
    <div>
      <PageHeader
        title="Pattern Detection"
        meta={detection ? `${detection.patterns.length} patterns found` : undefined}
        action={action}
      />
      <div className="px-5 py-5">
        {isLoading && <SkeletonCards count={4} />}

        {!isLoading && !detection && (
          <div className="py-10 text-center">
            <Cpu className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-600">No patterns detected yet. Click &quot;Detect patterns&quot; to analyze this codebase.</p>
          </div>
        )}

        {detection && (
          <>
            {detection.raw_analysis && (
              <div className="mb-6 rounded-xl border border-white/[0.06] bg-[#0C0C0E] p-5">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600">Analysis</p>
                <p className="text-sm leading-relaxed text-zinc-400">{detection.raw_analysis}</p>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {detection.patterns.map((p) => <PatternCard key={p.name} pattern={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
