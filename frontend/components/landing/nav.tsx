"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LandingNav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-12 items-center justify-between border-b border-white/[0.05] bg-[#09090B]/90 px-6 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[5px] bg-amber-500 text-[11px] font-black text-zinc-900">
          D
        </div>
        <span className="text-sm font-semibold tracking-tight text-zinc-100">Dev Day One</span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100"
        >
          Sign in
        </Link>
        <Button
          asChild
          size="sm"
          className="h-7 rounded-md bg-amber-500 px-3 text-xs font-semibold text-zinc-900 hover:bg-amber-400"
        >
          <Link href="/login">
            Get started
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </nav>
  )
}
