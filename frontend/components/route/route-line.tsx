import Link from "next/link"
import { cn } from "@/lib/utils"

interface RouteLineProps {
  children: React.ReactNode
  orientation?: "vertical" | "horizontal"
  /** Draw the line in once on mount (landing hero only). Reduced motion shows it fully drawn. */
  animate?: boolean
  className?: string
  "aria-label"?: string
}

/** The signature element: a transit line whose stations are places in the code. */
export function RouteLine({ children, orientation = "vertical", animate, className, ...rest }: RouteLineProps) {
  const vertical = orientation === "vertical"
  return (
    <div
      data-orientation={orientation}
      className={cn("group/route relative", animate && "route-animate", className)}
    >
      <span
        aria-hidden="true"
        className={cn("route-track-y absolute bottom-3 left-[7px] top-3 w-0.5 bg-kerb", !vertical && "sm:hidden")}
      />
      {!vertical && (
        <span
          aria-hidden="true"
          className="route-track-x absolute left-2 right-2 top-[11px] hidden h-0.5 bg-kerb sm:block"
        />
      )}
      <ol
        aria-label={rest["aria-label"]}
        className={cn("relative", vertical ? "flex flex-col gap-4" : "flex flex-col gap-5 sm:grid sm:auto-cols-fr sm:grid-flow-col sm:gap-6")}
      >
        {children}
      </ol>
    </div>
  )
}

interface RouteStationProps {
  index: number
  /** Station marker: route = links into code, signal = "you are here". */
  tone?: "route" | "signal" | "muted"
  title: React.ReactNode
  href?: string
  children?: React.ReactNode
  className?: string
}

const DOT = {
  route: "border-route bg-graphite",
  signal: "border-signal bg-signal",
  muted: "border-kerb bg-graphite",
}

export function RouteStation({ index, tone = "route", title, href, children, className }: RouteStationProps) {
  const heading = href ? (
    <Link href={href} className="rounded-[var(--radius-control)] underline-offset-4 hover:underline">
      {title}
    </Link>
  ) : (
    title
  )
  return (
    <li
      className={cn("route-station relative flex gap-3 sm:group-data-[orientation=horizontal]/route:flex-col", className)}
      style={{ "--station-index": index } as React.CSSProperties}
    >
      <span aria-hidden="true" className={cn("relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2", DOT[tone])} />
      <div className="min-w-0">
        <div className={cn("font-semibold", tone === "route" ? "text-route" : "text-chalk")}>{heading}</div>
        {children && <div className="mt-1 text-fog">{children}</div>}
      </div>
    </li>
  )
}

/** A file citation formatted as path:start–end. */
export function CodeRef({ path, start, end }: { path: string; start?: number | null; end?: number | null }) {
  return (
    <span className="break-all font-mono text-[0.875rem]">
      {path}
      {start ? `:${start}${end && end !== start ? `–${end}` : ""}` : ""}
    </span>
  )
}
