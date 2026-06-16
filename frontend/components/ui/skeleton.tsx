import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-zinc-800/60", className)}
      {...props}
    />
  )
}

function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-px">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-white/[0.04] px-5 py-3.5">
          <Skeleton className="h-1.5 w-1.5 rounded-full" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="ml-auto h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-24 rounded-xl border border-white/[0.06] bg-[#0C0C0E] p-5">
          <Skeleton className="mb-3 h-3 w-20" />
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </div>
  )
}

function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 py-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonList, SkeletonCards, SkeletonText }
