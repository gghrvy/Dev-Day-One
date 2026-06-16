"use client"

import { use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { AdrForm } from "@/components/adrs/adr-form"
import type { Adr } from "@/types"

export default function AdrDetailPage({ params }: { params: Promise<{ id: string; adr_id: string }> }) {
  const { id, adr_id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()

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

  if (isLoading) return <p className="px-5 py-4 text-sm text-zinc-600">Loading…</p>
  if (!adr) return <p className="px-5 py-4 text-sm text-red-500">ADR not found.</p>

  const deleteAction = (
    <button
      onClick={() => { if (confirm("Delete this ADR?")) del.mutate() }}
      className="flex items-center gap-1.5 rounded-md border border-red-500/20 px-3 py-1.5 text-[11px] text-red-400 hover:bg-red-500/10"
    >
      <Trash2 className="h-3 w-3" /> Delete
    </button>
  )

  return (
    <div>
      <PageHeader title={adr.title} meta={adr.status} action={deleteAction} />
      <AdrForm repoId={id} initial={adr} adrId={adr_id} />
    </div>
  )
}
