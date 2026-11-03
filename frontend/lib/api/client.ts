import { createClient } from "@/lib/supabase/client"
import { emitToast } from "@/lib/toast-bridge"
import { IS_DEMO } from "@/lib/demo"
import { trackWake } from "@/lib/server-wake"

export const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function getToken(): Promise<string> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Not authenticated")
  return session.access_token
}

/** Auth header for the current mode: none in the public demo, the Supabase token otherwise. */
export async function authHeaders(): Promise<Record<string, string>> {
  if (IS_DEMO) return {}
  return { Authorization: `Bearer ${await getToken()}` }
}

export async function getGithubToken(): Promise<string | null> {
  if (IS_DEMO) return null
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  // provider_token is the GitHub OAuth token — only present when signed in with GitHub
  return (session as { provider_token?: string }).provider_token ?? null
}

/** Turn any error body into one readable sentence (FastAPI sends a string or a list of objects). */
export function errorMessage(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown } | null)?.detail
  if (typeof detail === "string" && detail.trim()) return detail
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((d) => (typeof d === "string" ? d : (d as { msg?: unknown })?.msg))
      .filter((m): m is string => typeof m === "string")
    if (msgs.length) return msgs.join(". ")
  }
  return fallback
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await trackWake(
      fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
          ...(await authHeaders()),
        },
      })
    )
  } catch {
    const message = "Can't reach the server. Check your connection and try again."
    emitToast(message, "error")
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const message = errorMessage(body, res.status === 429 ? "Too many requests. Try again later." : "Request failed.")
    emitToast(message, "error")
    throw new Error(message)
  }
  return res.json()
}
