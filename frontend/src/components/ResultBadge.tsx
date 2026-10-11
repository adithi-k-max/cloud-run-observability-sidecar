import React from 'react'
import type { ResultClassification } from '@/types'

interface ResultBadgeProps {
  status: number | null
  classification: ResultClassification
  size?: 'sm' | 'md'
}

function getBadgeStyle(
  status: number | null,
  classification: ResultClassification
): { bg: string; text: string; label: string } {
  if (status === null || classification === 'network-failure') {
    return {
      bg: 'rgba(162,166,155,0.12)',
      text: '#A2A69B',
      label: 'NO RESPONSE',
    }
  }

  if (status >= 200 && status < 300) {
    return { bg: '#D7FF64', text: '#10110F', label: String(status) }
  }

  if (status >= 300 && status < 400) {
    return { bg: '#77D9F7', text: '#10110F', label: String(status) }
  }

  if (status >= 400 && status < 500) {
    return { bg: '#f97316', text: '#10110F', label: String(status) }
  }

  if (status >= 500) {
    return { bg: '#FF6B5E', text: '#10110F', label: String(status) }
  }

  return {
    bg: 'rgba(162,166,155,0.12)',
    text: '#A2A69B',
    label: String(status),
  }
}

export const ResultBadge: React.FC<ResultBadgeProps> = ({
  status,
  classification,
  size = 'md',
}) => {
  const { bg, text, label } = getBadgeStyle(status, classification)

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] tracking-[0.12em]'
      : 'px-2.5 py-1 text-[11px] tracking-[0.12em]'

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold uppercase ${sizeClasses}`}
      style={{ background: bg, color: text }}
      aria-label={`HTTP status: ${label}`}
    >
      {label}
    </span>
  )
}
