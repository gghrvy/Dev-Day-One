"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const TERMINAL_LINES = [
  { prefix: "$", text: "devdayone connect acme/backend", color: "text-zinc-300" },
  { prefix: "✓", text: "Repository connected", color: "text-emerald-400" },
  { prefix: "→", text: "Indexing 2,847 files...", color: "text-zinc-500" },
  { prefix: "✓", text: "Index complete in 00:43", color: "text-emerald-400" },
  { prefix: "$", text: "ask \"Where is auth handled?\"", color: "text-zinc-300" },
  { prefix: "AI", text: "Auth is in middleware/auth.ts — JWT validation on every", color: "text-indigo-300" },
  { prefix: "", text: "     protected route via withAuth HOC. Session stored in", color: "text-indigo-300" },
  { prefix: "", text: "     httpOnly cookie. See src/lib/session.ts:42 ↗", color: "text-indigo-300" },
]

export function Hero() {
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const linesRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    tl.from(leftRef.current, { opacity: 0, x: -24, duration: 0.7 })
      .from(rightRef.current, { opacity: 0, x: 24, duration: 0.7 }, "-=0.5")
      .from(
        linesRef.current.filter(Boolean),
        { opacity: 0, y: 6, duration: 0.3, stagger: 0.08 },
        "-=0.3",
      )
  }, [])

  return (
    <section className="relative flex min-h-screen items-center px-6 lg:px-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_60%_at_30%_40%,rgba(99,102,241,0.07),transparent_70%)]" />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left column */}
        <div ref={leftRef} className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-950/30 px-3 py-1 text-[11px] font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            RAG-powered developer onboarding
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tighter text-zinc-50 sm:text-5xl lg:text-[3.25rem]">
            Every developer,{" "}
            <span className="text-amber-400">ready from day one.</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-400">
            Connect your GitHub repo and get an AI that knows your codebase — so new hires ship in days, not weeks.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-10 rounded-md bg-amber-500 px-5 text-sm font-semibold text-zinc-900 hover:bg-amber-400"
            >
              <Link href="/login">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-10 rounded-md px-5 text-sm text-zinc-400 hover:text-zinc-100"
            >
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 border-t border-white/[0.05] pt-8">
            {[
              { value: "< 60s", label: "to index a repo" },
              { value: "100%", label: "code-grounded answers" },
              { value: "$0", label: "to get started" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-mono text-lg font-bold text-zinc-50">{stat.value}</div>
                <div className="mt-0.5 text-[11px] text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — terminal */}
        <div ref={rightRef} className="flex items-center justify-center">
          <div className="w-full max-w-lg rounded-xl border border-white/[0.07] bg-[#0C0C0E] shadow-2xl">
            {/* Terminal titlebar */}
            <div className="flex items-center gap-1.5 border-b border-white/[0.05] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              <span className="ml-auto font-mono text-[10px] text-zinc-600">devdayone — zsh</span>
            </div>
            {/* Terminal body */}
            <div className="space-y-1.5 p-4">
              {TERMINAL_LINES.map((line, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    if (el) linesRef.current[i] = el
                  }}
                  className="flex gap-3 font-mono text-[12px] leading-relaxed"
                >
                  <span className="w-4 flex-shrink-0 text-zinc-600">{line.prefix}</span>
                  <span className={line.color}>{line.text}</span>
                </div>
              ))}
              <div className="flex gap-3 font-mono text-[12px]">
                <span className="w-4 text-zinc-600">$</span>
                <span className="text-zinc-300">
                  <span className="inline-block h-3.5 w-1.5 animate-pulse bg-amber-400" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
