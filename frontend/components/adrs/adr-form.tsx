"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import type { Adr } from "@/types"

interface AdrFormProps {
  repoId: string
  initial?: Partial<Adr>
  adrId?: string
}

const STATUSES = ["proposed", "accepted", "deprecated", "superseded"]

export function AdrForm({ repoId, initial, adrId }: AdrFormProps) {
  const router = useRouter()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    title:        initial?.title ?? "",
    status:       initial?.status ?? "proposed",
    context:      initial?.context ?? "",
    decision:     initial?.decision ?? "",
    consequences: initial?.consequences ?? "",
    linked_files: (initial?.linked_files ?? []).join("\n"),
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const mutation = useMutation({
    mutationFn: () => {
      const body = {
        ...form,
        linked_files: form.linked_files.split("\n").map((s) => s.trim()).filter(Boolean),
      }
      return adrId
        ? apiFetch<Adr>(`/repos/${repoId}/adrs/${adrId}`, { method: "PATCH", body: JSON.stringify(body) })
        : apiFetch<Adr>(`/repos/${repoId}/adrs`, { method: "POST", body: JSON.stringify(body) })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adrs", repoId] })
      router.push(`/dashboard/repos/${repoId}/adrs`)
    },
  })

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
      className="space-y-5 px-5 py-5"
    >
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">Title</label>
        <input
          className="w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">Status</label>
        <select
          className="w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 text-sm text-zinc-200 focus:border-white/[0.15] focus:outline-none"
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">Context — what is the situation?</label>
        <textarea
          className="w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none min-h-[80px]"
          value={form.context}
          onChange={(e) => set("context", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">Decision — what did we decide?</label>
        <textarea
          className="w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none min-h-[80px]"
          value={form.decision}
          onChange={(e) => set("decision", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">Consequences — what are the trade-offs?</label>
        <textarea
          className="w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none min-h-[80px]"
          value={form.consequences}
          onChange={(e) => set("consequences", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">Linked files (one per line)</label>
        <textarea
          className="w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 font-mono text-xs text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none min-h-[60px]"
          value={form.linked_files}
          onChange={(e) => set("linked_files", e.target.value)}
          placeholder="src/auth/middleware.ts"
        />
      </div>

      {mutation.isError && (
        <p className="text-xs text-red-500">{(mutation.error as Error).message}</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending || !form.title.trim()}
        className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-50"
      >
        {mutation.isPending ? "Saving…" : adrId ? "Save changes" : "Create ADR"}
      </button>
    </form>
  )
}
