"use client"

import { useEffect } from "react"
import { API_URL } from "@/lib/api/client"
import { trackWake } from "@/lib/server-wake"

/** Landing page: start waking the backend early, so the demo is ready by the time someone clicks in. */
export function WakePing() {
  useEffect(() => {
    trackWake(fetch(`${API_URL}/health`, { cache: "no-store" })).catch(() => {})
  }, [])
  return null
}
