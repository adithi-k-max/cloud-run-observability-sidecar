import { useState, useEffect, useRef, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Activity, Clock, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { SectionHeader } from '@/components/SectionHeader'
import { ResultBadge } from '@/components/ResultBadge'
import { DurationPill } from '@/components/DurationPill'
import { CodeBlock } from '@/components/CodeBlock'
import { ProbeButton } from '@/components/ProbeButton'
import { probeEndpoint } from '@/lib/apiClient'
import { useToast } from '@/hooks/useToast'
import { formatTimestamp, formatFullTimestamp } from '@/lib/utils'
import type { ProbeResult, ServiceStatus } from '@/types'

const AUTO_REFRESH_INTERVAL = 30
const MAX_HISTORY = 10

interface ServicePulseProps {
  onStatusUpdate: (status: ServiceStatus) => void
}

function classificationLabel(c: ProbeResult['classification']): string {
  switch (c) {
    case 'success': return 'Success'
    case 'http-error': return 'HTTP Error'
    case 'network-failure': return 'Network Failure'
  }
}

function classificationColor(c: ProbeResult['classification']): string {
  switch (c) {
    case 'success': return 'text-[#D7FF64]'
    case 'http-error': return 'text-[#FF6B5E]'
    case 'network-failure': return 'text-[#FF6B5E]'
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="bg-[#191B18] border border-[rgba(162,166,155,0.12)] rounded-lg px-3 py-2 font-mono text-xs text-[#F4F4EC]">
      <div className="text-[#A2A69B]">{entry.payload.label}</div>
      <div>
        <span className="text-[#D7FF64]">{entry.value}</span>
        <span className="text-[#A2A69B] ml-1">ms</span>
      </div>
    </div>
  )
}

export function ServicePulse({ onStatusUpdate }: ServicePulseProps) {
  const [history, setHistory] = useState<ProbeResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [countdown, setCountdown] = useState(AUTO_REFRESH_INTERVAL)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { toast } = useToast()

  const latestResult = history[0] ?? null

  const runCheck = useCallback(async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      const result = await probeEndpoint('/health')
      setHistory(prev => [result, ...prev].slice(0, MAX_HISTORY))
      const isSuccess = result.classification === 'success'
      onStatusUpdate(isSuccess ? 'healthy' : 'degraded')
      toast({
        variant: isSuccess ? 'success' : 'error',
        title: isSuccess ? 'Health check passed' : 'Health check failed',
        message: isSuccess
          ? `HTTP ${result.status} in ${result.duration}ms`
          : result.error ?? `HTTP ${result.status}`,
      })
    } catch {
      onStatusUpdate('degraded')
      toast({ variant: 'error', title: 'Health check failed', message: 'Unexpected error during probe' })
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, onStatusUpdate, toast])

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) {
      if (countdownRef.current) clearInterval(countdownRef.current)
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current)
      setCountdown(AUTO_REFRESH_INTERVAL)
      return
    }

    setCountdown(AUTO_REFRESH_INTERVAL)

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return AUTO_REFRESH_INTERVAL
        return prev - 1
      })
    }, 1000)

    autoRefreshRef.current = setInterval(() => {
      runCheck()
    }, AUTO_REFRESH_INTERVAL * 1000)

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh])

  // Sparkline data — oldest first so the line goes left→right chronologically
  const sparklineData = [...history]
    .reverse()
    .map((r, i) => ({
      index: i,
      label: formatTimestamp(r.timestamp),
      duration: r.duration,
    }))

  const lastSuccess = history.find(r => r.classification === 'success')

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Activity className="w-5 h-5" />}
        title="Service Pulse"
        description="Monitor /health endpoint in real time. Observe HTTP status, client-side latency, and response payload."
        actions={
          <div className="flex items-center gap-3">
            {/* Auto-refresh toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                role="switch"
                aria-checked={autoRefresh}
                onClick={() => setAutoRefresh(prev => !prev)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none ${
                  autoRefresh ? 'bg-[#D7FF64]' : 'bg-[rgba(162,166,155,0.2)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#10110F] transition-transform duration-200 ${
                    autoRefresh ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="text-sm font-body text-[#A2A69B]">
                Auto-refresh
                {autoRefresh && (
                  <span className="ml-1 text-[#D7FF64] font-mono text-xs">({countdown}s)</span>
                )}
              </span>
            </label>

            <ProbeButton label="Run Health Check" onClick={runCheck} isLoading={isLoading} />
          </div>
        }
      />

      {/* ── Current Status Panel ── */}
      <div className="bg-[#191B18] border border-[rgba(162,166,155,0.12)] rounded-xl p-5 space-y-5">
        <h2 className="font-display text-sm font-semibold text-[#A2A69B] uppercase tracking-wider">
          Current Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* HTTP Status */}
          <div className="space-y-1.5">
            <span className="font-body text-xs text-[#A2A69B]">HTTP Status</span>
            <div className="flex items-center h-8">
              {latestResult ? (
                <ResultBadge
                  status={latestResult.status}
                  classification={latestResult.classification}
                />
              ) : (
                <span className="font-mono text-sm text-[#A2A69B]">—</span>
              )}
            </div>
          </div>

          {/* Client Duration */}
          <div className="space-y-1.5">
            <span className="font-body text-xs text-[#A2A69B]">Client Duration</span>
            <div className="flex items-center h-8">
              {latestResult ? (
                <DurationPill duration={latestResult.duration} />
              ) : (
                <span className="font-mono text-sm text-[#A2A69B]">—</span>
              )}
            </div>
          </div>

          {/* Last Successful Check */}
          <div className="space-y-1.5">
            <span className="font-body text-xs text-[#A2A69B]">Last Successful Check</span>
            <div className="flex items-center h-8">
              {lastSuccess ? (
                <span className="font-mono text-sm text-[#F4F4EC]">
                  {formatFullTimestamp(lastSuccess.timestamp)}
                </span>
              ) : (
                <span className="font-mono text-sm text-[#A2A69B]">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Response Body */}
        <div>
          {latestResult?.body ? (
            <CodeBlock content={latestResult.body} label="Response Body" />
          ) : (
            <div className="bg-[#10110F] border border-[rgba(162,166,155,0.12)] rounded-lg p-4">
              <p className="font-mono text-xs text-[#A2A69B]">
                {latestResult?.error
                  ? latestResult.error
                  : 'No response body — run a health check to see data here.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Duration Sparkline ── */}
      {sparklineData.length >= 2 && (
        <div className="bg-[#191B18] border border-[rgba(162,166,155,0.12)] rounded-xl p-5 space-y-3">
          <h2 className="font-display text-sm font-semibold text-[#A2A69B] uppercase tracking-wider">
            Duration Trend
          </h2>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={sparklineData}
                margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(162,166,155,0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{
                    fill: '#A2A69B',
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{
                    fill: '#A2A69B',
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                  tickLine={false}
                  axisLine={false}
                  unit="ms"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="#D7FF64"
                  strokeWidth={2}
                  dot={{ fill: '#D7FF64', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: '#D7FF64', r: 5, strokeWidth: 0 }}
                  isAnimationActive={!prefersReducedMotion}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Disclaimer ── */}
      <div className="flex gap-2.5 bg-[rgba(119,217,247,0.06)] border border-[rgba(119,217,247,0.16)] rounded-xl p-4">
        <Info className="w-4 h-4 text-[#77D9F7] mt-0.5 shrink-0" />
        <p className="font-body text-xs text-[#77D9F7] leading-relaxed">
          Client-observed duration is measured from request initiation to response receipt in this
          browser. It includes network latency and is not equivalent to server-side span duration
          from OpenTelemetry.
        </p>
      </div>

      {/* ── Recent History ── */}
      <div className="bg-[#191B18] border border-[rgba(162,166,155,0.12)] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(162,166,155,0.12)]">
          <h2 className="font-display text-sm font-semibold text-[#A2A69B] uppercase tracking-wider">
            Recent Checks
          </h2>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
            <div className="w-10 h-10 rounded-full bg-[rgba(162,166,155,0.08)] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#A2A69B]" />
            </div>
            <p className="font-body text-sm text-[#A2A69B]">
              No health checks yet. Run your first check above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(162,166,155,0.08)]">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_100px_100px_130px_20px] gap-4 px-5 py-2.5 bg-[rgba(162,166,155,0.04)]">
              <span className="font-body text-xs text-[#A2A69B]">Timestamp</span>
              <span className="font-body text-xs text-[#A2A69B]">Status</span>
              <span className="font-body text-xs text-[#A2A69B]">Duration</span>
              <span className="font-body text-xs text-[#A2A69B]">Classification</span>
              <span />
            </div>

            {history.map(result => (
              <div key={result.id}>
                <button
                  onClick={() =>
                    setExpandedId(prev => (prev === result.id ? null : result.id))
                  }
                  className="grid grid-cols-[1fr_100px_100px_130px_20px] gap-4 px-5 py-3.5 w-full text-left hover:bg-[rgba(162,166,155,0.04)] transition-colors duration-150 group"
                  aria-expanded={expandedId === result.id}
                >
                  <span className="font-mono text-xs text-[#F4F4EC] truncate">
                    {formatFullTimestamp(result.timestamp)}
                  </span>
                  <div>
                    <ResultBadge
                      status={result.status}
                      classification={result.classification}
                    />
                  </div>
                  <div>
                    <DurationPill duration={result.duration} />
                  </div>
                  <span className={`font-body text-xs ${classificationColor(result.classification)}`}>
                    {classificationLabel(result.classification)}
                  </span>
                  <span
                    className={`text-[#A2A69B] inline-block transition-transform duration-200 ${
                      expandedId === result.id ? 'rotate-90' : ''
                    }`}
                  >
                    ›
                  </span>
                </button>

                {/* Inline Expansion */}
                {expandedId === result.id && (
                  <div className="px-5 pb-4 pt-1 space-y-3 bg-[rgba(162,166,155,0.02)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-[#A2A69B]">Full Timestamp: </span>
                        <span className="text-[#F4F4EC]">
                          {formatFullTimestamp(result.timestamp)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#A2A69B]">Path: </span>
                        <span className="text-[#F4F4EC]">{result.path}</span>
                      </div>
                      {result.error && (
                        <div className="col-span-2">
                          <span className="text-[#A2A69B]">Error: </span>
                          <span className="text-[#FF6B5E]">{result.error}</span>
                        </div>
                      )}
                    </div>
                    {result.body && (
                      <CodeBlock content={result.body} label="Response Body" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 px-1">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#D7FF64]" />
          <span className="font-body text-xs text-[#A2A69B]">Healthy — 2xx response</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[#FF6B5E]" />
          <span className="font-body text-xs text-[#A2A69B]">Degraded — error or non-2xx</span>
        </div>
      </div>
    </div>
  )
}
