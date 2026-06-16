export interface Repository {
  id: string
  name: string
  full_name: string
  github_url: string | null
  description: string | null
  indexed: boolean
  indexed_at: string | null
  created_at: string
}

export interface IndexingJob {
  id: string
  repo_id: string
  status: "pending" | "running" | "done" | "failed"
  progress: number
  error?: string | null
  started_at: string
  finished_at?: string | null
}

export interface Adr {
  id: string
  repo_id: string
  title: string
  status: "proposed" | "accepted" | "deprecated" | "superseded"
  context: string
  decision: string
  consequences: string
  linked_files: string[]
  created_at: string
  updated_at: string
}

export interface Pattern {
  name: string
  confidence: "high" | "medium" | "low"
  description: string
  evidence: string[]
}

export interface PatternDetection {
  id: string
  repo_id: string
  patterns: Pattern[]
  raw_analysis: string | null
  detected_at: string
}

export interface KnowledgeEntry {
  id: string
  repo_id: string
  author_id: string
  title: string
  body: string
  file_path: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ArchNode {
  id: string
  label: string
  type: "service" | "module" | "database" | "external" | "layer"
  description?: string
  files?: string[]
}

export interface ArchEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface ArchitectureGraph {
  id: string
  repo_id: string
  graph_data: { nodes: ArchNode[]; edges: ArchEdge[] }
  generated_at: string
}

export interface ImpactResult {
  summary: string
  affected_files: { path: string; reason: string; risk: "high" | "medium" | "low" }[]
  risk_level: "high" | "medium" | "low"
}

export interface ImpactAnalysis {
  id: string
  repo_id: string
  query: string
  result: ImpactResult
  created_at: string
}

export interface ApiInventoryItem {
  id: string
  repo_id: string
  name: string
  api_type: "internal" | "external"
  version: string | null
  endpoint: string | null
  file_path: string | null
  status: "active" | "deprecated" | "unknown"
  detected_at: string
}
