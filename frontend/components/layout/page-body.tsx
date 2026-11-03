import { cn } from "@/lib/utils"

export function PageBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-5 py-6 md:px-8", className)}>{children}</div>
}

/** Empty, loading-failed and not-available states: one instruction, no apology. */
export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-[60ch] border-l-2 border-kerb py-1 pl-4">
      <p className="font-bold text-chalk">{title}</p>
      {children && <div className="mt-1 text-fog">{children}</div>}
    </div>
  )
}
