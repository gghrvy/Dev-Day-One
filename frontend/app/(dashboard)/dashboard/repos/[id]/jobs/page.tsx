"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { SkeletonList } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface Job {
  id: string
  status: string
  progress: number
  error: string | null
  created_at: string | null
}

const STATUS_STYLE: Record<string, string> = {
  done:    "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  failed:  "text-red-400 border-red-500/20 bg-red-500/10",
  running: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  pending: "text-zinc-400 border-zinc-500/20 bg-zinc-500/10",
}

export default function JobsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", id],
    queryFn: () => apiFetch<Job[]>(`/repos/${id}/jobs`),
  })

  return (
    <div>
      <PageHeader title="Index History" meta={jobs.length ? `${jobs.length} runs` : undefined} />
      <div className="mt-2">
        {isLoading && <SkeletonList rows={4} />}
        {!isLoading && jobs.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-zinc-600">No indexing jobs yet.</p>
        )}
        {jobs.map((job, i) => (
          <div
            key={job.id}
            className={cn("flex items-center justify-between border-b border-white/[0.04] px-5 py-3.5", i === 0 && "border-t")}
          >
            <div>
              <p className="font-mono text-[11px] text-zinc-400">
                {job.created_at ? new Date(job.created_at).toLocaleString() : "—"}
              </p>
              {job.error && <p className="mt-0.5 font-mono text-[10px] text-red-400">{job.error}</p>}
            </div>
            <div className="flex items-center gap-3">
              {job.status === "done" && (
                <span className="font-mono text-[10px] text-zinc-600">{job.progress}%</span>
              )}
              {(job.status === "running" || job.status === "pending") && (
                <span className="font-mono text-[10px] text-zinc-600">{job.progress}%</span>
              )}
              <span className={cn("rounded border px-2 py-0.5 font-mono text-[9px] capitalize", STATUS_STYLE[job.status] ?? STATUS_STYLE.pending)}>
                {job.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
