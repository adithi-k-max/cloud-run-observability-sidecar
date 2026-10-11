import {
  createContext,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { ToastItem, ToastVariant } from '@/types'
import { generateId } from '@/lib/utils'
import { ToastContainer } from '@/components/Toast'

// ─── Context Shape ────────────────────────────────────────────────────────

interface ToastContextValue {
  /**
   * Enqueue a new toast notification.
   * Automatically dismissed after `durationMs` (default 4 000ms).
   * At most 5 toasts are shown at once — oldest are evicted first.
   */
  toast: (opts: {
    title: string
    message?: string
    variant?: ToastVariant
    durationMs?: number
  }) => void
}

export const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
})

// ─── Provider ─────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  /**
   * Keeps setTimeout handles keyed by toast ID so we can cancel them
   * when the user manually dismisses a toast before it expires.
   */
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const toast = useCallback(
    (opts: {
      title: string
      message?: string
      variant?: ToastVariant
      durationMs?: number
    }) => {
      const id = generateId()
      const durationMs = opts.durationMs ?? 4_000
      const item: ToastItem = {
        id,
        variant: opts.variant ?? 'info',
        title: opts.title,
        message: opts.message,
        durationMs,
      }

      // Keep at most 5 toasts; oldest are removed from the front
      setToasts((prev) => [...prev.slice(-4), item])

      const timer = setTimeout(() => dismiss(id), durationMs)
      timers.current.set(id, timer)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}
