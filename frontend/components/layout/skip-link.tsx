export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-[var(--radius-control)] bg-signal px-4 py-3 font-semibold text-signal-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100]"
    >
      Skip to main content
    </a>
  )
}
