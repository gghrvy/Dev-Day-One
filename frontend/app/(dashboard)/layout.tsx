import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Providers } from "@/components/providers"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { CommandPalette } from "@/components/ui/command-palette"
import { DemoNotice } from "@/components/demo/demo-notice"
import { SkipLink } from "@/components/layout/skip-link"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <SkipLink />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileNav />
          <DemoNotice />
          <main id="main" tabIndex={-1} className="min-w-0 flex-1">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
        <CommandPalette />
      </div>
    </Providers>
  )
}
