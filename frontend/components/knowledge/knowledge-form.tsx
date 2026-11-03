"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
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
    title: initial?.title ?? "",
    body: initial?.body ?? "",
    file_path: initial?.file_path ?? "",
    tags: (initial?.tags ?? []).join(", "),
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
        ? apiFetch<KnowledgeEntry>(`/repos/${repoId}/knowledge/${entryId}`, { method: "PATCH", body: JSON.stringify(body) })
        : apiFetch<KnowledgeEntry>(`/repos/${repoId}/knowledge`, { method: "POST", body: JSON.stringify(body) })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge", repoId] })
      router.push(`/dashboard/repos/${repoId}/knowledge`)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate()
      }}
      className="max-w-[48rem] space-y-6"
    >
      <Field label="Title">
        {(p) => <input {...p} value={form.title} onChange={(e) => set("title", e.target.value)} required />}
      </Field>
      <Field label="Note" hint="What should the next person to touch this code know?">
        {(p) => <textarea {...p} rows={5} value={form.body} onChange={(e) => set("body", e.target.value)} />}
      </Field>
      <Field label="Linked file" hint="Optional.">
        {(p) => (
          <input
            {...p}
            className={`${p.className} font-mono text-[0.875rem]`}
            value={form.file_path}
            onChange={(e) => set("file_path", e.target.value)}
            placeholder="backend/auth.py"
          />
        )}
      </Field>
      <Field label="Tags" hint="Separate with commas.">
        {(p) => <input {...p} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="auth, security" />}
      </Field>
      <Button type="submit" disabled={mutation.isPending || !form.title.trim()}>
        {mutation.isPending ? "Saving…" : entryId ? "Save changes" : "Add note"}
      </Button>
    </form>
  )
}
