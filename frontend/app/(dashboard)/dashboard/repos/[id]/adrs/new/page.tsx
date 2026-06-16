"use client"

import { use } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { AdrForm } from "@/components/adrs/adr-form"

export default function NewAdrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div>
      <PageHeader title="New ADR" meta="Architecture Decision Record" />
      <AdrForm repoId={id} />
    </div>
  )
}
