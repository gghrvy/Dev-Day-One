/**
 * Tracks whether any API request has been waiting longer than WAKE_AFTER_MS.
 * Free hosting puts the backend to sleep; the first request can take up to a minute.
 */
import { useSyncExternalStore } from "react"

export const WAKE_AFTER_MS = 5000

let slow = 0
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

/** Wrap a request; flags the app as "waking" if it is still pending after WAKE_AFTER_MS. */
export async function trackWake<T>(request: Promise<T>): Promise<T> {
  let flagged = false
  const timer = setTimeout(() => {
    flagged = true
    slow += 1
    notify()
  }, WAKE_AFTER_MS)
  try {
    return await request
  } finally {
    clearTimeout(timer)
    if (flagged) {
      slow -= 1
      notify()
    }
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useServerWaking(): boolean {
  return useSyncExternalStore(subscribe, () => slow > 0, () => false)
}
