import Link from "next/link"
import { sampleRepoPath } from "@/lib/sample"

const VIEWS = [
  { name: "Ask", page: "ask", purpose: "Questions about the code, answered with the files they came from." },
  { name: "Onboard", page: "onboard", purpose: "A guided walk through the repo for someone new to it." },
  { name: "Architecture", page: "architecture", purpose: "The main parts of the system and how they call each other." },
  { name: "Patterns", page: "patterns", purpose: "Design patterns found in the code, with the evidence for each." },
  { name: "APIs", page: "apis", purpose: "Every internal route and external service the code talks to." },
  { name: "Impact", page: "impact", purpose: "Which files a proposed change would affect, and how risky it is." },
  { name: "Decisions", page: "adrs", purpose: "Architecture decision records: what was decided and why." },
]

export function WhatItShows() {
  return (
    <section aria-labelledby="views-title" className="border-t border-kerb">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-16 md:px-8 lg:grid-cols-12">
        <h2 id="views-title" className="text-[1.9531rem] font-extrabold text-chalk lg:col-span-4">
          What it shows you
        </h2>
        <ul className="lg:col-span-8">
          {VIEWS.map((v) => (
            <li key={v.name} className="border-b border-kerb first:border-t">
              <Link href={sampleRepoPath(v.page)} className="group grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <span className="font-bold text-chalk group-hover:text-signal">{v.name}</span>
                <span className="text-fog">{v.purpose}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
