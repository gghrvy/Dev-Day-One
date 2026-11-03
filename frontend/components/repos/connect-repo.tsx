"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch, getGithubToken } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { RouteLine, RouteStation } from "@/components/route/route-line"
import type { Repository } from "@/types"

const NEXT_STEPS = [
  { title: "Connect", body: "We read the repository's name and description from GitHub." },
  { title: "Index", body: "Start indexing from the repo's Overview page. Files are split up and embedded." },
  { title: "Ask", body: "Ask questions and get answers that cite the files." },
]

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
    <div className="grid gap-12 lg:grid-cols-12">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (fullName.trim()) mutation.mutate(fullName.trim())
        }}
        className="space-y-5 lg:col-span-6"
      >
        <Field label="GitHub repository" hint="owner/repo, for example vercel/next.js. Private repositories need GitHub sign-in.">
          {(p) => (
            <input
              {...p}
              className={`${p.className} font-mono`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="owner/repo"
              autoComplete="off"
              spellCheck={false}
            />
          )}
        </Field>
        <Button type="submit" disabled={mutation.isPending || !fullName.trim()}>
          {mutation.isPending ? "Connecting…" : "Connect repository"}
        </Button>
      </form>

      <section aria-labelledby="next-title" className="lg:col-span-6">
        <h2 id="next-title" className="text-[1.25rem] font-bold text-chalk">What happens next</h2>
        <RouteLine className="mt-4" aria-label="Steps after connecting">
          {NEXT_STEPS.map((s, i) => (
            <RouteStation key={s.title} index={i} tone={i === 0 ? "signal" : "muted"} title={s.title}>
              {s.body}
            </RouteStation>
          ))}
        </RouteLine>
      </section>
    </div>
  )
}
