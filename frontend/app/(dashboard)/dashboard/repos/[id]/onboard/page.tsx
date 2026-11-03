"use client"

import { use } from "react"
import { IS_DEMO } from "@/lib/demo"
import { ChatInterface } from "@/components/chat/chat-interface"
import { PageHeader } from "@/components/layout/page-header"
import { PageBody } from "@/components/layout/page-body"

export default function OnboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div>
      <PageHeader
        title="Onboard"
        description={
          IS_DEMO
            ? "A guided walk through the repo for someone new to it. In the public demo, answers are pre-recorded."
            : "A guided walk through the repo for someone new to it."
        }
      />
      <PageBody>
        <ChatInterface repoId={id} endpoint="onboard" placeholder="Where should I start reading?" />
      </PageBody>
    </div>
  )
}
