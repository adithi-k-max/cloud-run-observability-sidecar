import { useState } from 'react'
import { FlaskConical, Trash2, AlertTriangle, Clock } from 'lucide-react'
import { SectionHeader } from '@/components/SectionHeader'
import { EmptyState } from '@/components/EmptyState'
import { ProbeButton } from '@/components/ProbeButton'
import { ResultBadge } from '@/components/ResultBadge'
import { DurationPill } from '@/components/DurationPill'
import { DetailsDrawer } from '@/components/DetailsDrawer'
import { probeEndpoint } from '@/lib/apiClient'
import { useProbeHistory } from '@/hooks/useProbeHistory'
import { useToast } from '@/hooks/useToast'
import { formatTimestamp } from '@/lib/utils'
import type { ProbeResult } from '@/types'

// ─── Endpoint Config ─────────────────────────────────────────────────────────

interface EndpointConfig {
  path: string
  label: string
  description: string
  warning?: string
  note?: string
}

const ENDPOINTS: EndpointConfig[] = [
  {
    path: '/',
    label: 'GET /',
    description: 'Root status endpoint. Returns application metadata.',
  },
  {
    path: '/health',
    label: 'GET /health',
    description: 'Health check endpoint. Returns dependency statuses.',
  },
  {
    path: '/products',
    label: 'GET /products',
    description: 'Returns product data as JSON.',
  },
  {
    path: '/slow',
    label: 'GET /slow',
    description:
      'Intentionally delays ~2s. Tests timeout behavior and slow-span instrumentation.',
    note: 'Intentionally slow ~2s — duration is measured client-side',
  },
  {
    path: '/error',
    label: 'GET /error',
    description:
      'Returns HTTP 500. Used to test error trace generation and failure handling.',
    warning: 'Expect HTTP 500 — this is the correct response from this endpoint',
  },
]

// ─── Probe Card ──────────────────────────────────────────────────────────────

interface ProbeCardProps {
  config: EndpointConfig
  isLoading: boolean
  lastResult: ProbeResult | null
  onProbe: () => void
}

function ProbeCard({ config, isLoading, lastResult, onProbe }: ProbeCardProps) {
  return (
    <div className="bg-[#191B18] border border-[rgba(162,166,155,0.12)] rounded-xl p-5 flex flex-col gap-4">
      {/* Label + description */}
      <div className="space-y-1.5">
        <div className="font-mono text-sm font-semibold text-[#D7FF64]">{config.label}</div>
        <p className="font-body text-xs text-[#A2A69B] leading-relaxed">{config.description}</p>
      </div>

      {/* Warning callout */}
      {config.warning && (
        <div className="flex items-start gap-2 bg-[rgba(255,107,94,0.08)] border border-[rgba(255,107,94,0.2)] rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[#FF6B5E] mt-0.5 shrink-0" />
          <span className="font-body text-xs text-[#FF6B5E] leading-relaxed">{config.warning}</span>
        </div>
      )}

      {/* Note callout */}
      {config.note && (
        <div className="flex items-start gap-2 bg-[rgba(119,217,247,0.06)] border border-[rgba(119,217,247,0.16)] rounded-lg px-3 py-2">
          <Clock className="w-3.5 h-3.5 text-[#77D9F7] mt-0.5 shrink-0" />
          <span className="font-body text-xs text-[#77D9F7] leading-relaxed">{config.note}</span>
        </div>
      )}

      {/* Last result inline summary */}
      {lastResult && (
        <div className="flex items-center gap-3 pt-1 border-t border-[rgba(162,166,155,0.08)]">
          <span className="font-mono text-xs text-[#A2A69B] shrink-0">
            {formatTimestamp(lastResult.timestamp)}
          </span>
          <ResultBadge status={lastResult.status} classification={lastResult.classification} />
          <DurationPill duration={lastResult.duration} />
        </div>
      )}

      {/* Probe button — pushed to bottom */}
      <div className="mt-auto">
        <ProbeButton label="Send Request" onClick={onProbe} isLoading={isLoading} />
      </div>
    </div>
  )
}

// ─── Classification helpers ───────────────────────────────────────────────────

function classificationColor(c: ProbeResult['classification']): string {
  switch (c) {
    case 'success':
      return 'text-[#D7FF64]'
    case 'http-error':
    case 'network-failure':
      return 'text-[#FF6B5E]'
  }
}

function classificationLabel(c: ProbeResult['classification']): string {
  switch (c) {
    case 'success':
      return 'Success'
    case 'http-error':
      return 'HTTP Error'
    case 'network-failure':
      return 'Network Failure'
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FailureLab() {
  // Per-endpoint loading states and last results, keyed by path
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})
  const [lastResultMap, setLastResultMap] = useState<Record<string, ProbeResult>>({})

  const [selectedResult, setSelectedResult] = useState<ProbeResult | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { history, addResult, clearHistory } = useProbeHistory()
  const { toast } = useToast()

  function setLoading(path: string, value: boolean) {
    setLoadingMap(prev => ({ ...prev, [path]: value }))
  }

  async function handleProbe(config: EndpointConfig) {
    if (loadingMap[config.path]) return
    setLoading(config.path, true)
    try {
      const result = await probeEndpoint(config.path)
      addResult(result)
      setLastResultMap(prev => ({ ...prev, [config.path]: result }))

      const isSuccess = result.classification === 'success'
      toast({
        variant: isSuccess ? 'success' : 'error',
        title: isSuccess
          ? `${config.label} succeeded`
          : `${config.label} returned error`,
        message:
          result.status != null
            ? `HTTP ${result.status} in ${result.duration}ms`
            : (result.error ?? 'Unknown error'),
      })
    } catch {
      toast({
        variant: 'error',
        title: `${config.label} failed`,
        message: 'Unexpected error during probe',
      })
    } finally {
      setLoading(config.path, false)
    }
  }

  function openDrawer(result: ProbeResult) {
    setSelectedResult(result)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<FlaskConical className="w-5 h-5" />}
        title="Failure Lab"
        description="Probe individual service endpoints. Observe HTTP status codes, durations, and response bodies. Each probe generates an OpenTelemetry trace."
      />

      {/* ── Probe Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {ENDPOINTS.map(config => (
          <ProbeCard
            key={config.path}
            config={config}
            isLoading={loadingMap[config.path] ?? false}
            lastResult={lastResultMap[config.path] ?? null}
            onProbe={() => handleProbe(config)}
          />
        ))}
      </div>

      {/* ── Results History ── */}
      <div className="bg-[#191B18] border border-[rgba(162,166,155,0.12)] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(162,166,155,0.12)]">
          <h2 className="font-display text-sm font-semibold text-[#A2A69B] uppercase tracking-wider">
            Request History
            {history.length > 0 && (
              <span className="ml-2 font-mono text-xs bg-[rgba(162,166,155,0.1)] text-[#A2A69B] px-1.5 py-0.5 rounded">
                {history.length}
              </span>
            )}
          </h2>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 font-body text-xs text-[#A2A69B] hover:text-[#FF6B5E] transition-colors duration-150"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          )}
        </div>

        {/* Body */}
        {history.length === 0 ? (
          <EmptyState
            icon={<FlaskConical className="w-6 h-6" />}
            title="No requests yet"
            description="Send a request using one of the probe cards above. Results will appear here with full response details."
          />
        ) : (
          <div className="divide-y divide-[rgba(162,166,155,0.08)]">
            {/* Column headers */}
            <div className="grid grid-cols-[80px_1fr_100px_100px_130px_24px] gap-4 px-5 py-2.5 bg-[rgba(162,166,155,0.04)]">
              <span className="font-body text-xs text-[#A2A69B]">Time</span>
              <span className="font-body text-xs text-[#A2A69B]">Path</span>
              <span className="font-body text-xs text-[#A2A69B]">Status</span>
              <span className="font-body text-xs text-[#A2A69B]">Duration</span>
              <span className="font-body text-xs text-[#A2A69B]">Classification</span>
              <span />
            </div>

            {/* Rows — newest first */}
            {history.map(result => (
              <button
                key={result.id}
                onClick={() => openDrawer(result)}
                className="grid grid-cols-[80px_1fr_100px_100px_130px_24px] gap-4 px-5 py-3.5 w-full text-left hover:bg-[rgba(162,166,155,0.04)] transition-colors duration-150 group"
              >
                <span className="font-mono text-xs text-[#A2A69B] truncate">
                  {formatTimestamp(result.timestamp)}
                </span>
                <span className="font-mono text-xs text-[#F4F4EC] truncate">{result.path}</span>
                <div>
                  <ResultBadge
                    status={result.status}
                    classification={result.classification}
                  />
                </div>
                <div>
                  <DurationPill duration={result.duration} />
                </div>
                <span
                  className={`font-body text-xs ${classificationColor(result.classification)}`}
                >
                  {classificationLabel(result.classification)}
                </span>
                <span className="text-[#A2A69B] group-hover:text-[#D7FF64] transition-colors duration-150 text-sm">
                  ›
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Details Drawer ── */}
      <DetailsDrawer
        result={selectedResult}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}
