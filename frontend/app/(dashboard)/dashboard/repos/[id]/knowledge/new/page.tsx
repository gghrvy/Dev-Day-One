"use client"

import { use } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { KnowledgeForm } from "@/components/knowledge/knowledge-form"

export default function NewKnowledgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div>
      <PageHeader title="Add Knowledge" meta="Document the why" />
      <KnowledgeForm repoId={id} />
    </div>
  )
}
