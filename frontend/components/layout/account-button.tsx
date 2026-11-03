"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

export function AccountButton() {
  const router = useRouter()
  const { toast } = useToast()
  const [label, setLabel] = useState("Account")
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        const name: string = user?.user_metadata?.full_name ?? user?.email ?? ""
        if (name) setLabel(name)
      })
  }, [])

  const signOut = async () => {
    await createClient().auth.signOut()
    toast("Signed out.", "success")
    router.push("/login")
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        className="min-h-11 w-full truncate rounded-[var(--radius-control)] px-2 text-left lg:min-h-9 text-sm text-fog hover:bg-asphalt hover:text-chalk"
      >
        {label}
      </button>
      <Modal open={confirming} onClose={() => setConfirming(false)}>
        <div role="dialog" aria-modal="true" aria-labelledby="signout-title" className="w-[min(20rem,calc(100vw-2rem))] rounded-[var(--radius-panel)] border border-kerb bg-asphalt p-5 shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
          <p id="signout-title" className="font-bold text-chalk">Sign out?</p>
          <p className="mt-1 text-sm text-fog">You&apos;ll go back to the sign-in page.</p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
