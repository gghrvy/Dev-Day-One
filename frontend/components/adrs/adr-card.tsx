"use client"

import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api/client"
import { useToast } from "@/components/ui/toast"
import type { Adr } from "@/types"

const STATUS_STYLES: Record<string, string> = {
  draft:      "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  proposed:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  accepted:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  deprecated: "bg-red-500/10 text-red-400 border-red-500/20",
}

const STATUS_FLOW: Record<string, string> = {
  draft:      "proposed",
  proposed:   "accepted",
  accepted:   "deprecated",
  deprecated: "draft",
}

const STATUS_LABEL: Record<string, string> = {
  draft:      "→ Propose",
  proposed:   "→ Accept",
  accepted:   "→ Deprecate",
  deprecated: "→ Draft",
}

export function AdrCard({ adr, repoId }: { adr: Adr; repoId: string }) {
  const qc = useQueryClient()
  const { toast } = useToast()

  const advance = useMutation({
    mutationFn: (status: string) =>
      apiFetch(`/repos/${repoId}/adrs/${adr.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adrs", repoId] })
      toast("ADR status updated.", "success")
    },
  })

  return (
    <div className="group flex items-start justify-between border-b border-white/[0.04] px-5 py-4 transition-colors hover:bg-white/[0.02]">
      <Link href={`/dashboard/repos/${repoId}/adrs/${adr.id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-100 group-hover:text-white">
          {adr.title}
        </p>
        {adr.decision && (
          <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{adr.decision}</p>
        )}
        <p className="mt-1 font-mono text-[10px] text-zinc-700">
          {new Date(adr.created_at).toLocaleDateString()}
        </p>
      </Link>

      <div className="ml-4 flex shrink-0 items-center gap-2">
        <span className={cn("rounded border px-2 py-0.5 font-mono text-[10px] capitalize", STATUS_STYLES[adr.status] ?? STATUS_STYLES.draft)}>
          {adr.status}
        </span>
        <button
          onClick={() => advance.mutate(STATUS_FLOW[adr.status] ?? "proposed")}
          disabled={advance.isPending}
          title={STATUS_LABEL[adr.status]}
          className="rounded border border-white/[0.06] px-2 py-0.5 font-mono text-[9px] text-zinc-600 hover:border-white/[0.12] hover:text-zinc-300 disabled:opacity-40"
        >
          {advance.isPending ? "…" : <ChevronRight className="h-3 w-3" />}
        </button>
      </div>
    </div>
  )
}
