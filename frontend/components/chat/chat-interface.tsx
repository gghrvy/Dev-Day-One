"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { ArrowUp, Trash2, Download } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { apiFetch, getToken } from "@/lib/api/client"
import { useToast } from "@/components/ui/toast"
import { MessageBubble } from "./message-bubble"

interface ChatInterfaceProps {
  repoId: string
  endpoint: "ask" | "onboard"
  placeholder: string
  emptyState: string
}

interface HistoryMessage {
  id: string
  role: string
  content: string
  sources: Array<{ file_path: string; start_line?: number; end_line?: number }>
}

const SUGGESTED_PROMPTS = {
  ask: [
    "Where is authentication handled?",
    "How is error handling structured?",
    "Walk me through the main data flow.",
    "How do I run the test suite?",
  ],
  onboard: [
    "What should I set up first?",
    "What are the key conventions in this codebase?",
    "Where do I find the main entry point?",
    "What should a new engineer focus on first?",
  ],
}

function HistoryBubble({ role, content }: { role: string; content: string }) {
  if (role === "user") {
    return (
      <div className="flex justify-end px-4">
        <div className="max-w-[75%] rounded-xl rounded-tr-sm bg-white/[0.06] px-3.5 py-2.5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">{content}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="border-l-2 border-dawn-ai py-0.5 pl-4 pr-4">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{content}</p>
    </div>
  )
}

export function ChatInterface({ repoId, endpoint, placeholder, emptyState }: ChatInterfaceProps) {
  const [token, setToken] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryMessage[] | null>(null)

  useEffect(() => {
    getToken().then(setToken)
  }, [])

  useEffect(() => {
    if (!token) return
    apiFetch<HistoryMessage[]>(`/repos/${repoId}/messages?mode=${endpoint}`)
      .then(setHistory)
      .catch(() => setHistory([]))
  }, [token, repoId, endpoint])

  if (!token || history === null) return null

  return (
    <ChatInner
      key={`${repoId}-${endpoint}`}
      repoId={repoId}
      endpoint={endpoint}
      token={token}
      placeholder={placeholder}
      emptyState={emptyState}
      history={history}
    />
  )
}

function ChatInner({
  repoId,
  endpoint,
  token,
  placeholder,
  emptyState,
  history: initialHistory,
}: ChatInterfaceProps & { token: string; history: HistoryMessage[] }) {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState(initialHistory)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  const exportMarkdown = () => {
    const allMessages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      ...messages.map((m) => ({
        role: m.role,
        content: m.parts.filter((p) => p.type === "text").map((p) => (p as { type: "text"; text: string }).text).join(""),
      })),
    ]
    const md = allMessages
      .map((m) => `**${m.role === "user" ? "You" : "Dev Day One"}**\n\n${m.content}`)
      .join("\n\n---\n\n")
    const blob = new Blob([md], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-${endpoint}-${repoId.slice(0, 8)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearHistory = useMutation({
    mutationFn: () => apiFetch(`/repos/${repoId}/messages?mode=${endpoint}`, { method: "DELETE" }),
    onSuccess: () => {
      setHistory([])
      toast("Chat history cleared.", "success")
    },
    onError: () => toast("Failed to clear history.", "error"),
  })

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL}/repos/${repoId}/${endpoint}`,
      headers: { Authorization: `Bearer ${token}` },
    }),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const busy = status === "submitted" || status === "streaming"

  const submit = () => {
    if (!input.trim() || busy) return
    sendMessage({ text: input })
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }

  const suggested = SUGGESTED_PROMPTS[endpoint]

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      {(history.length > 0 || messages.length > 0) && (
        <div className="flex items-center justify-end gap-3 border-b border-white/[0.04] px-4 py-1.5">
          <button
            onClick={exportMarkdown}
            className="flex items-center gap-1 text-zinc-700 transition-colors hover:text-zinc-400"
          >
            <Download className="h-3 w-3" />
            <span className="font-mono text-[9px]">export</span>
          </button>
          <button
            onClick={() => clearHistory.mutate()}
            disabled={clearHistory.isPending}
            className="flex items-center gap-1 text-zinc-700 transition-colors hover:text-red-400 disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" />
            <span className="font-mono text-[9px]">clear</span>
          </button>
        </div>
      )}
      {/* Messages */}
      <div className="flex-1 space-y-5 overflow-y-auto py-5">
        {/* History from DB */}
        {history.map((m) => (
          <HistoryBubble key={m.id} role={m.role} content={m.content} />
        ))}
        {history.length > 0 && messages.length === 0 && (
          <div className="px-5">
            <div className="border-t border-white/[0.04] pt-3">
              <p className="text-center font-mono text-[10px] text-zinc-700">— continue the conversation —</p>
            </div>
          </div>
        )}
        {history.length === 0 && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-6">
            <p className="mb-6 max-w-sm text-center text-sm text-zinc-600">{emptyState}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggested.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage({ text: prompt })}
                  className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[12px] text-zinc-400 transition-colors hover:border-white/[0.12] hover:text-zinc-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={m.id}>
            <MessageBubble message={m} />
            {/* Follow-up suggestions after last assistant message */}
            {!busy && m.role === "assistant" && i === messages.length - 1 && (
              <div className="mt-2 flex flex-wrap gap-1.5 px-4">
                {SUGGESTED_PROMPTS[endpoint].slice(0, 2).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { sendMessage({ text: prompt }); setInput("") }}
                    className="rounded-full border border-white/[0.06] px-2.5 py-1 text-[10px] text-zinc-600 transition-colors hover:border-white/[0.10] hover:text-zinc-400"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && messages[messages.length - 1]?.role === "user" && (
          <div className="border-l-2 border-dawn-ai pl-4 pr-4">
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.05] p-4">
        <div className="flex items-end gap-2 rounded-xl border border-white/[0.07] bg-[#0C0C0E] px-3.5 py-2.5 focus-within:border-white/[0.12]">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={busy}
            className="flex-1 resize-none bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
            style={{ minHeight: "20px" }}
          />
          <button
            onClick={submit}
            disabled={busy || !input.trim()}
            className="mb-px flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-indigo-500 text-white transition-colors hover:bg-indigo-400 disabled:opacity-30"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between px-0.5">
          <p className="font-mono text-[10px] text-zinc-700">Shift+Enter for new line · Enter to send</p>
          {input.length > 0 && (
            <p className={`font-mono text-[10px] ${input.length > 1800 ? "text-red-500" : "text-zinc-700"}`}>
              {input.length}/2000
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
