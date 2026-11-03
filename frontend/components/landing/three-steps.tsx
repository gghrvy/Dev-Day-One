import { RouteLine, RouteStation } from "@/components/route/route-line"
import { sampleRepoPath } from "@/lib/sample"

const STEPS = [
  { title: "Open the sample repo", page: "", body: "See what was indexed and how the code is laid out." },
  { title: "Ask where requests are authenticated", page: "ask?q=" + encodeURIComponent("Where are requests authenticated?"), body: "The question is filled in. Press Ask, then follow the cited files." },
  { title: "See what a change would touch", page: "impact", body: "Read an impact analysis for a proposed change." },
]

export function ThreeSteps() {
  return (
    <section id="three-steps" aria-labelledby="three-steps-title" className="scroll-mt-4 border-t border-kerb">
      <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-8">
        <h2 id="three-steps-title" className="text-[1.9531rem] font-extrabold text-chalk">
          Try it in three steps
        </h2>
        <RouteLine orientation="horizontal" className="mt-10" aria-label="Three steps through the demo">
          {STEPS.map((s, i) => (
            <RouteStation
              key={s.title}
              index={i}
              tone={i === 0 ? "signal" : "muted"}
              title={s.title}
              href={sampleRepoPath(s.page)}
            >
              {s.body}
            </RouteStation>
          ))}
        </RouteLine>
      </div>
    </section>
  )
}
