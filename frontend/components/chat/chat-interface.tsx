"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { useMutation, useQuery } from "@tanstack/react-query"
import { API_URL, apiFetch, authHeaders, errorMessage } from "@/lib/api/client"
import { IS_DEMO } from "@/lib/demo"
import { trackWake } from "@/lib/server-wake"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { Answer, Question, type Source } from "./message"

type Mode = "ask" | "onboard"

interface ChatInterfaceProps {
  repoId: string
  endpoint: Mode
  placeholder: string
  /** Question to pre-fill (not send), e.g. from the landing page's three steps. */
  initialQuestion?: string
}

interface HistoryMessage {
  id: string
  role: string
  content: string
  sources: Source[]
}

const MAX_CHARS = IS_DEMO ? 500 : 2000

const FALLBACK_PROMPTS: Record<Mode, string[]> = {
  ask: ["Where are requests authenticated?", "How does indexing work?", "What tables are in the database?"],
  onboard: ["Where should I start reading?", "How do I run it locally?", "How are the backend folders organised?"],
}

/** The AI SDK puts the raw response body in error.message; show the server's sentence, not JSON. */
function chatErrorText(error: Error): string {
  if (error.name === "TypeError" || /failed to fetch|networkerror|load failed/i.test(error.message)) {
    return "Can't reach the server. Check your connection and try again."
  }
  try {
    return errorMessage(JSON.parse(error.message), "The answer couldn't be loaded. Try again.")
  } catch {
    return error.message && !error.message.trim().startsWith("{") ? error.message : "The answer couldn't be loaded. Try again."
  }
}

function textOf(m: UIMessage) {
  return m.parts.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join("")
}

function sourcesOf(m: UIMessage): Source[] {
  const part = m.parts.find((p) => p.type === "data-sources") as { data?: Source[] } | undefined
  return part?.data ?? []
}

export function ChatInterface(props: ChatInterfaceProps) {
  const [headers, setHeaders] = useState<Record<string, string> | null>(null)
  const { data: history } = useQuery({
    queryKey: ["messages", props.repoId, props.endpoint],
    queryFn: () => apiFetch<HistoryMessage[]>(`/repos/${props.repoId}/messages?mode=${props.endpoint}`),
    enabled: headers !== null,
  })

  useEffect(() => {
    authHeaders().then(setHeaders)
  }, [])

  if (!headers || !history) return <p className="text-fog">Loading the conversation…</p>
  return <ChatInner key={`${props.repoId}-${props.endpoint}`} {...props} headers={headers} history={history} />
}

function ChatInner({
  repoId,
  endpoint,
  placeholder,
  initialQuestion,
  headers,
  history: initialHistory,
}: ChatInterfaceProps & { headers: Record<string, string>; history: HistoryMessage[] }) {
  const [input, setInput] = useState(initialQuestion?.slice(0, MAX_CHARS) ?? "")
  const [history, setHistory] = useState(initialHistory)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const { data: demoQuestions } = useQuery({
    queryKey: ["demo-questions"],
    queryFn: () => apiFetch<Record<Mode, string[]>>("/demo/questions"),
    enabled: IS_DEMO,
    staleTime: Infinity,
  })
  const suggested = (IS_DEMO ? demoQuestions?.[endpoint] : undefined) ?? FALLBACK_PROMPTS[endpoint]

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${API_URL}/repos/${repoId}/${endpoint}`,
        headers,
        // A sleeping free-tier server can take a minute; show the waking notice while it starts
        fetch: (input, init) => trackWake(fetch(input, init)),
      }),
    [repoId, endpoint, headers]
  )
  const { messages, sendMessage, status, error, clearError } = useChat({ transport })
  const busy = status === "submitted" || status === "streaming"

  const clearHistory = useMutation({
    mutationFn: () => apiFetch(`/repos/${repoId}/messages?mode=${endpoint}`, { method: "DELETE" }),
    onSuccess: () => {
      setHistory([])
      toast("Conversation cleared.", "success")
    },
  })

  useEffect(() => {
    if (!messages.length) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    bottomRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" })
  }, [messages])

  const send = (text: string) => {
    const q = text.trim()
    if (!q || busy) return
    if (error) clearError()
    sendMessage({ text: q })
    setInput("")
  }

  const exportMarkdown = () => {
    const all = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      ...messages.map((m) => ({ role: m.role, content: textOf(m) })),
    ]
    const md = all.map((m) => `**${m.role === "user" ? "You" : "Dev Day One"}**\n\n${m.content}`).join("\n\n---\n\n")
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }))
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-${endpoint}-${repoId.slice(0, 8)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasConversation = history.length > 0 || messages.length > 0

  return (
    <div className="max-w-[760px]">
      {hasConversation && (
        <div className="mb-2 flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={exportMarkdown}>Download as Markdown</Button>
          {!IS_DEMO && (
            <Button variant="ghost" size="sm" onClick={() => clearHistory.mutate()} disabled={clearHistory.isPending}>
              Clear conversation
            </Button>
          )}
        </div>
      )}

      <div className="space-y-8" aria-live="polite">
        {history.map((m) =>
          m.role === "user" ? <Question key={m.id} text={m.content} /> : <Answer key={m.id} text={m.content} sources={m.sources ?? []} />
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <Question key={m.id} text={textOf(m)} />
          ) : (
            <Answer key={m.id} text={textOf(m)} sources={sourcesOf(m)} streaming={busy && i === messages.length - 1} />
          )
        )}
        {status === "submitted" && <p className="text-fog">Finding the relevant files…</p>}
        {error && (
          <p role="alert" className="border-l-2 border-alert pl-4 text-chalk">
            {chatErrorText(error)}
          </p>
        )}
      </div>

      <section aria-labelledby="suggested-title" className="mt-8">
        <h2 id="suggested-title" className="text-sm text-fog">
          {hasConversation ? "Ask another" : "Suggested questions"}
        </h2>
        <ul className="mt-2">
          {suggested.map((q) => (
            <li key={q} className="border-b border-kerb first:border-t">
              <button
                onClick={() => send(q)}
                disabled={busy}
                className="w-full rounded-[var(--radius-control)] py-3 text-left text-chalk hover:text-signal disabled:opacity-50"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="sticky bottom-0 mt-8 bg-graphite py-4"
      >
        <label htmlFor={`chat-${endpoint}`} className="sr-only">Your question</label>
        <div className="flex items-end gap-2">
          <textarea
            id={`chat-${endpoint}`}
            rows={2}
            value={input}
            maxLength={MAX_CHARS}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send(input)
              }
            }}
            placeholder={placeholder}
            className="min-h-[3.25rem] flex-1 resize-y rounded-[var(--radius-control)] border border-kerb bg-asphalt px-3 py-2.5 text-chalk placeholder:text-fog hover:border-zinc-700 focus-visible:border-signal"
          />
          <Button type="submit" disabled={busy || !input.trim()}>
            {busy ? "Answering…" : "Ask"}
          </Button>
        </div>
        <p className="mt-1.5 flex justify-between gap-4 text-sm text-fog">
          <span>Enter to send, Shift+Enter for a new line</span>
          <span aria-live="polite">{input.length > MAX_CHARS * 0.8 ? `${input.length}/${MAX_CHARS}` : ""}</span>
        </p>
      </form>
      <div ref={bottomRef} />
    </div>
  )
}
