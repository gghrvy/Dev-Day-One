import { Bot, GitBranch, Search, Zap } from "lucide-react"

const FEATURES = [
  {
    icon: Search,
    title: "Ask the Repository",
    description:
      "RAG-powered chat over your entire codebase. Ask where auth is handled, how errors flow, or why a specific pattern exists.",
    accent: "bg-indigo-500",
    iconColor: "text-indigo-400",
  },
  {
    icon: Bot,
    title: "AI Onboarding Guide",
    description:
      "Auto-generated onboarding answers for new hires. 'Where do I start?' gets a real answer — not a blank stare.",
    accent: "bg-amber-500",
    iconColor: "text-amber-400",
  },
  {
    icon: GitBranch,
    title: "Architecture Intelligence",
    description:
      "Understand module structure, dependency patterns, and code ownership without reading every file manually.",
    accent: "bg-emerald-500",
    iconColor: "text-emerald-400",
  },
  {
    icon: Zap,
    title: "Zero Config Indexing",
    description:
      "Connect a GitHub repo URL, click index, and you're live in minutes. No YAML, no config files, no setup.",
    accent: "bg-sky-500",
    iconColor: "text-sky-400",
  },
]

export function Features() {
  return (
    <section id="features" className="px-6 py-24 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14">
          <h2 className="text-3xl font-extrabold tracking-tighter text-zinc-50 sm:text-4xl">
            Built for engineers,
            <br />
            not documentation teams.
          </h2>
          <p className="mt-3 text-sm text-zinc-500">
            Everything your team needs to ramp up faster and stay aligned.
          </p>
        </div>

        <div className="grid gap-px bg-white/[0.04] sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative bg-[#09090B] p-6 transition-colors hover:bg-[#0C0C0E]"
            >
              <div className={`absolute left-0 top-0 h-full w-[2px] ${f.accent} opacity-0 transition-opacity group-hover:opacity-100`} />
              <div className={`mb-4 inline-flex rounded-lg bg-white/[0.04] p-2.5 ${f.iconColor}`}>
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-100">{f.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
