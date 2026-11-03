"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { LogoMark } from "@/components/ui/logo-mark"
import { AccountButton } from "@/components/layout/account-button"
import { IS_DEMO } from "@/lib/demo"
import { REPO_PAGES, activeRepoId, activeSegment, repoHref } from "@/components/layout/nav-data"
import type { Repository } from "@/types"

/** Shared by the desktop sidebar and the mobile drawer. */
export function SidebarContent() {
  const pathname = usePathname()
  const { data: repos = [] } = useQuery<Repository[]>({
    queryKey: ["repos"],
    queryFn: () => apiFetch<Repository[]>("/repos"),
  })
  const repoId = activeRepoId(pathname)
  const repo = repos.find((r) => r.id === repoId)
  const segment = repoId ? activeSegment(pathname, repoId) : null

  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex min-h-11 items-center gap-2.5 rounded-[var(--radius-control)] px-2">
        <LogoMark size={26} />
        <span className="font-extrabold text-chalk">Dev Day One</span>
      </Link>

      <nav aria-label="Repository" className="mt-8 min-h-0 flex-1 overflow-y-auto">
        <Link
          href="/dashboard/repos"
          aria-current={pathname === "/dashboard/repos" ? "page" : undefined}
          className={cn(
            "flex min-h-11 items-center rounded-[var(--radius-control)] px-2 text-sm lg:min-h-9",
            pathname === "/dashboard/repos" ? "text-chalk" : "text-fog hover:text-chalk"
          )}
        >
          All repositories
        </Link>

        {repoId && (
          <div className="mt-5">
            <p className="truncate px-2 font-bold text-chalk" title={repo?.full_name}>
              {repo?.name ?? "Repository"}
            </p>
            <ol className="relative mt-3">
              <span aria-hidden="true" className="absolute bottom-3 left-[15px] top-3 w-0.5 bg-kerb" />
              {REPO_PAGES.map((p) => {
                const current = segment === p.segment
                return (
                  <li key={p.label}>
                    <Link
                      href={repoHref(repoId, p.segment)}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "relative flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] px-2 lg:min-h-9",
                        current ? "font-bold text-chalk" : "text-fog hover:text-chalk"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "relative z-10 ml-[3px] h-3 w-3 shrink-0 rounded-full border-2",
                          current ? "border-signal bg-signal" : "border-kerb bg-graphite"
                        )}
                      />
                      {p.label}
                    </Link>
                  </li>
                )
              })}
            </ol>
          </div>
        )}
      </nav>

      {!IS_DEMO && (
      <div className="mt-4 border-t border-kerb pt-3">
        <Link
          href="/dashboard/settings"
          aria-current={pathname.startsWith("/dashboard/settings") ? "page" : undefined}
          className="flex min-h-11 items-center rounded-[var(--radius-control)] px-2 text-sm text-fog hover:bg-asphalt hover:text-chalk lg:min-h-9"
        >
          Settings
        </Link>
        <AccountButton />
      </div>
      )}
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 border-r border-kerb px-3 py-5 lg:block">
      <SidebarContent />
    </aside>
  )
}
