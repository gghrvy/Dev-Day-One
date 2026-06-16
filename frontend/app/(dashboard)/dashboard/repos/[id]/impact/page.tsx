"use client"

import { use } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { ImpactForm } from "@/components/impact/impact-form"

export default function ImpactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div>
      <PageHeader title="Impact Analysis" meta="What breaks if I change X?" />
      <ImpactForm repoId={id} />
    </div>
  )
}
