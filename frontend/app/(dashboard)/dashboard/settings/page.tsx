"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GitBranch, Mail, LogOut, User, Check, Pencil } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/layout/page-header"
import { useToast } from "@/components/ui/toast"
import { Modal } from "@/components/ui/modal"

interface Profile {
  email: string | null
  full_name: string | null
  avatar_url: string | null
  provider: string | null
}

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showSignOut, setShowSignOut] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const [savingName, setSavingName] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const name = user.user_metadata?.full_name ?? null
      setProfile({
        email: user.email ?? null,
        full_name: name,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        provider: user.app_metadata?.provider ?? null,
      })
      setNameInput(name ?? "")
    })
  }, [])

  const saveName = async () => {
    if (!nameInput.trim()) return
    setSavingName(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ data: { full_name: nameInput.trim() } })
    setSavingName(false)
    if (error) { toast("Failed to update name.", "error"); return }
    setProfile((p) => p ? { ...p, full_name: nameInput.trim() } : p)
    setEditingName(false)
    toast("Name updated.", "success")
  }

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push("/login")
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <PageHeader title="Settings" meta="Account & preferences" />

      <div className="mt-6 space-y-4">
        {/* Profile */}
        <Section title="Profile">
          <div className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1C1C1F]">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-zinc-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false) }}
                    className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:border-white/[0.15]"
                  />
                  <button onClick={saveName} disabled={savingName} className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50">
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-zinc-200">{profile?.full_name ?? "—"}</p>
                  <button onClick={() => setEditingName(true)} className="text-zinc-600 hover:text-zinc-400">
                    <Pencil className="h-3 w-3" />
                  </button>
                </div>
              )}
              <p className="truncate font-mono text-[11px] text-zinc-600">{profile?.email ?? "—"}</p>
            </div>
          </div>
        </Section>

        {/* Connected accounts */}
        <Section title="Connected accounts">
          <div className="divide-y divide-white/[0.04]">
            <AccountRow
              icon={GitBranch}
              label="GitHub"
              connected={profile?.provider === "github"}
            />
            <AccountRow
              icon={Mail}
              label="Google"
              connected={profile?.provider === "google"}
            />
            <AccountRow
              icon={Mail}
              label="Email / Password"
              connected={profile?.provider === "email"}
            />
          </div>
        </Section>

        {/* Danger zone */}
        <Section title="Account">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-300">Sign out</p>
                <p className="text-[11px] text-zinc-600">Sign out of your account on this device.</p>
              </div>
              <button
                onClick={() => setShowSignOut(true)}
                className="flex items-center gap-1.5 rounded-md border border-red-500/20 px-3 py-1.5 text-[11px] text-red-400 hover:border-red-500/40 hover:text-red-300"
              >
                <LogOut className="h-3 w-3" />
                Sign out
              </button>
            </div>
          </div>
        </Section>
      </div>

      <Modal open={showSignOut} onClose={() => setShowSignOut(false)}>
        <div className="w-80 rounded-xl border border-white/[0.08] bg-[#0C0C0E] p-5 shadow-2xl">
          <p className="mb-1 text-sm font-semibold text-zinc-100">Sign out?</p>
          <p className="mb-5 text-[12px] text-zinc-500">You'll need to sign in again to access your repositories.</p>
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
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0C0C0E]">
      <div className="border-b border-white/[0.04] px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">{title}</p>
      </div>
      {children}
    </div>
  )
}

function AccountRow({
  icon: Icon,
  label,
  connected,
}: {
  icon: React.ElementType
  label: string
  connected: boolean
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-2.5">
        <Icon className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-[12px] text-zinc-300">{label}</span>
      </div>
      <span className={`font-mono text-[10px] ${connected ? "text-emerald-400" : "text-zinc-700"}`}>
        {connected ? "connected" : "not connected"}
      </span>
    </div>
  )
}
