"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Lock, Globe } from "lucide-react"
import { apiFetch, getGithubToken } from "@/lib/api/client"
import type { Repository } from "@/types"

export function ConnectRepo() {
  const [fullName, setFullName] = useState("")
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (full_name: string) => {
      const githubToken = await getGithubToken()
      return apiFetch<Repository>("/repos", {
        method: "POST",
        body: JSON.stringify({ full_name }),
        headers: githubToken ? { "X-Github-Token": githubToken } : {},
      })
    },
    onSuccess: (repo) => {
      queryClient.invalidateQueries({ queryKey: ["repos"] })
      router.push(`/dashboard/repos/${repo.id}`)
    },
  })

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
      {/* Form column */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (fullName.trim()) mutation.mutate(fullName.trim())
        }}
        className="space-y-5"
      >
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            GitHub Repository
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="owner/repo"
            className="mt-2 w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 font-mono text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none"
          />
          <p className="mt-2 font-mono text-[10px] text-zinc-700">e.g. vercel/next.js or your-org/private-repo</p>
        </div>

        {mutation.isError && (
          <p className="font-mono text-[11px] text-red-500">{(mutation.error as Error).message}</p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending || !fullName.trim()}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? "Connecting…" : "Connect repository"}
        </button>
      </form>

      {/* Info column */}
      <div className="hidden space-y-5 border-l border-white/[0.04] pl-8 lg:block">
        <div>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">What happens next</div>
          <ol className="space-y-3">
            {[
              "We fetch the repository metadata from GitHub.",
              "You trigger indexing — we chunk and embed the code.",
              "Ask the AI anything about your codebase.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex-shrink-0 font-mono text-[10px] text-amber-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-zinc-500">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="border-t border-white/[0.04] pt-5 space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Globe className="h-3.5 w-3.5 text-emerald-500" />
            Public repos — always supported
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Lock className="h-3.5 w-3.5 text-amber-500" />
            Private repos — sign in with GitHub to unlock
          </div>
        </div>
      </div>
    </div>
  )
}
