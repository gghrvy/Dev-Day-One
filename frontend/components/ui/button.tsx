import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-transparent text-sm font-semibold whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-signal text-signal-ink hover:bg-[#F5D05E]",
        outline: "border-kerb bg-transparent text-chalk hover:border-fog",
        secondary: "bg-asphalt text-chalk hover:bg-zinc-800",
        ghost: "text-fog hover:bg-asphalt hover:text-chalk",
        destructive: "border-alert/40 text-alert hover:bg-alert/10",
        link: "px-0 text-route underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-11 px-3 text-[0.875rem] md:h-9",
        lg: "h-12 px-5 text-base",
        icon: "size-11",
        "icon-sm": "size-11 md:size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
