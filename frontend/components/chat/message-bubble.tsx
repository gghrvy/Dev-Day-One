"use client"

import { useState } from "react"
import type { UIMessage } from "ai"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { SourceCitation, type Source } from "./source-citation"
import { renderMessageContent } from "./code-block"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      className="mt-1.5 flex items-center gap-1 text-zinc-700 transition-colors hover:text-zinc-400"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      <span className="font-mono text-[9px]">{copied ? "copied" : "copy"}</span>
    </button>
  )
}

export function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className="flex justify-end px-4">
        <div className="max-w-[75%] rounded-xl rounded-tr-sm bg-white/[0.06] px-3.5 py-2.5">
          {message.parts.map((part, i) => {
            if (part.type === "text") {
              return (
                <p key={i} className="text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
                  {part.text}
                </p>
              )
            }
            return null
          })}
        </div>
      </div>
    )
  }

  const fullText = message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("\n")

  return (
    <div className="border-l-2 border-dawn-ai pl-4 pr-4 py-0.5">
      <div className="space-y-2">
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return <div key={i}>{renderMessageContent(part.text)}</div>
          }
          if (part.type === "data-sources") {
            return <SourceCitation key={i} sources={part.data as Source[]} />
          }
          return null
        })}
      </div>
      <CopyButton text={fullText} />
    </div>
  )
}
