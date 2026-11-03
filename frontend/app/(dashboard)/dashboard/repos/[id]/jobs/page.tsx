"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { formatDateTime } from "@/lib/format"
import { PageHeader } from "@/components/layout/page-header"
import { PageBody, EmptyState } from "@/components/layout/page-body"
import { SkeletonList } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface Job {
  id: string
  status: string
  progress: number
  error: string | null
  created_at: string | null
}

const STATUS: Record<string, { label: string; variant: "route" | "alert" | "signal" | "muted" }> = {
  done: { label: "Finished", variant: "route" },
  failed: { label: "Failed", variant: "alert" },
  running: { label: "Running", variant: "signal" },
  pending: { label: "Waiting", variant: "muted" },
}

export default function JobsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", id],
    queryFn: () => apiFetch<Job[]>(`/repos/${id}/jobs`),
  })

  return (
    <div>
      <PageHeader
        title="History"
        description="Every time this repository was indexed, newest first."
        meta={jobs.length ? `${jobs.length} runs` : undefined}
      />
      <PageBody>
        {isLoading && <SkeletonList rows={3} />}
        {!isLoading && jobs.length === 0 && (
          <EmptyState title="No indexing runs yet">Index the repository from its Overview page.</EmptyState>
        )}
        {jobs.length > 0 && (
          <ul className="max-w-[60rem]">
            {jobs.map((job) => {
              const s = STATUS[job.status] ?? STATUS.pending
              return (
                <li key={job.id} className="flex flex-wrap items-start justify-between gap-3 border-b border-kerb py-4 first:border-t">
                  <div className="min-w-0">
                    <p className="text-chalk">{formatDateTime(job.created_at) || "Start time unknown"}</p>
                    {job.error && <p className="mt-1 break-words text-sm text-alert">{job.error}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {job.status !== "done" && <span className="text-sm text-fog">{job.progress}%</span>}
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </PageBody>
    </div>
  )
}
