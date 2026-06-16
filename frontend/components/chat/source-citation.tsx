export interface Source {
  file_path: string
  start_line?: number | null
  end_line?: number | null
}

export function SourceCitation({ sources }: { sources: Source[] }) {
  if (!sources.length) return null
  const unique = [...new Map(sources.map((s) => [s.file_path, s])).values()]
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {unique.map((s) => (
        <span
          key={s.file_path}
          className="font-mono text-[10px] text-zinc-600 hover:text-zinc-400 cursor-default"
        >
          {s.file_path}
          {s.start_line ? `:${s.start_line}` : ""}
        </span>
      ))}
    </div>
  )
}
