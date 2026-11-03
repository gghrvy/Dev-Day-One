"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { LogoMark } from "@/components/ui/logo-mark"
import { SidebarContent } from "@/components/layout/sidebar"
import { pageTitle } from "@/components/layout/nav-data"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [openedAt, setOpenedAt] = useState(pathname)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Navigating closes the drawer
  if (open && openedAt !== pathname) setOpen(false)

  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus()
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    const trigger = triggerRef.current
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
      trigger?.focus()
    }
  }, [open])

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-kerb bg-graphite px-4 lg:hidden">
        <Link href="/" aria-label="Dev Day One home" className="flex size-11 items-center justify-center rounded-[var(--radius-control)]">
          <LogoMark size={26} />
        </Link>
        <p className="min-w-0 flex-1 truncate font-bold text-chalk">{pageTitle(pathname)}</p>
        <button
          ref={triggerRef}
          onClick={() => {
            setOpenedAt(pathname)
            setOpen(true)
          }}
          aria-label="Open menu"
          aria-expanded={open}
          className="flex size-11 items-center justify-center rounded-[var(--radius-control)] text-chalk hover:bg-asphalt"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 left-0 flex w-[min(300px,85vw)] flex-col border-r border-kerb bg-graphite px-3 py-5 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 flex size-11 items-center justify-center rounded-[var(--radius-control)] text-fog hover:text-chalk"
            >
              <X className="size-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}
