import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Repository } from "@/types"

export function RepoRow({ repo }: { repo: Repository }) {
  return (
    <Link
      href={`/dashboard/repos/${repo.id}`}
      className="group flex items-center justify-between border-b border-white/[0.04] px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "h-1.5 w-1.5 flex-shrink-0 rounded-full",
            repo.indexed ? "bg-emerald-500" : "bg-zinc-600",
          )}
        />
        <span className="truncate font-mono text-[13px] text-zinc-200 group-hover:text-zinc-50">
          {repo.full_name}
        </span>
        {repo.description && (
          <span className="hidden truncate text-[12px] text-zinc-600 sm:block">
            — {repo.description}
          </span>
        )}
      </div>

      <div className="ml-4 flex flex-shrink-0 items-center gap-4">
        {repo.indexed_at && (
          <span className="hidden font-mono text-[10px] text-zinc-600 sm:block">
            indexed {new Date(repo.indexed_at).toLocaleDateString()}
          </span>
        )}
        <span
          className={cn(
            "font-mono text-[10px]",
            repo.indexed ? "text-emerald-500" : "text-zinc-600",
          )}
        >
          {repo.indexed ? "indexed" : "not indexed"}
        </span>
      </div>
    </Link>
  )
}
