"use client"

import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { IS_DEMO } from "@/lib/demo"
import { formatDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import type { Adr } from "@/types"

export const ADR_STATUS: Record<string, { label: string; variant: "route" | "signal" | "muted" | "alert" }> = {
  proposed: { label: "Proposed", variant: "signal" },
  accepted: { label: "Accepted", variant: "route" },
  deprecated: { label: "Deprecated", variant: "alert" },
  superseded: { label: "Superseded", variant: "muted" },
  draft: { label: "Draft", variant: "muted" },
}

const NEXT: Record<string, { status: string; action: string }> = {
  draft: { status: "proposed", action: "Propose" },
  proposed: { status: "accepted", action: "Accept" },
  accepted: { status: "deprecated", action: "Deprecate" },
}

export function AdrCard({ adr, repoId }: { adr: Adr; repoId: string }) {
  const qc = useQueryClient()
  const { toast } = useToast()
  const next = NEXT[adr.status]
  const status = ADR_STATUS[adr.status] ?? ADR_STATUS.draft

  const advance = useMutation({
    mutationFn: (s: string) =>
      apiFetch(`/repos/${repoId}/adrs/${adr.id}`, { method: "PATCH", body: JSON.stringify({ status: s }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adrs", repoId] })
      toast(`Record marked ${next ? next.status : "updated"}.`, "success")
    },
  })

  return (
    <li className="flex flex-wrap items-start justify-between gap-3 border-b border-kerb py-4 first:border-t">
      <div className="min-w-0 flex-1 basis-[28ch]">
        <Link
          href={`/dashboard/repos/${repoId}/adrs/${adr.id}`}
          className="rounded-[var(--radius-control)] font-bold text-chalk underline-offset-4 hover:text-signal hover:underline"
        >
          {adr.title}
        </Link>
        {adr.decision && <p className="mt-1 line-clamp-2 text-fog">{adr.decision}</p>}
        <p className="mt-1 text-sm text-fog">{formatDate(adr.created_at)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={status.variant}>{status.label}</Badge>
        {!IS_DEMO && next && (
          <Button variant="outline" size="sm" onClick={() => advance.mutate(next.status)} disabled={advance.isPending}>
            {next.action}
          </Button>
        )}
      </div>
    </li>
  )
}
