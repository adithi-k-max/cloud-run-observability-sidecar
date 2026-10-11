import React, { useEffect, useRef, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import type { ToastItem, ToastVariant } from '@/types'

// ─── Individual Toast ────────────────────────────────────────────────────────

interface ToastProps {
  item: ToastItem
  onDismiss: (id: string) => void
}

interface VariantConfig {
  borderColor: string
  icon: React.ReactNode
  iconColor: string
}

const VARIANT_CONFIG: Record<ToastVariant, VariantConfig> = {
  success: {
    borderColor: '#D7FF64',
    iconColor: '#D7FF64',
    icon: <CheckCircle2 size={16} strokeWidth={2} />,
  },
  error: {
    borderColor: '#FF6B5E',
    iconColor: '#FF6B5E',
    icon: <AlertCircle size={16} strokeWidth={2} />,
  },
  info: {
    borderColor: '#77D9F7',
    iconColor: '#77D9F7',
    icon: <Info size={16} strokeWidth={2} />,
  },
  warning: {
    borderColor: '#f59e0b',
    iconColor: '#f59e0b',
    icon: <AlertTriangle size={16} strokeWidth={2} />,
  },
}

export const Toast: React.FC<ToastProps> = ({ item, onDismiss }) => {
  const config = VARIANT_CONFIG[item.variant]
  const [progress, setProgress] = useState(100)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    startTimeRef.current = Date.now()

    // Tick every 50ms to update progress bar
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, 100 - (elapsed / item.durationMs) * 100)
      setProgress(remaining)
      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        onDismiss(item.id)
      }
    }, 50)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [item.id, item.durationMs, onDismiss])

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="
        relative flex flex-col w-full max-w-sm overflow-hidden
        bg-[#191B18] border border-[rgba(162,166,155,0.12)]
        shadow-lg
        motion-safe:animate-[slideUp_0.2s_ease-out]
      "
      style={{
        borderLeftWidth: 3,
        borderLeftColor: config.borderColor,
        borderLeftStyle: 'solid',
      }}
    >
      {/* Main content */}
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Icon */}
        <span
          className="flex-shrink-0 mt-0.5"
          aria-hidden="true"
          style={{ color: config.iconColor }}
        >
          {config.icon}
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm font-medium text-[#F4F4EC] leading-snug">
            {item.title}
          </p>
          {item.message && (
            <p className="font-body text-xs text-[#A2A69B] mt-0.5 leading-relaxed">
              {item.message}
            </p>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => onDismiss(item.id)}
          className="
            flex-shrink-0 flex items-center justify-center
            w-5 h-5 mt-0.5
            text-[#A2A69B] hover:text-[#F4F4EC]
            transition-colors duration-100
            focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D7FF64]
          "
          aria-label="Dismiss notification"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] w-full bg-[rgba(162,166,155,0.08)]">
        <div
          className="h-full transition-none"
          style={{
            width: `${progress}%`,
            background: config.borderColor,
          }}
        />
      </div>
    </div>
  )
}

// ─── Toast Container ─────────────────────────────────────────────────────────

interface ToastContainerProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  const visible = toasts.slice(-5) // max 5 visible

  if (visible.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 items-end"
      aria-label="Notifications"
    >
      {visible.map((item) => (
        <Toast key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
