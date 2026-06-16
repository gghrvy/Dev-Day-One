"use client"

import { useCallback, useState } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeMouseHandler,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { X } from "lucide-react"
import type { ArchitectureGraph } from "@/types"

const TYPE_COLORS: Record<string, string> = {
  service:  "#6366F1",
  module:   "#F59E0B",
  database: "#10B981",
  external: "#EC4899",
  layer:    "#8B5CF6",
}

function buildNodes(graph: ArchitectureGraph["graph_data"]): Node[] {
  return graph.nodes.map((n, i) => ({
    id: n.id,
    position: { x: (i % 4) * 220, y: Math.floor(i / 4) * 160 },
    data: { label: n.label, description: n.description, type: n.type },
    style: {
      background: "#0C0C0E",
      border: `1px solid ${TYPE_COLORS[n.type] ?? "#3f3f46"}`,
      borderRadius: "8px",
      color: "#fafafa",
      fontSize: "12px",
      padding: "10px 14px",
      minWidth: "120px",
    },
  }))
}

function buildEdges(graph: ArchitectureGraph["graph_data"]): Edge[] {
  return graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    style: { stroke: "#3f3f46" },
    labelStyle: { fill: "#71717a", fontSize: "10px" },
    labelBgStyle: { fill: "#0C0C0E" },
  }))
}

interface NodeData {
  label: string
  description?: string
  type: string
}

export function ArchGraph({ graph }: { graph: ArchitectureGraph }) {
  const [nodes, , onNodesChange] = useNodesState(buildNodes(graph.graph_data))
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdges(graph.graph_data))
  const [selected, setSelected] = useState<NodeData | null>(null)

  const onConnect = useCallback(
    (c: Connection) => setEdges((eds) => addEdge(c, eds)),
    [setEdges]
  )

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelected(node.data as NodeData)
  }, [])

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-xl border border-white/[0.06]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#27272a" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(n) => TYPE_COLORS[(n.data as { type: string }).type] ?? "#3f3f46"}
          maskColor="#09090B99"
        />
      </ReactFlow>

      {selected && (
        <div className="absolute right-3 top-3 w-60 rounded-xl border border-white/[0.09] bg-[#0C0C0E]/95 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-100">{selected.label}</p>
              <span
                className="font-mono text-[9px] uppercase tracking-widest"
                style={{ color: TYPE_COLORS[selected.type] ?? "#71717a" }}
              >
                {selected.type}
              </span>
            </div>
            <button onClick={() => setSelected(null)} className="text-zinc-600 hover:text-zinc-400">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {selected.description && (
            <p className="text-[12px] leading-relaxed text-zinc-400">{selected.description}</p>
          )}
        </div>
      )}
    </div>
  )
}
