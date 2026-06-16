"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group relative my-2 overflow-hidden rounded-lg border border-white/[0.07] bg-[#080809]">
      <div className="flex items-center justify-between border-b border-white/[0.05] px-3 py-1.5">
        <span className="font-mono text-[10px] text-zinc-600">{language || "code"}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 text-zinc-700 transition-colors hover:text-zinc-400"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          <span className="font-mono text-[9px]">{copied ? "copied" : "copy"}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-3">
        <code className="font-mono text-[12px] leading-relaxed text-zinc-300">{code}</code>
      </pre>
    </div>
  )
}

export function renderMessageContent(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <p key={lastIndex} className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
          {text.slice(lastIndex, match.index)}
        </p>
      )
    }
    parts.push(
      <CodeBlock key={match.index} language={match[1]} code={match[2].trim()} />
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(
      <p key={lastIndex} className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
        {text.slice(lastIndex)}
      </p>
    )
  }

  return parts.length > 0 ? parts : [
    <p key={0} className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{text}</p>
  ]
}
