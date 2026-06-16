type ToastType = "success" | "error" | "info"
type Handler = (message: string, type: ToastType) => void

let _handler: Handler | null = null

export function setToastHandler(fn: Handler) {
  _handler = fn
}

export function emitToast(message: string, type: ToastType = "error") {
  _handler?.(message, type)
}
