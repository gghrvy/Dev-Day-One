"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Zap } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import type { ImpactAnalysis } from "@/types"

const RISK_STYLES: Record<string, string> = {
  high:   "text-red-400 border-red-500/20 bg-red-500/10",
  medium: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  low:    "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
}

export function ImpactForm({ repoId }: { repoId: string }) {
  const [query, setQuery] = useState("")

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<ImpactAnalysis>(`/repos/${repoId}/impact`, {
        method: "POST",
        body: JSON.stringify({ query }),
      }),
  })

  const result = mutation.data?.result

  return (
    <div className="space-y-5 px-5 py-5">
      <form
        onSubmit={(e) => { e.preventDefault(); if (query.trim()) mutation.mutate() }}
        className="flex gap-2"
      >
        <input
          className="w-full flex-1 rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "What breaks if I change the auth middleware?"'
        />
        <button
          type="submit"
          disabled={mutation.isPending || !query.trim()}
          className="flex items-center gap-1.5 rounded-md bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          <Zap className="h-3.5 w-3.5" />
          {mutation.isPending ? "Analyzing…" : "Analyze"}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={cn("rounded border px-2 py-0.5 font-mono text-[11px]", RISK_STYLES[result.risk_level])}>
              {result.risk_level} risk
            </span>
            <p className="text-sm text-zinc-400">{result.summary}</p>
          </div>

          {result.affected_files.length > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-[#0C0C0E]">
              <div className="border-b border-white/[0.04] px-4 py-2.5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Affected files</p>
              </div>
              {result.affected_files.map((f) => (
                <div
                  key={f.path}
                  className="flex items-start gap-3 border-b border-white/[0.04] px-4 py-3 last:border-0"
                >
                  <span className={cn("mt-0.5 flex-shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px]", RISK_STYLES[f.risk])}>
                    {f.risk}
                  </span>
                  <div>
                    <p className="font-mono text-[12px] text-zinc-200">{f.path}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{f.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
