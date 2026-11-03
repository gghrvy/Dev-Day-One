"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { IS_DEMO } from "@/lib/demo"
import { PageHeader } from "@/components/layout/page-header"
import { PageBody, EmptyState } from "@/components/layout/page-body"
import { RepoRow } from "@/components/repos/repo-row"
import { Button } from "@/components/ui/button"
import { SkeletonList } from "@/components/ui/skeleton"
import { controlClass } from "@/components/ui/field"
import type { Repository } from "@/types"

type SortKey = "date" | "name" | "indexed"

function sortRepos(repos: Repository[], key: SortKey): Repository[] {
  return [...repos].sort((a, b) => {
    if (key === "name") return a.name.localeCompare(b.name)
    if (key === "indexed") return (b.indexed ? 1 : 0) - (a.indexed ? 1 : 0)
    return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  })
}

export default function ReposPage() {
  const [sort, setSort] = useState<SortKey>("date")
  const { data: rawRepos, isLoading } = useQuery({
    queryKey: ["repos"],
    queryFn: () => apiFetch<Repository[]>("/repos"),
  })
  const repos = rawRepos ? sortRepos(rawRepos, sort) : undefined

  return (
    <div>
      <PageHeader
        title="Repositories"
        description={IS_DEMO ? "The public demo has one sample repository: Dev Day One's own source code." : "Repositories you've connected."}
        meta={repos && !IS_DEMO ? `${repos.length} connected` : undefined}
        action={
          !IS_DEMO && (
            <>
              {repos && repos.length > 1 && (
                <>
                  <label htmlFor="repo-sort" className="sr-only">Sort repositories</label>
                  <select id="repo-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={controlClass("h-10 w-auto py-0")}>
                    <option value="date">Newest first</option>
                    <option value="name">By name</option>
                    <option value="indexed">Indexed first</option>
                  </select>
                </>
              )}
              <Button asChild>
                <Link href="/dashboard/repos/new">Connect a repository</Link>
              </Button>
            </>
          )
        }
      />
      <PageBody>
        {isLoading && <SkeletonList rows={3} />}
        {!isLoading && repos?.length === 0 && (
          <EmptyState title="No repositories yet">
            Connect a GitHub repository to start asking questions about it.
          </EmptyState>
        )}
        {repos && repos.length > 0 && (
          <ul className="max-w-[60rem]">
            {repos.map((repo) => <RepoRow key={repo.id} repo={repo} />)}
          </ul>
        )}
      </PageBody>
    </div>
  )
}
