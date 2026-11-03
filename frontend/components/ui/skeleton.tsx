import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-[var(--radius-control)] bg-asphalt", className)}
      {...props}
    />
  )
}

function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-kerb py-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

function SkeletonCards({ count = 6 }: { count?: number }) {
  return <SkeletonList rows={count} />
}

function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div role="status" aria-label="Loading" className="space-y-2 py-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonList, SkeletonCards, SkeletonText }
