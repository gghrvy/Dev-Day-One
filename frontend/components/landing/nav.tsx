import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/ui/logo-mark"
import { sampleRepoPath } from "@/lib/sample"

export function LandingNav() {
  return (
    <header className="border-b border-kerb">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 rounded-[var(--radius-control)]">
          <LogoMark size={26} />
          <span className="font-extrabold text-chalk">Dev Day One</span>
        </Link>
        <Button asChild size="sm">
          <Link href={sampleRepoPath()}>Open the demo</Link>
        </Button>
      </nav>
    </header>
  )
}
