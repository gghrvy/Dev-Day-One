"use client"

import { use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Radio } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { ApiTable } from "@/components/api-intel/api-table"
import type { ApiInventoryItem } from "@/types"

export default function ApisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const qc = useQueryClient()

  const { data: apis = [], isLoading } = useQuery({
    queryKey: ["apis", id],
    queryFn: () => apiFetch<ApiInventoryItem[]>(`/repos/${id}/apis`),
  })

  const scan = useMutation({
    mutationFn: () => apiFetch(`/repos/${id}/apis/scan`, { method: "POST" }),
    onSuccess: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ["apis", id] }), 8000)
    },
  })

  const action = (
    <button
      onClick={() => scan.mutate()}
      disabled={scan.isPending}
      className="flex items-center gap-1.5 rounded-md bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
    >
      <Radio className="h-3 w-3" />
      {scan.isPending ? "Scanning…" : apis.length ? "Re-scan" : "Scan APIs"}
    </button>
  )

  return (
    <div>
      <PageHeader
        title="API Intelligence"
        meta={apis.length ? `${apis.length} APIs found` : undefined}
        action={action}
      />
      <div className="px-5 py-5">
        {isLoading && <p className="text-sm text-zinc-600">Loading…</p>}
        {!isLoading && apis.length === 0 && (
          <div className="py-10 text-center">
            <Radio className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-600">
              No APIs inventoried yet. Click &quot;Scan APIs&quot; to detect all internal and external APIs used in this codebase.
            </p>
          </div>
        )}
        {apis.length > 0 && <ApiTable items={apis} />}
      </div>
    </div>
  )
}
