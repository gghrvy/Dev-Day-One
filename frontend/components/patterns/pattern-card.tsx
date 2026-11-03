import { Badge } from "@/components/ui/badge"
import type { Pattern } from "@/types"

const CONFIDENCE: Record<string, { label: string; variant: "route" | "signal" | "muted" }> = {
  high: { label: "High confidence", variant: "route" },
  medium: { label: "Medium confidence", variant: "signal" },
  low: { label: "Low confidence", variant: "muted" },
}

/** One pattern as a row: name and confidence, what it means here, and the evidence. */
export function PatternCard({ pattern }: { pattern: Pattern }) {
  const c = CONFIDENCE[pattern.confidence] ?? CONFIDENCE.low
  return (
    <li className="grid gap-2 border-b border-kerb py-5 first:border-t md:grid-cols-[16rem_1fr] md:gap-6">
      <div>
        <h2 className="font-bold text-chalk">{pattern.name}</h2>
        <Badge variant={c.variant} className="mt-2">{c.label}</Badge>
      </div>
      <div className="min-w-0">
        <p className="text-chalk">{pattern.description}</p>
        {pattern.evidence.length > 0 && (
          <details className="mt-2 group">
            <summary className="flex min-h-11 w-fit cursor-pointer items-center rounded-[var(--radius-control)] text-sm text-fog hover:text-chalk">
              Evidence ({pattern.evidence.length})
            </summary>
            <ul className="mt-2 space-y-1.5">
              {pattern.evidence.map((e, i) => {
                const [path, ...rest] = e.split(": ")
                return (
                  <li key={i} className="text-sm text-fog">
                    {rest.length ? (
                      <>
                        <span className="break-all font-mono text-route">{path}</span>: {rest.join(": ")}
                      </>
                    ) : (
                      e
                    )}
                  </li>
                )
              })}
            </ul>
          </details>
        )}
      </div>
    </li>
  )
}
