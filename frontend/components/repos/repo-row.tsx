import Link from "next/link"
import { formatDate } from "@/lib/format"
import type { Repository } from "@/types"

export function RepoRow({ repo }: { repo: Repository }) {
  return (
    <li className="border-b border-kerb first:border-t">
      <Link
        href={`/dashboard/repos/${repo.id}`}
        className="group grid gap-1 rounded-[var(--radius-control)] py-4 md:grid-cols-[1fr_12rem] md:gap-6"
      >
        <div className="min-w-0">
          <p className="break-words font-bold text-chalk group-hover:text-signal">{repo.name}</p>
          <p className="break-all font-mono text-[0.875rem] text-fog">{repo.full_name}</p>
          {repo.description && <p className="mt-1 text-fog">{repo.description}</p>}
        </div>
        <p className={repo.indexed ? "text-route md:text-right" : "text-fog md:text-right"}>
          {repo.indexed ? `Indexed ${formatDate(repo.indexed_at)}` : "Not indexed yet"}
        </p>
      </Link>
    </li>
  )
}
