import { formatDate } from "@/lib/format"
import type { KnowledgeEntry } from "@/types"

export function KnowledgeCard({ entry }: { entry: KnowledgeEntry }) {
  return (
    <li className="grid gap-1 border-b border-kerb py-5 first:border-t md:grid-cols-[1fr_8rem] md:gap-6">
      <div className="min-w-0">
        <h2 className="font-bold text-chalk">{entry.title}</h2>
        {entry.body && <p className="mt-1 max-w-[68ch] text-chalk">{entry.body}</p>}
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
          {entry.file_path && <span className="break-all font-mono text-route">{entry.file_path}</span>}
          {entry.tags.length > 0 && <span className="text-fog">Tagged {entry.tags.join(", ")}</span>}
        </div>
      </div>
      <p className="text-sm text-fog md:text-right">{formatDate(entry.created_at)}</p>
    </li>
  )
}
