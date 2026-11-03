import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  /** One sentence saying what this page shows. */
  description?: string
  /** Short factual metadata, e.g. "12 runs". */
  meta?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, meta, action, className }: PageHeaderProps) {
  return (
    <header className={cn("border-b border-kerb px-5 pb-5 pt-6 md:px-8", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-[68ch]">
          <h1 className="text-[1.5625rem] font-extrabold text-chalk">{title}</h1>
          {description && <p className="mt-1.5 text-fog">{description}</p>}
          {meta && <p className="mt-1 text-sm text-fog">{meta}</p>}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
    </header>
  )
}
