/** The public demo's one sample repository: Dev Day One reading its own source. Must match backend demo fixtures. */
export const SAMPLE_REPO_ID = "5a3b1e00-0000-4000-8000-00000000d001"

export const sampleRepoPath = (page = "") => `/dashboard/repos/${SAMPLE_REPO_ID}${page ? `/${page}` : ""}`
