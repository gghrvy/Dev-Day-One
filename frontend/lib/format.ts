const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
const DATE_TIME = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

export const formatDate = (iso: string | null | undefined) => (iso ? DATE.format(new Date(iso)) : "")
export const formatDateTime = (iso: string | null | undefined) => (iso ? DATE_TIME.format(new Date(iso)) : "")

/** Only http(s) URLs from third-party data become links; anything else renders as text. */
export function safeHref(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null
  } catch {
    return null
  }
}
