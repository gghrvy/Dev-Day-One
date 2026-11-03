"use client"

import { use } from "react"
import { IS_DEMO } from "@/lib/demo"
import { ChatInterface } from "@/components/chat/chat-interface"
import { PageHeader } from "@/components/layout/page-header"
import { PageBody } from "@/components/layout/page-body"

export default function AskPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { id } = use(params)
  const { q } = use(searchParams)
  return (
    <div>
      <PageHeader
        title="Ask"
        description={
          IS_DEMO
            ? "Questions about the code, answered with the files they came from. In the public demo, answers are pre-recorded."
            : "Questions about the code, answered with the files they came from."
        }
      />
      <PageBody>
        <ChatInterface repoId={id} endpoint="ask" placeholder="Ask about this codebase" initialQuestion={q} />
      </PageBody>
    </div>
  )
}
