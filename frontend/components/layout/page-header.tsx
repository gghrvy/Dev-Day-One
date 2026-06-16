import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  meta?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, meta, action, className }: PageHeaderProps) {
  return (
    <div className={cn("px-5 pt-5", className)}>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tighter text-dawn-text">{title}</h1>
          {meta && (
            <p className="mt-1 font-mono text-[9px] text-dawn-muted">{meta}</p>
          )}
        </div>
        {action && <div className="mb-0.5">{action}</div>}
      </div>
      <div className="relative mt-4 h-px w-full bg-dawn-border">
        <div className="absolute left-0 top-0 h-px w-8 bg-dawn-accent" />
      </div>
    </div>
  )
}
