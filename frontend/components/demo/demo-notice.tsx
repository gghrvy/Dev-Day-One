"use client"

import { IS_DEMO, DEMO_TURNED_OFF } from "@/lib/demo"
import { useServerWaking } from "@/lib/server-wake"

/** Shown on every page in the public demo. Also says when the free-tier server is waking up. */
export function DemoNotice() {
  const waking = useServerWaking()
  if (!IS_DEMO) return null
  return (
    <div className="border-b border-kerb bg-asphalt">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-2.5 text-sm md:px-8">
        <p>
          <strong className="font-bold text-signal">Public demo</strong>
          <span className="text-fog"> with sample data. {DEMO_TURNED_OFF}</span>
        </p>
        {waking && (
          <p role="status" className="text-chalk">
            Waking the demo server, can take up to a minute.
          </p>
        )}
      </div>
    </div>
  )
}
