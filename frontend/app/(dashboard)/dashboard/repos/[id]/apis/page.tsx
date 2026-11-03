"use client"

import { use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { IS_DEMO } from "@/lib/demo"
import { PageHeader } from "@/components/layout/page-header"
import { PageBody, EmptyState } from "@/components/layout/page-body"
import { ApiTable } from "@/components/api-intel/api-table"
import { Button } from "@/components/ui/button"
import { SkeletonList } from "@/components/ui/skeleton"
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

  return (
    <div>
      <PageHeader
        title="APIs"
        description="Every internal route and external service the code talks to."
        meta={apis.length ? `${apis.length} found` : undefined}
        action={
          !IS_DEMO && (
            <Button onClick={() => scan.mutate()} disabled={scan.isPending}>
              {scan.isPending ? "Scanning…" : apis.length ? "Scan again" : "Scan for APIs"}
            </Button>
          )
        }
      />
      <PageBody>
        {isLoading && <SkeletonList rows={5} />}
        {!isLoading && apis.length === 0 && (
          <EmptyState title="No APIs found yet">Scan the code to list its routes and the services it calls.</EmptyState>
        )}
        {apis.length > 0 && <ApiTable items={apis} />}
      </PageBody>
    </div>
  )
}
