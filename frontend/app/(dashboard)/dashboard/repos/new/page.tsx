import { PageHeader } from "@/components/layout/page-header"
import { ConnectRepo } from "@/components/repos/connect-repo"

export default function NewRepoPage() {
  return (
    <div>
      <PageHeader title="Connect Repository" meta="Index a GitHub codebase" />
      <div className="px-5 py-6">
        <ConnectRepo />
      </div>
    </div>
  )
}
