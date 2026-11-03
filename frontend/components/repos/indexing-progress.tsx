"use client"

import { useEffect, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch, getGithubToken } from "@/lib/api/client"
import { useIndexingProgress } from "@/hooks/use-indexing-progress"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"

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
      toast("Indexing finished. The repository is ready for questions.", "success")
    }
    if (prevStatus.current === "running" && job?.status === "failed") {
      toast(`Indexing failed: ${job.error ?? "unknown error"}`, "error")
    }
    prevStatus.current = job?.status
  }, [job?.status, job?.error, queryClient, repoId, toast])

  const running = job?.status === "running" || job?.status === "pending" || start.isPending

  return (
    <section aria-labelledby="indexing-title" className="border-y border-kerb py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="indexing-title" className="font-bold text-chalk">Indexing</h2>
        <Button size="sm" disabled={running} onClick={() => start.mutate()}>
          {running ? "Indexing…" : indexed ? "Index again" : "Index repository"}
        </Button>
      </div>
      {running && job && (
        <div className="mt-3">
          <div className="h-1 w-full bg-kerb" role="progressbar" aria-valuenow={job.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Indexing progress">
            <div className="h-full bg-signal transition-[width] duration-300" style={{ width: `${job.progress}%` }} />
          </div>
          <p className="mt-1.5 text-sm text-fog">{job.progress}% done</p>
        </div>
      )}
      {job?.status === "failed" && <p className="mt-3 text-alert">Indexing failed: {job.error}</p>}
      {job?.status === "done" && <p className="mt-3 text-route">Indexing finished.</p>}
    </section>
  )
}
