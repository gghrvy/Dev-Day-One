import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] border px-2 text-xs font-semibold whitespace-nowrap [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-kerb text-chalk",
        signal: "border-signal/40 text-signal",
        route: "border-route/40 text-route",
        alert: "border-alert/40 text-alert",
        muted: "border-kerb text-fog",
        // legacy names kept for existing call sites
        secondary: "border-kerb text-fog",
        destructive: "border-alert/40 text-alert",
        outline: "border-kerb text-chalk",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
