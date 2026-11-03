import { cn } from "@/lib/utils"

/** A sign plate: the "{" bracket and a "+" marker, set in signal yellow on graphite. */
export function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  const iconSize = Math.round(size * 0.6)
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-signal", className)}
      style={{ width: size, height: size }}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M6 1.5C5.3 1.5 4.8 2 4.8 2.6V5.9L3.8 7L4.8 8.1V11.4C4.8 12 5.3 12.5 6 12.5"
          stroke="#191B1E"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="10" y1="4.5" x2="10" y2="9.5" stroke="#191B1E" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="7.5" y1="7" x2="12.5" y2="7" stroke="#191B1E" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  )
}
