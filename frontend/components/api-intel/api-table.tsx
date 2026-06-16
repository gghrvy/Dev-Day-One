import { cn } from "@/lib/utils"
import type { ApiInventoryItem } from "@/types"

const TYPE_BADGE: Record<string, string> = {
  internal: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  external: "bg-amber-500/10 text-amber-400 border-amber-500/20",
}

const STATUS_BADGE: Record<string, string> = {
  active:     "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  deprecated: "bg-zinc-500/10 text-zinc-500 border-zinc-700/40",
  unknown:    "bg-zinc-800/50 text-zinc-600 border-zinc-700/40",
}

export function ApiTable({ items }: { items: ApiInventoryItem[] }) {
  const internal = items.filter((i) => i.api_type === "internal")
  const external = items.filter((i) => i.api_type === "external")

  return (
    <div className="space-y-6">
      {[
        { label: "Internal APIs", list: internal },
        { label: "External APIs", list: external },
      ].map(({ label, list }) =>
        list.length > 0 ? (
          <div key={label}>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">{label}</p>
            <div className="rounded-xl border border-white/[0.06] bg-[#0C0C0E]">
              {list.map((item, i) => (
                <div
                  key={item.id}
                  className={cn("flex items-start gap-3 px-4 py-3", i < list.length - 1 && "border-b border-white/[0.04]")}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[13px] font-medium text-zinc-200">{item.name}</span>
                      {item.version && (
                        <span className="font-mono text-[10px] text-zinc-600">{item.version}</span>
                      )}
                      <span className={cn("rounded border px-1.5 py-0.5 font-mono text-[9px]", TYPE_BADGE[item.api_type])}>
                        {item.api_type}
                      </span>
                      <span className={cn("rounded border px-1.5 py-0.5 font-mono text-[9px]", STATUS_BADGE[item.status])}>
                        {item.status}
                      </span>
                    </div>
                    {item.endpoint && (
                      <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-600">{item.endpoint}</p>
                    )}
                    {item.file_path && (
                      <p className="mt-0.5 font-mono text-[11px] text-zinc-700">{item.file_path}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  )
}
