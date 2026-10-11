import React from 'react'

interface DurationPillProps {
  duration: number
  label?: string
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  return `${(ms / 1000).toFixed(2)}s`
}

function getDurationColor(ms: number): { text: string; border: string; bg: string } {
  if (ms < 500) {
    return {
      text: '#77D9F7',
      border: 'rgba(119,217,247,0.25)',
      bg: 'rgba(119,217,247,0.08)',
    }
  }
  if (ms < 2000) {
    return {
      text: '#f59e0b',
      border: 'rgba(245,158,11,0.25)',
      bg: 'rgba(245,158,11,0.08)',
    }
  }
  return {
    text: '#FF6B5E',
    border: 'rgba(255,107,94,0.25)',
    bg: 'rgba(255,107,94,0.08)',
  }
}

export const DurationPill: React.FC<DurationPillProps> = ({
  duration,
  label = 'client-observed',
}) => {
  const { text, border, bg } = getDurationColor(duration)
  const formatted = formatDuration(duration)

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <span
        className="inline-flex items-center px-2.5 py-1 border font-mono text-[12px] font-medium tracking-[0.04em]"
        style={{ color: text, borderColor: border, background: bg }}
        aria-label={`Duration: ${formatted}`}
      >
        {formatted}
      </span>
      {label && (
        <span
          className="font-mono text-[9px] uppercase tracking-[0.15em] pl-0.5 text-[#A2A69B]"
        >
          {label}
        </span>
      )}
    </span>
  )
}
