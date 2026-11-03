"use client"

import { use } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { PageBody } from "@/components/layout/page-body"
import { AdrForm } from "@/components/adrs/adr-form"

export default function NewAdrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div>
      <PageHeader title="New decision record" description="Write down a choice while the reasons are still fresh." />
      <PageBody>
        <AdrForm repoId={id} />
      </PageBody>
    </div>
  )
}
