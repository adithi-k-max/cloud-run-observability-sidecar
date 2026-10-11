import React from 'react'
import type { ServiceStatus } from '@/types'

interface StatusDotProps {
  status: ServiceStatus
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<
  ServiceStatus,
  { dotColor: string; ringColor: string; pulse: boolean; slowPulse: boolean }
> = {
  healthy: {
    dotColor: '#D7FF64',
    ringColor: '#D7FF64',
    pulse: true,
    slowPulse: false,
  },
  degraded: {
    dotColor: '#FF6B5E',
    ringColor: '#FF6B5E',
    pulse: false,
    slowPulse: false,
  },
  unknown: {
    dotColor: '#f59e0b',
    ringColor: '#f59e0b',
    pulse: false,
    slowPulse: true,
  },
}

const SIZE_CONFIG = {
  sm: { dot: 8, container: 14 },
  md: { dot: 10, container: 18 },
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status]
  const { dot, container } = SIZE_CONFIG[size]

  return (
    <span
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: container, height: container }}
      aria-label={`Service status: ${status}`}
      role="img"
    >
      {config.pulse && (
        <span
          className="animate-ping absolute inline-flex rounded-full opacity-40 motion-reduce:animate-none"
          style={{
            width: container,
            height: container,
            background: config.ringColor,
          }}
        />
      )}
      {config.slowPulse && (
        <span
          className="absolute inline-flex rounded-full opacity-40 motion-reduce:opacity-70"
          style={{
            width: container,
            height: container,
            background: config.ringColor,
            animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      )}
      <span
        className="relative inline-flex rounded-full"
        style={{
          width: dot,
          height: dot,
          background: config.dotColor,
          boxShadow: config.pulse
            ? `0 0 6px 1px ${config.dotColor}99`
            : undefined,
        }}
      />
    </span>
  )
}
