"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { PageHeader } from "@/components/layout/page-header"
import { IndexingProgress } from "@/components/repos/indexing-progress"
import { useToast } from "@/components/ui/toast"
import { Modal } from "@/components/ui/modal"
import type { Repository } from "@/types"

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
    onError: () => toast("Failed to delete repository.", "error"),
  })

  if (isLoading) {
    return (
      <div className="space-y-4 px-5 pt-5">
        <div className="h-5 w-48 rounded bg-zinc-800" />
        <div className="h-3 w-64 rounded bg-zinc-800" />
      </div>
    )
  }

  if (!repo) {
    return (
      <div className="px-5 pt-5">
        <p className="text-sm text-zinc-500">Repository not found.</p>
      </div>
    )
  }

  const indexedAtMeta = repo.indexed_at
    ? `indexed ${new Date(repo.indexed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : undefined

  return (
    <div>
      <PageHeader
        title={repo.name}
        meta={indexedAtMeta}
        action={
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 rounded-md border border-red-500/20 px-2.5 py-1.5 text-[11px] text-red-400 hover:border-red-500/40 hover:text-red-300"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </button>
        }
      />

      <div className="px-5 py-5 space-y-6">
        {/* Status block */}
        <div className="grid grid-cols-2 gap-px bg-white/[0.04] sm:grid-cols-3">
          <div className="bg-dawn-bg px-4 py-3">
            <div className="font-mono text-[10px] text-zinc-600">Status</div>
            <div className="mt-1 flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${repo.indexed ? "bg-emerald-500" : "bg-zinc-600"}`} />
              <span className={`font-mono text-[12px] ${repo.indexed ? "text-emerald-400" : "text-zinc-500"}`}>
                {repo.indexed ? "Indexed" : "Not indexed"}
              </span>
            </div>
          </div>

          <div className="bg-dawn-bg px-4 py-3">
            <div className="font-mono text-[10px] text-zinc-600">Repository</div>
            <div className="mt-1 font-mono text-[12px] text-zinc-300 truncate">{repo.full_name}</div>
          </div>

          {repo.indexed_at && (
            <div className="bg-dawn-bg px-4 py-3">
              <div className="font-mono text-[10px] text-zinc-600">Last indexed</div>
              <div className="mt-1 font-mono text-[12px] text-zinc-300">
                {new Date(repo.indexed_at).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {repo.description && (
          <p className="text-sm text-zinc-500 leading-relaxed">{repo.description}</p>
        )}

        <IndexingProgress repoId={repo.id} indexed={repo.indexed} />
      </div>

      <Modal open={showDelete} onClose={() => setShowDelete(false)}>
        <div className="w-80 rounded-xl border border-white/[0.08] bg-[#0C0C0E] p-5 shadow-2xl">
          <p className="mb-1 text-sm font-semibold text-zinc-100">Remove repository?</p>
          <p className="mb-5 text-[12px] text-zinc-500">
            This will remove <span className="font-mono text-zinc-400">{repo.full_name}</span> and all its indexed data. This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDelete(false)}
              className="flex-1 rounded-md border border-white/[0.07] py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteRepo.mutate()}
              disabled={deleteRepo.isPending}
              className="flex-1 rounded-md bg-red-500/10 py-1.5 text-[11px] font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
            >
              {deleteRepo.isPending ? "Removing…" : "Remove"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
