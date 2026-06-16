"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import type { KnowledgeEntry } from "@/types"

export function KnowledgeForm({
  repoId,
  initial,
  entryId,
}: {
  repoId: string
  initial?: Partial<KnowledgeEntry>
  entryId?: string
}) {
  const router = useRouter()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    title:     initial?.title ?? "",
    body:      initial?.body ?? "",
    file_path: initial?.file_path ?? "",
    tags:      (initial?.tags ?? []).join(", "),
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const mutation = useMutation({
    mutationFn: () => {
      const body = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        file_path: form.file_path || null,
      }
      return entryId
        ? apiFetch<KnowledgeEntry>(`/repos/${repoId}/knowledge/${entryId}`, {
            method: "PATCH",
            body: JSON.stringify(body),
          })
        : apiFetch<KnowledgeEntry>(`/repos/${repoId}/knowledge`, {
            method: "POST",
            body: JSON.stringify(body),
          })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge", repoId] })
      router.push(`/dashboard/repos/${repoId}/knowledge`)
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
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">Why — the rationale or context</label>
        <textarea
          className="w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none min-h-[120px]"
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          placeholder="Why was this decision made? What should future devs know?"
        />
      </div>
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">Linked file (optional)</label>
        <input
          className="w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 font-mono text-xs text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none"
          value={form.file_path}
          onChange={(e) => set("file_path", e.target.value)}
          placeholder="src/auth/middleware.ts"
        />
      </div>
      <div>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">Tags (comma separated)</label>
        <input
          className="w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none"
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="auth, security, performance"
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
        {mutation.isPending ? "Saving…" : entryId ? "Save changes" : "Add knowledge"}
      </button>
    </form>
  )
}
