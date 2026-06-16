import { Link2, Play, MessageSquare } from "lucide-react"

const STEPS = [
  {
    icon: Link2,
    step: "01",
    title: "Connect a repository",
    description: "Paste any GitHub URL. Public or private, any size.",
  },
  {
    icon: Play,
    step: "02",
    title: "Index the codebase",
    description: "We chunk, embed, and store your code using pgvector in seconds.",
  },
  {
    icon: MessageSquare,
    step: "03",
    title: "Ask anything",
    description: "Your team gets instant, cited answers grounded in your actual code.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-24 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14">
          <h2 className="text-3xl font-extrabold tracking-tighter text-zinc-50 sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-sm text-zinc-500">Live in under five minutes.</p>
        </div>

        <div className="relative grid gap-0 sm:grid-cols-3">
          {/* Connector line */}
          <div className="absolute left-[2.75rem] top-7 hidden h-px w-[calc(100%-5.5rem)] bg-white/[0.06] sm:block" />

          {STEPS.map((s, i) => (
            <div key={s.step} className="relative flex gap-5 sm:flex-col sm:gap-4">
              <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-[#0C0C0E]">
                <s.icon className="h-5 w-5 text-zinc-400" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 font-mono text-[9px] font-bold text-zinc-900">
                  {i + 1}
                </span>
              </div>
              <div className="pt-1 sm:pt-0">
                <div className="mb-0.5 font-mono text-[10px] text-zinc-600">{s.step}</div>
                <h3 className="text-sm font-semibold text-zinc-100">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
