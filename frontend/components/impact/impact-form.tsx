"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ImpactAnalysis } from "@/types"

const RISK: Record<string, { label: string; plate: string; text: string }> = {
  high: { label: "High risk", plate: "border-alert bg-alert text-graphite", text: "text-alert" },
  medium: { label: "Medium risk", plate: "border-signal bg-signal text-signal-ink", text: "text-signal" },
  low: { label: "Low risk", plate: "border-route text-route", text: "text-route" },
}

export function ImpactResult({ analysis }: { analysis: ImpactAnalysis }) {
  const { result } = analysis
  const r = RISK[result.risk_level] ?? RISK.low
  return (
    <article aria-labelledby={`impact-${analysis.id}`} className="border-t border-kerb py-6">
      <p className="text-sm text-fog">{formatDate(analysis.created_at)}</p>
      <h2 id={`impact-${analysis.id}`} className="mt-1 text-[1.25rem] font-bold text-chalk">
        {analysis.query}
      </h2>
      <div className="mt-3 flex flex-wrap items-start gap-4">
        {/* The risk level is a sign plate: the one thing to read first */}
        <span className={cn("rounded-[var(--radius-control)] border-2 px-3 py-1 font-extrabold", r.plate)}>{r.label}</span>
        <p className="min-w-0 flex-1 basis-[28ch] text-chalk">{result.summary}</p>
      </div>
      {result.affected_files.length > 0 && (
        <ul aria-label="Affected files" className="mt-5">
          {result.affected_files.map((f) => {
            const fr = RISK[f.risk] ?? RISK.low
            return (
              <li key={f.path} className="grid gap-1 border-b border-kerb py-3 md:grid-cols-[1fr_7rem] md:gap-6">
                <div className="min-w-0">
                  <p className="break-all font-mono text-[0.875rem] text-route">{f.path}</p>
                  <p className="mt-0.5 text-fog">{f.reason}</p>
                </div>
                <p className={cn("text-sm font-semibold md:text-right", fr.text)}>{fr.label}</p>
              </li>
            )
          })}
        </ul>
      )}
    </article>
  )
}

export function ImpactForm({ repoId }: { repoId: string }) {
  const [query, setQuery] = useState("")
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<ImpactAnalysis>(`/repos/${repoId}/impact`, {
        method: "POST",
        body: JSON.stringify({ query }),
      }),
    onSuccess: () => {
      setQuery("")
      qc.invalidateQueries({ queryKey: ["impact", repoId] })
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (query.trim()) mutation.mutate()
      }}
      className="max-w-[48rem]"
    >
      <label htmlFor="impact-query" className="font-bold text-chalk">Describe a change</label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Input
          id="impact-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Replace the auth middleware with API keys"
        />
        <Button type="submit" disabled={mutation.isPending || !query.trim()}>
          {mutation.isPending ? "Analysing…" : "Analyse impact"}
        </Button>
      </div>
    </form>
  )
}
