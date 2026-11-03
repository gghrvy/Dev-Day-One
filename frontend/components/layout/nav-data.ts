/** Pages inside one repository, in the order a newcomer would usually visit them. */
export const REPO_PAGES = [
  { label: "Overview", segment: "" },
  { label: "Ask", segment: "ask" },
  { label: "Onboard", segment: "onboard" },
  { label: "Architecture", segment: "architecture" },
  { label: "Patterns", segment: "patterns" },
  { label: "APIs", segment: "apis" },
  { label: "Impact", segment: "impact" },
  { label: "Decisions", segment: "adrs" },
  { label: "Notes", segment: "knowledge" },
  { label: "History", segment: "jobs" },
] as const

export function repoHref(repoId: string, segment: string) {
  return `/dashboard/repos/${repoId}${segment ? `/${segment}` : ""}`
}

/** Which repo page a pathname belongs to; nested routes (adrs/123) count as their section. */
export function activeSegment(pathname: string, repoId: string) {
  const rest = pathname.replace(`/dashboard/repos/${repoId}`, "").replace(/^\//, "")
  return rest.split("/")[0] ?? ""
}

export function activeRepoId(pathname: string) {
  const id = pathname.match(/^\/dashboard\/repos\/([^/]+)/)?.[1]
  return id && id !== "new" ? id : null
}

export function pageTitle(pathname: string) {
  const repoId = activeRepoId(pathname)
  if (repoId) {
    const seg = activeSegment(pathname, repoId)
    return REPO_PAGES.find((p) => p.segment === seg)?.label ?? "Repository"
  }
  if (pathname.startsWith("/dashboard/settings")) return "Settings"
  if (pathname.startsWith("/dashboard/repos/new")) return "Connect a repository"
  if (pathname.startsWith("/dashboard/repos")) return "Repositories"
  return "Dashboard"
}
