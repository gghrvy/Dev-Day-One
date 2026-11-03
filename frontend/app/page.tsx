import Link from "next/link"
import { LandingNav } from "@/components/landing/nav"
import { Hero } from "@/components/landing/hero"
import { ThreeSteps } from "@/components/landing/three-steps"
import { WhatItShows } from "@/components/landing/what-it-shows"
import { DemoNotice } from "@/components/demo/demo-notice"
import { WakePing } from "@/components/demo/wake-ping"
import { SkipLink } from "@/components/layout/skip-link"

export default function Home() {
  return (
    <div className="min-h-screen">
      <SkipLink />
      <LandingNav />
      <DemoNotice />
      <WakePing />
      <main id="main" tabIndex={-1}>
        <Hero />
        <ThreeSteps />
        <WhatItShows />
      </main>
      <footer className="border-t border-kerb">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-fog md:px-8">
          <span>Dev Day One, a portfolio project</span>
          <nav aria-label="Legal" className="flex gap-5">
            <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-chalk">Privacy</Link>
            <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-chalk">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
