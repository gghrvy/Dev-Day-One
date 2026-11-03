"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import type { Adr } from "@/types"

interface AdrFormProps {
  repoId: string
  initial?: Partial<Adr>
  adrId?: string
}

const STATUSES = [
  { value: "proposed", label: "Proposed" },
  { value: "accepted", label: "Accepted" },
  { value: "deprecated", label: "Deprecated" },
  { value: "superseded", label: "Superseded" },
]

export function AdrForm({ repoId, initial, adrId }: AdrFormProps) {
  const router = useRouter()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    status: initial?.status ?? "proposed",
    context: initial?.context ?? "",
    decision: initial?.decision ?? "",
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
      if (adrId) qc.invalidateQueries({ queryKey: ["adr", adrId] })
      router.push(`/dashboard/repos/${repoId}/adrs`)
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
      <Field label="Status">
        {(p) => (
          <select {...p} value={form.status} onChange={(e) => set("status", e.target.value)}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        )}
      </Field>
      <Field label="Context" hint="What is the situation, and what forces are at play?">
        {(p) => <textarea {...p} rows={4} value={form.context} onChange={(e) => set("context", e.target.value)} />}
      </Field>
      <Field label="Decision" hint="What was decided?">
        {(p) => <textarea {...p} rows={4} value={form.decision} onChange={(e) => set("decision", e.target.value)} />}
      </Field>
      <Field label="Consequences" hint="What gets easier, and what gets harder?">
        {(p) => <textarea {...p} rows={4} value={form.consequences} onChange={(e) => set("consequences", e.target.value)} />}
      </Field>
      <Field label="Linked files" hint="One path per line.">
        {(p) => (
          <textarea
            {...p}
            rows={3}
            className={`${p.className} font-mono text-[0.875rem]`}
            value={form.linked_files}
            onChange={(e) => set("linked_files", e.target.value)}
            placeholder="backend/auth.py"
          />
        )}
      </Field>
      <Button type="submit" disabled={mutation.isPending || !form.title.trim()}>
        {mutation.isPending ? "Saving…" : adrId ? "Save changes" : "Create record"}
      </Button>
    </form>
  )
}
