"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { FolderGit2, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { Modal } from "@/components/ui/modal"

const navItems = [
  { href: "/dashboard/repos", icon: FolderGit2, label: "Repositories" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export function IconRail() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [initials, setInitials] = useState("?")
  const [showSignOut, setShowSignOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAvatarUrl(user?.user_metadata?.avatar_url ?? null)
      const name: string = user?.user_metadata?.full_name ?? user?.email ?? ""
      setInitials(name.charAt(0).toUpperCase() || "?")
    })
  }, [])

  const signOut = async () => {
    await createClient().auth.signOut()
    toast("Signed out.", "success")
    router.push("/login")
  }

  return (
    <aside className="flex w-11 shrink-0 flex-col items-center border-r border-white/[0.04] bg-[#080809] py-2.5">
      {/* Logo mark */}
      <Link
        href="/dashboard"
        className="mb-3 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] bg-dawn-accent text-[10px] font-black text-[#09090B]"
      >
        D
      </Link>

      {/* Nav icons */}
      <div className="flex flex-col gap-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <div key={href} className="relative flex w-full justify-center">
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-sm bg-dawn-accent" />
              )}
              <Link
                href={href}
                title={label}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-[7px] transition-colors",
                  active
                    ? "bg-[#1C1C1F] text-zinc-100"
                    : "text-zinc-600 hover:bg-[#111113] hover:text-zinc-300"
                )}
              >
                <Icon className="h-[13px] w-[13px]" />
              </Link>
            </div>
          )
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User avatar — click to open sign-out confirm */}
      <button
        onClick={() => setShowSignOut(true)}
        title="Account"
        className="flex h-[22px] w-[22px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1C1C1F] text-[8px] font-semibold text-zinc-500 transition-colors hover:text-zinc-300"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </button>

      <Modal open={showSignOut} onClose={() => setShowSignOut(false)}>
        <div className="w-72 rounded-xl border border-white/[0.08] bg-[#0C0C0E] p-5 shadow-2xl">
          <p className="mb-1 text-sm font-semibold text-zinc-100">Sign out?</p>
          <p className="mb-5 text-[12px] text-zinc-500">You'll be returned to the login page.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSignOut(false)}
              className="flex-1 rounded-md border border-white/[0.07] py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              onClick={signOut}
              className="flex-1 rounded-md bg-red-500/10 py-1.5 text-[11px] font-semibold text-red-400 hover:bg-red-500/20"
            >
              Sign out
            </button>
          </div>
        </div>
      </Modal>
    </aside>
  )
}
