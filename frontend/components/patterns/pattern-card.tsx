import { cn } from "@/lib/utils"
import type { Pattern } from "@/types"

const CONFIDENCE: Record<string, string> = {
  high:   "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  medium: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  low:    "text-zinc-400 border-zinc-500/20 bg-zinc-500/10",
}

export function PatternCard({ pattern }: { pattern: Pattern }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0C0C0E] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-zinc-100">{pattern.name}</h3>
        <span className={cn("rounded border px-2 py-0.5 font-mono text-[10px]", CONFIDENCE[pattern.confidence])}>
          {pattern.confidence} confidence
        </span>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-zinc-400">{pattern.description}</p>
      {pattern.evidence.length > 0 && (
        <ul className="space-y-1">
          {pattern.evidence.map((e, i) => (
            <li key={i} className="font-mono text-[11px] text-zinc-600">↳ {e}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
