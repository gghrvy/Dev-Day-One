"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

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

  return (
    <main className="flex min-h-screen bg-[#09090B]">
      {/* Left brand panel */}
      <div className="relative hidden flex-col justify-between bg-[#0C0C0E] p-12 lg:flex lg:w-[45%]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[5px] bg-amber-500 text-[11px] font-black text-zinc-900">D</div>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">Dev Day One</span>
        </div>
        <div>
          <blockquote className="text-xl font-extrabold leading-snug tracking-tighter text-zinc-50">
            "Every developer,<br />
            <span className="text-amber-400">ready from day one."</span>
          </blockquote>
          <p className="mt-4 text-sm leading-relaxed text-zinc-500">
            Connect your codebase and give every new hire an AI that actually knows your system — so they ship in days, not weeks.
          </p>
        </div>
        <div className="flex items-center gap-6">
          {[{ value: "< 60s", label: "to index" }, { value: "100%", label: "code-grounded" }, { value: "$0", label: "to start" }].map((stat) => (
            <div key={stat.label}>
              <div className="font-mono text-base font-bold text-zinc-100">{stat.value}</div>
              <div className="text-[11px] text-zinc-600">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(245,158,11,0.04),transparent)]" />
      </div>

      {/* Right sign-in panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-[340px]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[5px] bg-amber-500 text-[11px] font-black text-zinc-900">D</div>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">Dev Day One</span>
          </div>

          <h2 className="text-lg font-extrabold tracking-tight text-zinc-50">
            {tab === "signup" ? "Create account" : "Sign in"}
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500">
            {tab === "signup" ? "Start onboarding your team faster." : "Welcome back."}
          </p>

          {/* Tab selector */}
          <div className="mt-6 flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
            {(["oauth", "signin", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setInfo("") }}
                className={`flex-1 rounded-md py-1.5 text-[11px] font-semibold transition-colors ${
                  tab === t
                    ? "bg-white/[0.07] text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                {t === "oauth" ? "Social" : t === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {tab === "oauth" && (
              <>
                <button
                  onClick={signInWithGitHub}
                  className="flex w-full items-center justify-center gap-2.5 rounded-md bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100"
                >
                  <GithubIcon className="h-4 w-4" />
                  Continue with GitHub
                </button>
                <button
                  onClick={signInWithGoogle}
                  className="flex w-full items-center justify-center gap-2.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/[0.06]"
                >
                  <GoogleIcon className="h-4 w-4" />
                  Continue with Google
                </button>
              </>
            )}

            {tab === "signin" && (
              <form onSubmit={signInWithEmail} className="space-y-3">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-amber-500 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-50"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>
            )}

            {tab === "signup" && (
              <form onSubmit={signUpWithEmail} className="space-y-3">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-600">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-white/[0.15] focus:outline-none"
                    placeholder="Min 8 characters"
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                {info && <p className="text-xs text-emerald-400">{info}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-amber-500 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-50"
                >
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-[11px] text-zinc-600">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline underline-offset-2 hover:text-zinc-400">Terms</a>{" "}
            and{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-zinc-400">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </main>
  )
}
