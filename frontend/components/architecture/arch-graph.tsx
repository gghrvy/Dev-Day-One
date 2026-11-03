"use client"

import { useCallback, useState } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { X } from "lucide-react"
import type { ArchitectureGraph } from "@/types"

/** Node types differ by outline, not by colour (spec §3 Architecture). */
export const TYPE_STYLE: Record<string, { label: string; style: React.CSSProperties }> = {
  service: { label: "Service", style: { border: "2px solid #ECE9E2", borderRadius: "2px" } },
  module: { label: "Module", style: { border: "1px solid #9AA0A8", borderRadius: "4px" } },
  layer: { label: "Layer", style: { border: "1px dotted #9AA0A8", borderRadius: "4px" } },
  database: { label: "Database", style: { border: "2px solid #9AA0A8", borderRadius: "16px" } },
  external: { label: "External service", style: { border: "1px dashed #9AA0A8", borderRadius: "4px" } },
}

type NodeData = {
  label: string
  description?: string
  type: string
  files?: string[]
}

type ArchNode = Node<NodeData>

const COL_W = 230
const ROW_H = 140

/** Layered layout: each node sits one row below whatever calls it, so edges run downward.
 * Rows are ordered by the average position of their parents to reduce crossings. */
function layout(graph: ArchitectureGraph["graph_data"]): Map<string, { x: number; y: number }> {
  const ids = graph.nodes.map((n) => n.id)
  const level = new Map(ids.map((id) => [id, 0]))
  for (let pass = 0; pass < ids.length; pass++) {
    let changed = false
    for (const e of graph.edges) {
      const next = (level.get(e.source) ?? 0) + 1
      if (level.has(e.target) && next > level.get(e.target)! && next < ids.length) {
        level.set(e.target, next)
        changed = true
      }
    }
    if (!changed) break
  }

  const rows: string[][] = []
  for (const id of ids) (rows[level.get(id)!] ??= []).push(id)
  const widest = Math.max(...rows.filter(Boolean).map((r) => r.length))
  const pos = new Map<string, { x: number; y: number }>()
  rows.forEach((row, depth) => {
    if (!row) return
    const parentX = (id: string) => {
      const xs = graph.edges.filter((e) => e.target === id && pos.has(e.source)).map((e) => pos.get(e.source)!.x)
      return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : Infinity
    }
    const ordered = depth === 0 ? row : [...row].sort((a, b) => parentX(a) - parentX(b))
    const offset = ((widest - ordered.length) * COL_W) / 2
    ordered.forEach((id, i) => pos.set(id, { x: offset + i * COL_W, y: depth * ROW_H }))
  })
  return pos
}

function buildNodes(graph: ArchitectureGraph["graph_data"]): ArchNode[] {
  const pos = layout(graph)
  return graph.nodes.map((n) => ({
    id: n.id,
    position: pos.get(n.id) ?? { x: 0, y: 0 },
    data: { label: n.label, description: n.description, type: n.type, files: n.files },
    style: {
      background: "#22252A",
      color: "#ECE9E2",
      fontSize: "13px",
      fontWeight: 600,
      padding: "10px 14px",
      minWidth: "150px",
      ...(TYPE_STYLE[n.type]?.style ?? TYPE_STYLE.module.style),
    },
  }))
}

function buildEdges(graph: ArchitectureGraph["graph_data"]): Edge[] {
  return graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    style: { stroke: "#4A4F57", strokeWidth: 1.5 },
    labelStyle: { fill: "#9AA0A8", fontSize: "11px" },
    labelBgStyle: { fill: "#191B1E" },
  }))
}

export function ArchGraph({ graph }: { graph: ArchitectureGraph }) {
  const [nodes, , onNodesChange] = useNodesState(buildNodes(graph.graph_data))
  const [edges, , onEdgesChange] = useEdgesState(buildEdges(graph.graph_data))
  const [selected, setSelected] = useState<NodeData | null>(null)

  const onNodeClick: NodeMouseHandler<ArchNode> = useCallback((_, node) => {
    setSelected(node.data)
  }, [])

  return (
    <div
      className="relative h-[420px] w-full overflow-hidden rounded-[var(--radius-panel)] border border-kerb bg-graphite sm:h-[560px]"
      role="img"
      aria-label="Architecture graph. The same information is listed below the graph."
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodesConnectable={false}
        fitView
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#2A2E33" gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>

      {selected && (
        <aside className="absolute inset-x-3 bottom-3 rounded-[var(--radius-panel)] border border-kerb bg-asphalt p-4 shadow-[0_12px_32px_rgba(0,0,0,0.45)] sm:inset-x-auto sm:right-3 sm:top-3 sm:bottom-auto sm:w-72">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-chalk">{selected.label}</p>
              <p className="text-sm text-fog">{TYPE_STYLE[selected.type]?.label ?? selected.type}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              aria-label="Close details"
              className="flex size-8 items-center justify-center rounded-[var(--radius-control)] text-fog hover:text-chalk"
            >
              <X className="size-4" />
            </button>
          </div>
          {selected.description && <p className="mt-2 text-sm text-chalk">{selected.description}</p>}
          {selected.files && selected.files.length > 0 && (
            <ul className="mt-3 space-y-1">
              {selected.files.map((f) => (
                <li key={f} className="break-all font-mono text-[0.8125rem] text-route">{f}</li>
              ))}
            </ul>
          )}
        </aside>
      )}
    </div>
  )
}
