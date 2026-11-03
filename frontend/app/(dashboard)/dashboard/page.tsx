import { redirect } from "next/navigation"

// The repository list is the home screen; the old stat cards repeated it.
export default function DashboardPage() {
  redirect("/dashboard/repos")
}
