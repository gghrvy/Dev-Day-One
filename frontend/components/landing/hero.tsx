import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CodeRef, RouteLine, RouteStation } from "@/components/route/route-line"
import { sampleRepoPath } from "@/lib/sample"

const ANSWER_ROUTE = [
  { path: "backend/routers/rag.py", start: 65, end: 97, note: "The Ask endpoint takes your question and streams the answer back." },
  { path: "backend/services/rag.py", start: 23, end: 55, note: "Embeds the question, fetches matching chunks, and sends them to the model." },
  { path: "backend/services/retriever.py", start: 5, end: 19, note: "Finds the five closest chunks with a pgvector similarity search." },
  { path: "backend/services/ai_stream.py", start: 10, end: 27, note: "Sends the list of files first, then the answer text, as one stream." },
]

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="mx-auto grid max-w-[1200px] gap-12 px-5 pb-20 pt-14 md:px-8 lg:grid-cols-12 lg:gap-8 lg:pt-24">
      <div className="lg:col-span-6">
        <h1 id="hero-title" className="text-[2.4414rem] font-extrabold leading-[1.05] text-chalk sm:text-[3.8147rem]">
          Your first day on a codebase, already oriented.
        </h1>
        <p className="mt-6 max-w-[52ch] text-[1.25rem] leading-relaxed text-fog">
          Dev Day One reads a repository and answers questions about it, citing the files it used.
        </p>
        <p className="mt-4 max-w-[52ch] text-fog">
          This is the working tool, shown with sample data. The sample repository is Dev Day One&apos;s own source code.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href={sampleRepoPath()}>Open the sample repo</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="#three-steps">Try it in three steps</Link>
          </Button>
        </div>
      </div>

      <figure className="rounded-[var(--radius-panel)] border border-kerb bg-asphalt p-5 sm:p-7 lg:col-span-6">
        <figcaption className="text-sm text-fog">A question about the sample repo</figcaption>
        <p className="mt-2 text-[1.25rem] font-bold text-chalk">How does a chat answer get its sources?</p>
        <p className="mt-4 text-fog">
          The question is embedded, the closest code chunks are pulled from the index, and the file list is sent to
          you before the answer text starts. Four files make that happen:
        </p>
        <RouteLine animate className="mt-6" aria-label="Files cited in this answer">
          {ANSWER_ROUTE.map((s, i) => (
            <RouteStation key={s.path} index={i} title={<CodeRef path={s.path} start={s.start} end={s.end} />}>
              {s.note}
            </RouteStation>
          ))}
        </RouteLine>
      </figure>
    </section>
  )
}
