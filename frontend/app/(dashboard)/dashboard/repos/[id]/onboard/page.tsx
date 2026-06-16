"use client"

import { use } from "react"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function OnboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div className="h-[calc(100vh-10rem)]">
      <ChatInterface
        repoId={id}
        endpoint="onboard"
        placeholder="e.g. Where should I start reading? What's the architecture?"
        emptyState="Your AI onboarding buddy. Ask where to start, how things fit together, or what to read first."
      />
    </div>
  )
}
