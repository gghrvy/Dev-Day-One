"use client"

import { use } from "react"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function AskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div className="h-[calc(100vh-10rem)]">
      <ChatInterface
        repoId={id}
        endpoint="ask"
        placeholder="Ask anything about this codebase…"
        emptyState="Ask the repository like you'd ask the senior dev who wrote it."
      />
    </div>
  )
}
