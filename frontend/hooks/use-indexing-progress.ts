"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { IndexingJob } from "@/types"

export function useIndexingProgress(repoId: string) {
  const [job, setJob] = useState<IndexingJob | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Pick up an in-flight job on mount (progress survives refresh)
    supabase
      .from("indexing_jobs")
      .select("*")
      .eq("repo_id", repoId)
      .order("started_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) setJob(data[0] as IndexingJob)
      })

    const channel = supabase
      .channel(`indexing:${repoId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "indexing_jobs",
          filter: `repo_id=eq.${repoId}`,
        },
        (payload) => setJob(payload.new as IndexingJob)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [repoId])

  return job
}
