"use client"

import { useState } from "react"

export function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="my-3 overflow-hidden rounded-[var(--radius-panel)] border border-kerb bg-asphalt">
      <div className="flex items-center justify-between border-b border-kerb px-4 py-2 text-sm text-fog">
        <span>{language || "Code"}</span>
        <button onClick={copy} className="rounded-[var(--radius-control)] px-1 hover:text-chalk">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-[0.875rem] leading-relaxed text-chalk">{code}</code>
      </pre>
    </div>
  )
}

/** Inline `code` spans become monospace; everything else stays plain text. */
function renderInline(text: string, keyBase: string): React.ReactNode[] {
  return text.split(/(`[^`\n]+`)/g).map((piece, i) =>
    piece.startsWith("`") && piece.endsWith("`") && piece.length > 2 ? (
      <code key={`${keyBase}-${i}`} className="break-words font-mono text-[0.9em] text-chalk">
        {piece.slice(1, -1)}
      </code>
    ) : (
      piece
    )
  )
}

export function renderMessageContent(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match

  const pushProse = (prose: string, key: number) => {
    prose
      .split(/\n{2,}/)
      .filter((p) => p.trim())
      .forEach((para, i) =>
        parts.push(
          <p key={`${key}-${i}`} className="whitespace-pre-wrap text-chalk">
            {renderInline(para.trim(), `${key}-${i}`)}
          </p>
        )
      )
  }

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) pushProse(text.slice(lastIndex, match.index), lastIndex)
    parts.push(<CodeBlock key={`code-${match.index}`} language={match[1]} code={match[2].trim()} />)
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) pushProse(text.slice(lastIndex), lastIndex)
  return parts
}
