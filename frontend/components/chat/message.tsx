import { CodeRef, RouteLine, RouteStation } from "@/components/route/route-line"
import { renderMessageContent } from "./code-block"

export interface Source {
  file_path: string
  start_line?: number | null
  end_line?: number | null
}

export function Question({ text }: { text: string }) {
  return (
    <div className="border-t border-kerb pt-6">
      <p className="sr-only">You asked:</p>
      <p className="whitespace-pre-wrap text-[1.25rem] font-bold text-chalk">{text}</p>
    </div>
  )
}

export function Answer({ text, sources, streaming }: { text: string; sources: Source[]; streaming?: boolean }) {
  const unique = [...new Map(sources.map((s) => [`${s.file_path}:${s.start_line ?? ""}`, s])).values()]
  return (
    <div className="mt-3" aria-busy={streaming || undefined}>
      <div className="space-y-3">{text ? renderMessageContent(text) : <p className="text-fog">Finding the relevant files…</p>}</div>
      {unique.length > 0 && (
        <section className="mt-5" aria-label="Files cited in this answer">
          <p className="text-sm text-fog">Files cited</p>
          <RouteLine className="mt-3">
            {unique.map((s, i) => (
              <RouteStation
                key={`${s.file_path}-${i}`}
                index={i}
                title={<CodeRef path={s.file_path} start={s.start_line} end={s.end_line} />}
              />
            ))}
          </RouteLine>
        </section>
      )}
    </div>
  )
}
