import { PageHeader } from "@/components/layout/page-header"
import { PageBody } from "@/components/layout/page-body"
import { ConnectRepo } from "@/components/repos/connect-repo"

export default function NewRepoPage() {
  return (
    <div>
      <PageHeader title="Connect a repository" description="Add a GitHub repository, then index it to ask questions." />
      <PageBody>
        <ConnectRepo />
      </PageBody>
    </div>
  )
}
