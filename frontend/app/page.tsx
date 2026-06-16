import { LandingNav } from "@/components/landing/nav"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <LandingNav />
      <main className="pt-12">
        <Hero />
        <Features />
        <HowItWorks />
        <footer className="border-t border-white/[0.05] py-8 text-center font-mono text-[11px] text-zinc-700">
          © 2026 Dev Day One
        </footer>
      </main>
    </div>
  )
}
