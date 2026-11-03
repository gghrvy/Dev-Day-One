"use client"

import { use } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { PageBody } from "@/components/layout/page-body"
import { KnowledgeForm } from "@/components/knowledge/knowledge-form"

export default function NewKnowledgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div>
      <PageHeader title="Add a note" description="Write down what the code doesn't say." />
      <PageBody>
        <KnowledgeForm repoId={id} />
      </PageBody>
    </div>
  )
}
