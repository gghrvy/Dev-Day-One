import { createClient } from "@/lib/supabase/client"
import { emitToast } from "@/lib/toast-bridge"

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function getToken(): Promise<string> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Not authenticated")
  return session.access_token
}

export async function getGithubToken(): Promise<string | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  // provider_token is the GitHub OAuth token — only present when signed in with GitHub
  return (session as { provider_token?: string }).provider_token ?? null
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  })
  if (res.status === 204) return undefined as T
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }))
    const message = body.detail ?? "Request failed"
    emitToast(message, "error")
    throw new Error(message)
  }
  return res.json()
}
