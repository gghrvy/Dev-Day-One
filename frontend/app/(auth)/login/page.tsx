"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { LogoMark } from "@/components/ui/logo-mark"

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.83 1.18 3.09 0 4.41-2.7 5.38-5.26 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55C20.22 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

type Tab = "oauth" | "signin" | "signup"

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("oauth")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const signInWithGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "repo read:user user:email",
      },
    })
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else window.location.href = "/dashboard"
  }

  const signUpWithEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setInfo("")
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    setLoading(false)
    if (error) setError(error.message)
    else setInfo("Check your email for a confirmation link.")
  }

  const fieldCls = "w-full rounded-[var(--radius-control)] border border-kerb bg-asphalt px-3 py-2.5 text-chalk placeholder:text-fog hover:border-zinc-700 focus-visible:border-signal"

  return (
    <main className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1200px] gap-12 px-5 py-10 md:px-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-[var(--radius-control)]">
            <LogoMark size={26} />
            <span className="font-extrabold text-chalk">Dev Day One</span>
          </Link>
          <p className="mt-10 max-w-[20ch] text-[2.4414rem] font-extrabold leading-[1.05] text-chalk">
            Your first day on a codebase, already oriented.
          </p>
          <p className="mt-4 max-w-[52ch] text-fog">
            Connect a repository and ask it questions. Every answer cites the files it came from.
          </p>
        </div>

        <div className="w-full max-w-[380px] lg:col-span-5 lg:col-start-8">
          <h1 className="text-[1.5625rem] font-extrabold text-chalk">{tab === "signup" ? "Create an account" : "Sign in"}</h1>

          <div role="group" aria-label="Sign-in method" className="mt-6 grid grid-cols-3 gap-1 rounded-[var(--radius-control)] border border-kerb p-1">
            {(["oauth", "signin", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                aria-pressed={tab === t}
                onClick={() => { setTab(t); setError(""); setInfo("") }}
                className={`rounded-[var(--radius-control)] py-2 text-sm font-semibold ${tab === t ? "bg-asphalt text-chalk" : "text-fog hover:text-chalk"}`}
              >
                {t === "oauth" ? "GitHub or Google" : t === "signin" ? "Email" : "New account"}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {tab === "oauth" && (
              <>
                <button onClick={signInWithGitHub} className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[var(--radius-control)] bg-chalk font-semibold text-graphite hover:bg-zinc-200">
                  <GithubIcon className="h-4 w-4" />
                  Continue with GitHub
                </button>
                <button onClick={signInWithGoogle} className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[var(--radius-control)] border border-kerb font-semibold text-chalk hover:border-fog">
                  <GoogleIcon className="h-4 w-4" />
                  Continue with Google
                </button>
                <p className="text-sm text-fog">Sign in with GitHub to connect private repositories.</p>
              </>
            )}

            {tab !== "oauth" && (
              <form onSubmit={tab === "signin" ? signInWithEmail : signUpWithEmail} className="space-y-4">
                {tab === "signup" && (
                  <div>
                    <label htmlFor="login-name" className="block font-bold text-chalk">Name</label>
                    <input id="login-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={`mt-2 ${fieldCls}`} />
                  </div>
                )}
                <div>
                  <label htmlFor="login-email" className="block font-bold text-chalk">Email</label>
                  <input id="login-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-2 ${fieldCls}`} />
                </div>
                <div>
                  <label htmlFor="login-password" className="block font-bold text-chalk">Password</label>
                  {tab === "signup" && <p id="pw-hint" className="text-sm text-fog">At least 8 characters.</p>}
                  <input
                    id="login-password"
                    type="password"
                    required
                    minLength={tab === "signup" ? 8 : undefined}
                    aria-describedby={tab === "signup" ? "pw-hint" : undefined}
                    autoComplete={tab === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`mt-2 ${fieldCls}`}
                  />
                </div>
                {error && <p role="alert" className="text-alert">{error}</p>}
                {info && <p role="status" className="text-route">{info}</p>}
                <button type="submit" disabled={loading} className="h-11 w-full rounded-[var(--radius-control)] bg-signal font-semibold text-signal-ink hover:bg-[#F5D05E] disabled:opacity-50">
                  {tab === "signin" ? (loading ? "Signing in…" : "Sign in") : loading ? "Creating account…" : "Create account"}
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-sm text-fog">
            By continuing you agree to the{" "}
            <Link href="/terms" className="text-chalk underline underline-offset-4">Terms</Link> and{" "}
            <Link href="/privacy" className="text-chalk underline underline-offset-4">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </main>
  )
}
