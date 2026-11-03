"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/layout/page-header"
import { PageBody } from "@/components/layout/page-body"
import { Button } from "@/components/ui/button"
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
    <div>
      <PageHeader title="Settings" description="Your profile and how you sign in." />
      <PageBody className="max-w-[48rem] space-y-10">
        <section aria-labelledby="profile-title">
          <h2 id="profile-title" className="text-[1.25rem] font-bold text-chalk">Profile</h2>
          <div className="mt-3 flex items-center gap-4 border-y border-kerb py-4">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-asphalt">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="size-5 text-fog" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {editingName ? (
                <form onSubmit={(e) => { e.preventDefault(); saveName() }} className="flex flex-wrap items-center gap-2">
                  <label htmlFor="settings-name" className="sr-only">Name</label>
                  <input
                    id="settings-name"
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Escape") setEditingName(false) }}
                    className="min-w-0 flex-1 rounded-[var(--radius-control)] border border-kerb bg-asphalt px-3 py-2 text-chalk focus-visible:border-signal"
                  />
                  <Button type="submit" size="sm" disabled={savingName}>{savingName ? "Saving…" : "Save name"}</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditingName(false)}>Cancel</Button>
                </form>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="truncate font-bold text-chalk">{profile?.full_name ?? "No name set"}</p>
                  <Button variant="link" size="sm" onClick={() => setEditingName(true)}>Change name</Button>
                </div>
              )}
              <p className="truncate text-fog">{profile?.email ?? ""}</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="signin-title">
          <h2 id="signin-title" className="text-[1.25rem] font-bold text-chalk">How you sign in</h2>
          <ul className="mt-3">
            {[
              ["GitHub", "github"],
              ["Google", "google"],
              ["Email and password", "email"],
            ].map(([label, provider]) => (
              <li key={provider} className="flex items-center justify-between border-b border-kerb py-3 first:border-t">
                <span className="text-chalk">{label}</span>
                <span className={profile?.provider === provider ? "text-route" : "text-fog"}>
                  {profile?.provider === provider ? "Connected" : "Not connected"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="account-title">
          <h2 id="account-title" className="text-[1.25rem] font-bold text-chalk">Sign out</h2>
          <p className="mt-1 text-fog">Sign out of Dev Day One on this device.</p>
          <Button variant="destructive" className="mt-3" onClick={() => setShowSignOut(true)}>Sign out</Button>
        </section>
      </PageBody>

      <Modal open={showSignOut} onClose={() => setShowSignOut(false)}>
        <div role="dialog" aria-modal="true" aria-labelledby="so-title" className="w-[min(22rem,calc(100vw-2rem))] rounded-[var(--radius-panel)] border border-kerb bg-asphalt p-5">
          <p id="so-title" className="font-bold text-chalk">Sign out?</p>
          <p className="mt-1 text-sm text-fog">You&apos;ll need to sign in again to see your repositories.</p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowSignOut(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
