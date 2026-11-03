import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-[var(--radius-control)] border border-kerb bg-asphalt px-3 text-base text-chalk transition-colors placeholder:text-fog hover:border-zinc-700 focus-visible:border-signal disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-alert md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
