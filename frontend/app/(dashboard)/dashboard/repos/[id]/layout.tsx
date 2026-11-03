// The sidebar shows which repo and page you're on, so no breadcrumb is needed here.
export default function RepoDetailLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col">{children}</div>
}
