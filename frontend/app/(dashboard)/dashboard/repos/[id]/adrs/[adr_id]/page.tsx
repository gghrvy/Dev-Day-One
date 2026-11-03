"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { IS_DEMO } from "@/lib/demo"
import { formatDate } from "@/lib/format"
import { PageHeader } from "@/components/layout/page-header"
import { PageBody, EmptyState } from "@/components/layout/page-body"
import { AdrForm } from "@/components/adrs/adr-form"
import { ADR_STATUS } from "@/components/adrs/adr-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { SkeletonText } from "@/components/ui/skeleton"
import type { Adr } from "@/types"

export default function AdrDetailPage({ params }: { params: Promise<{ id: string; adr_id: string }> }) {
  const { id, adr_id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: adr, isLoading } = useQuery({
    queryKey: ["adr", adr_id],
    queryFn: () => apiFetch<Adr>(`/repos/${id}/adrs/${adr_id}`),
  })

  const del = useMutation({
    mutationFn: () => apiFetch(`/repos/${id}/adrs/${adr_id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adrs", id] })
      router.push(`/dashboard/repos/${id}/adrs`)
    },
  })

  const back = (
    <Link href={`/dashboard/repos/${id}/adrs`} className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] text-sm text-fog hover:text-chalk">
      All decisions
    </Link>
  )

  if (isLoading) return <PageBody><SkeletonText lines={5} /></PageBody>
  if (!adr) {
    return (
      <PageBody>
        <EmptyState title="This decision record doesn't exist">{back}</EmptyState>
      </PageBody>
    )
  }

  const status = ADR_STATUS[adr.status] ?? ADR_STATUS.draft

  return (
    <div>
      <PageHeader
        title={adr.title}
        meta={`Recorded ${formatDate(adr.created_at)}`}
        action={
          !IS_DEMO && (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditing((e) => !e)}>
                {editing ? "Cancel editing" : "Edit"}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>Delete</Button>
            </>
          )
        }
      />
      <PageBody>
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {back}
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        {editing ? (
          <AdrForm repoId={id} initial={adr} adrId={adr_id} />
        ) : (
          <article className="max-w-[68ch] space-y-8">
            {[
              ["Context", adr.context],
              ["Decision", adr.decision],
              ["Consequences", adr.consequences],
            ].map(([title, body]) =>
              body ? (
                <section key={title}>
                  <h2 className="text-[1.25rem] font-bold text-chalk">{title}</h2>
                  <p className="mt-2 whitespace-pre-wrap text-chalk">{body}</p>
                </section>
              ) : null
            )}
            {adr.linked_files.length > 0 && (
              <section>
                <h2 className="text-[1.25rem] font-bold text-chalk">Linked files</h2>
                <ul className="mt-2 space-y-1">
                  {adr.linked_files.map((f) => (
                    <li key={f} className="break-all font-mono text-[0.875rem] text-route">{f}</li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        )}
      </PageBody>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <div role="dialog" aria-modal="true" aria-labelledby="del-title" className="w-[min(22rem,calc(100vw-2rem))] rounded-[var(--radius-panel)] border border-kerb bg-asphalt p-5">
          <p id="del-title" className="font-bold text-chalk">Delete this decision record?</p>
          <p className="mt-1 text-sm text-fog">It can&apos;t be undone.</p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => del.mutate()} disabled={del.isPending}>
              {del.isPending ? "Deleting…" : "Delete record"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
