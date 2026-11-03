"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { IS_DEMO } from "@/lib/demo"
import { formatDate } from "@/lib/format"
import { PageHeader } from "@/components/layout/page-header"
import { PageBody, EmptyState } from "@/components/layout/page-body"
import { repoHref } from "@/components/layout/nav-data"
import { RouteLine, RouteStation } from "@/components/route/route-line"
import { IndexingProgress } from "@/components/repos/indexing-progress"
import { Button } from "@/components/ui/button"
import { SkeletonText } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { Modal } from "@/components/ui/modal"
import type { Repository } from "@/types"

const SUGGESTED_ROUTE = [
  { segment: "ask", title: "Ask a question", body: "Start with where requests are authenticated, then follow the cited files." },
  { segment: "architecture", title: "Look at the architecture", body: "See the main parts and which ones call each other." },
  { segment: "adrs", title: "Read the decisions", body: "Why the code is built the way it is." },
  { segment: "impact", title: "Check a change before making it", body: "Which files a proposed change would touch." },
]

export default function RepoOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()
  const { toast } = useToast()
  const [showDelete, setShowDelete] = useState(false)

  const { data: repo, isLoading } = useQuery({
    queryKey: ["repo", id],
    queryFn: () => apiFetch<Repository>(`/repos/${id}`),
  })

  const deleteRepo = useMutation({
    mutationFn: () => apiFetch(`/repos/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repos"] })
      toast("Repository removed.", "success")
      router.push("/dashboard/repos")
    },
  })

  if (isLoading) {
    return (
      <PageBody>
        <SkeletonText lines={3} />
      </PageBody>
    )
  }

  if (!repo) {
    return (
      <PageBody>
        <EmptyState title="This repository isn't available">Pick one from All repositories.</EmptyState>
      </PageBody>
    )
  }

  return (
    <div>
      <PageHeader
        title={repo.name}
        description={repo.description ?? undefined}
        action={
          !IS_DEMO && (
            <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
              Remove repository
            </Button>
          )
        }
      />

      <PageBody className="grid gap-10 lg:grid-cols-12">
        <dl className="lg:col-span-5">
          {[
            ["Repository", <span key="r" className="font-mono text-[0.9375rem]">{repo.full_name}</span>],
            ["Status", <span key="s" className={repo.indexed ? "text-route" : "text-fog"}>{repo.indexed ? "Indexed, ready for questions" : "Not indexed yet"}</span>],
            ["Last indexed", repo.indexed_at ? formatDate(repo.indexed_at) : "Never"],
          ].map(([label, value]) => (
            <div key={label as string} className="grid grid-cols-[8rem_1fr] gap-4 border-b border-kerb py-3 first:border-t">
              <dt className="text-fog">{label}</dt>
              <dd className="min-w-0 break-words text-chalk">{value}</dd>
            </div>
          ))}
          {!IS_DEMO && (
            <div className="mt-6">
              <IndexingProgress repoId={repo.id} indexed={repo.indexed} />
            </div>
          )}
        </dl>

        <section aria-labelledby="route-title" className="lg:col-span-7">
          <h2 id="route-title" className="text-[1.25rem] font-bold text-chalk">
            Suggested route through this repo
          </h2>
          <RouteLine className="mt-5" aria-label="Suggested pages to visit">
            {SUGGESTED_ROUTE.map((s, i) => (
              <RouteStation key={s.segment} index={i} tone="muted" title={s.title} href={repoHref(repo.id, s.segment)}>
                {s.body}
              </RouteStation>
            ))}
          </RouteLine>
        </section>
      </PageBody>

      <Modal open={showDelete} onClose={() => setShowDelete(false)}>
        <div role="dialog" aria-modal="true" aria-labelledby="remove-title" className="w-[min(22rem,calc(100vw-2rem))] rounded-[var(--radius-panel)] border border-kerb bg-asphalt p-5">
          <p id="remove-title" className="font-bold text-chalk">Remove this repository?</p>
          <p className="mt-1 text-sm text-fog">
            This deletes <span className="font-mono">{repo.full_name}</span> and everything indexed from it. It can&apos;t be undone.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteRepo.mutate()} disabled={deleteRepo.isPending}>
              {deleteRepo.isPending ? "Removing…" : "Remove repository"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
