import { FileCode2, Tag } from "lucide-react"
import type { KnowledgeEntry } from "@/types"

export function KnowledgeCard({ entry }: { entry: KnowledgeEntry }) {
  return (
    <div className="border-b border-white/[0.04] px-5 py-4">
      <div className="mb-1.5 flex items-start justify-between">
        <h3 className="font-medium text-zinc-100">{entry.title}</h3>
        <span className="ml-4 flex-shrink-0 font-mono text-[10px] text-zinc-700">
          {new Date(entry.created_at).toLocaleDateString()}
        </span>
      </div>
      {entry.body && (
        <p className="mb-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">{entry.body}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {entry.file_path && (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-indigo-400">
            <FileCode2 className="h-3 w-3" /> {entry.file_path}
          </span>
        )}
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-0.5 rounded-full border border-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-zinc-500"
          >
            <Tag className="h-2.5 w-2.5" /> {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
