import { Badge } from "@/components/ui/badge"
import { safeHref } from "@/lib/format"
import type { ApiInventoryItem } from "@/types"

const STATUS: Record<string, { label: string; variant: "route" | "muted" | "alert" }> = {
  active: { label: "In use", variant: "route" },
  deprecated: { label: "Deprecated", variant: "alert" },
  unknown: { label: "Unknown", variant: "muted" },
}

function Endpoint({ value }: { value: string }) {
  // Scanned data comes from a model reading third-party code: only real http(s) URLs become links.
  const href = safeHref(value)
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="break-all font-mono text-[0.875rem] text-route underline-offset-4 hover:underline">
      {value}
    </a>
  ) : (
    <span className="break-all font-mono text-[0.875rem] text-chalk">{value}</span>
  )
}

export function ApiTable({ items }: { items: ApiInventoryItem[] }) {
  const groups = [
    { title: "Routes this code serves", list: items.filter((i) => i.api_type === "internal") },
    { title: "Services this code calls", list: items.filter((i) => i.api_type === "external") },
  ]

  return (
    <div className="space-y-10">
      {groups.map(({ title, list }) =>
        list.length > 0 ? (
          <section key={title} aria-label={title} className="max-w-[64rem]">
            <h2 className="text-[1.25rem] font-bold text-chalk">
              {title} <span className="font-normal text-fog">({list.length})</span>
            </h2>
            <ul className="mt-3">
              {list.map((item) => {
                const s = STATUS[item.status] ?? STATUS.unknown
                return (
                  <li key={item.id} className="grid gap-1 border-b border-kerb py-3.5 first:border-t md:grid-cols-[16rem_1fr_auto] md:items-baseline md:gap-6">
                    <p className="font-bold text-chalk">
                      {item.name}
                      {item.version && <span className="ml-2 font-normal text-fog">{item.version}</span>}
                    </p>
                    <div className="min-w-0">
                      {item.endpoint && <Endpoint value={item.endpoint} />}
                      {item.file_path && <p className="break-all font-mono text-[0.8125rem] text-fog">{item.file_path}</p>}
                    </div>
                    <Badge variant={s.variant} className="w-fit">{s.label}</Badge>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null
      )}
    </div>
  )
}
