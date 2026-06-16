import { IconRail } from "@/components/layout/icon-rail"
import { ContextPanel } from "@/components/layout/context-panel"
import { Providers } from "@/components/providers"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { CommandPalette } from "@/components/ui/command-palette"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex min-h-screen bg-dawn-bg">
        <IconRail />
        <ContextPanel />
        <main className="flex min-w-0 flex-1 flex-col">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <CommandPalette />
      </div>
    </Providers>
  )
}
