"use client"

import { Component, type ReactNode } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="mb-3 h-6 w-6 text-red-500/60" />
          <p className="mb-1 text-sm text-zinc-400">Something went wrong.</p>
          <p className="mb-4 font-mono text-[11px] text-zinc-600">{this.state.error.message}</p>
          <button
            onClick={this.reset}
            className="flex items-center gap-1.5 rounded-md border border-white/[0.07] px-3 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200"
          >
            <RefreshCw className="h-3 w-3" />
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
