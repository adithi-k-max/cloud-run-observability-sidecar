import React from 'react'
import { CheckCircle2, XCircle, HelpCircle, MinusCircle } from 'lucide-react'
import type { SignalState } from '@/types'

interface SignalBadgeProps {
  state: SignalState
  label?: string
}

interface StateConfig {
  icon: React.ReactNode
  text: string
  border: string
  bg: string
  displayLabel: string
}

const STATE_CONFIG: Record<SignalState, StateConfig> = {
  VERIFIED: {
    icon: <CheckCircle2 size={12} strokeWidth={2.5} />,
    text: '#D7FF64',
    border: 'rgba(215,255,100,0.25)',
    bg: 'rgba(215,255,100,0.08)',
    displayLabel: 'VERIFIED',
  },
  UNAVAILABLE: {
    icon: <XCircle size={12} strokeWidth={2.5} />,
    text: '#FF6B5E',
    border: 'rgba(255,107,94,0.25)',
    bg: 'rgba(255,107,94,0.08)',
    displayLabel: 'UNAVAILABLE',
  },
  UNKNOWN: {
    icon: <HelpCircle size={12} strokeWidth={2.5} />,
    text: '#f59e0b',
    border: 'rgba(245,158,11,0.25)',
    bg: 'rgba(245,158,11,0.08)',
    displayLabel: 'UNKNOWN',
  },
  NOT_CONFIGURED: {
    icon: <MinusCircle size={12} strokeWidth={2.5} />,
    text: '#A2A69B',
    border: 'rgba(162,166,155,0.20)',
    bg: 'rgba(162,166,155,0.06)',
    displayLabel: 'NOT CONFIGURED',
  },
}

export const SignalBadge: React.FC<SignalBadgeProps> = ({ state, label }) => {
  const config = STATE_CONFIG[state]

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      {label && (
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#A2A69B]">
          {label}
        </span>
      )}
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 border font-mono text-[10px] font-medium uppercase tracking-[0.1em]"
        style={{
          color: config.text,
          borderColor: config.border,
          background: config.bg,
        }}
        aria-label={`Signal state: ${config.displayLabel}`}
      >
        <span aria-hidden="true" style={{ color: config.text, display: 'flex' }}>
          {config.icon}
        </span>
        {config.displayLabel}
      </span>
    </span>
  )
}
