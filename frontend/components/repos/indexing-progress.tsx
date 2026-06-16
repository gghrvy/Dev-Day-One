"use client"

import { useEffect, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch, getGithubToken } from "@/lib/api/client"
import { useIndexingProgress } from "@/hooks/use-indexing-progress"
import { useToast } from "@/components/ui/toast"

export function IndexingProgress({ repoId, indexed }: { repoId: string; indexed: boolean }) {
  const job = useIndexingProgress(repoId)
  const queryClient = useQueryClient()
  const prevStatus = useRef<string | undefined>(undefined)
  const { toast } = useToast()

  const start = useMutation({
    mutationFn: async () => {
      const githubToken = await getGithubToken()
      return apiFetch(`/repos/${repoId}/index`, {
        method: "POST",
        headers: githubToken ? { "X-Github-Token": githubToken } : {},
      })
    },
  })

  useEffect(() => {
    if (prevStatus.current === "running" && job?.status === "done") {
      queryClient.invalidateQueries({ queryKey: ["repo", repoId] })
      queryClient.invalidateQueries({ queryKey: ["repos"] })
      toast("Indexing complete — repository is ready.", "success")
    }
    if (prevStatus.current === "running" && job?.status === "failed") {
      toast(`Indexing failed: ${job.error ?? "unknown error"}`, "error")
    }
    prevStatus.current = job?.status
  }, [job?.status, job?.error, queryClient, repoId, toast])

  const running = job?.status === "running" || job?.status === "pending" || start.isPending

  return (
    <div className="border border-white/[0.05] bg-[#0C0C0E] p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-zinc-500">Indexing</span>
        <button
          disabled={running}
          onClick={() => start.mutate()}
          className="rounded bg-amber-500 px-3 py-1 font-mono text-[10px] font-semibold text-zinc-900 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? "Indexing…" : indexed ? "Re-index" : "Index repository"}
        </button>
      </div>

      {running && job && (
        <div className="mt-3 space-y-1.5">
          <div className="h-[1.5px] w-full bg-white/[0.06]">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <p className="font-mono text-[10px] text-zinc-600">
            {job.progress}% — {job.status}
          </p>
        </div>
      )}

      {job?.status === "failed" && (
        <p className="mt-3 font-mono text-[11px] text-red-500">
          Failed: {job.error}
        </p>
      )}

      {job?.status === "done" && (
        <p className="mt-3 font-mono text-[11px] text-emerald-500">Index complete</p>
      )}
    </div>
  )
}
