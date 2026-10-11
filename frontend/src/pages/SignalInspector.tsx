import { useMemo } from 'react'
import { Radio, Terminal, AlertTriangle, CheckCircle2, HelpCircle, XCircle, MinusCircle } from 'lucide-react'
import { SectionHeader } from '@/components/SectionHeader'
import { EmptyState } from '@/components/EmptyState'
import { SignalBadge } from '@/components/SignalBadge'
import type { SignalState, TelemetrySignal } from '@/types'

function hasRecentSuccessfulProbe(): boolean {
  try {
    const raw = localStorage.getItem('traceforge_probe_history')
    if (!raw) return false
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return false
    return parsed.some((entry: unknown) => {
      if (typeof entry !== 'object' || entry === null) return false
      const e = entry as Record<string, unknown>
      const status = typeof e.status === 'number' ? e.status : null
      const classification = e.classification
      return classification === 'success' || (status !== null && status >= 200 && status < 300)
    })
  } catch {
    return false
  }
}

function buildPipelineSignals(stage1Verified: boolean): TelemetrySignal[] {
  return [
    {
      id: 'stage-1',
      stage: 'Stage 1',
      description: 'Application Response',
      state: stage1Verified ? 'VERIFIED' : 'UNKNOWN',
      detail:
        'FastAPI application is responding to HTTP requests. OpenTelemetry Python SDK is active in backend runtime.',
      actionRequired: stage1Verified
        ? null
        : 'Run a probe in Failure Lab to confirm application responsiveness',
    },
    {
      id: 'stage-2',
      stage: 'Stage 2',
      description: 'OpenTelemetry Emission',
      state: 'UNKNOWN',
      detail:
        'The application emits traces and metrics via the OTel SDK to the Collector over gRPC (localhost:4317). This channel is internal to the Docker network and is not directly observable from this browser.',
      actionRequired:
        'Check Collector logs for received spans: docker compose logs otel-collector',
    },
    {
      id: 'stage-3',
      stage: 'Stage 3',
      description: 'Collector Reception',
      state: 'UNKNOWN',
      detail:
        'The OpenTelemetry Collector is configured with a debug exporter. Reception cannot be confirmed from this UI without a queryable Collector API. Spans are printed to standard output.',
      actionRequired:
        "docker compose logs otel-collector | grep 'ScopeSpans #'",
    },
    {
      id: 'stage-4',
      stage: 'Stage 4',
      description: 'Cloud Telemetry Export',
      state: 'NOT_CONFIGURED',
      detail:
        'The current Collector configuration uses a debug exporter only. No cloud exporter (e.g., Google Cloud Trace, Datadog, Jaeger) is configured. Telemetry does not reach any persistent storage or query backend.',
      actionRequired:
        'Add a Google Cloud Trace exporter to the Collector configuration to enable cloud export.',
    },
  ]
}

function StateIcon({ state }: { state: SignalState }) {
  switch (state) {
    case 'VERIFIED':
      return <CheckCircle2 className="w-5 h-5 text-[#D7FF64]" />
    case 'UNAVAILABLE':
      return <XCircle className="w-5 h-5 text-[#FF6B5E]" />
    case 'UNKNOWN':
      return <HelpCircle className="w-5 h-5 text-[#f59e0b]" />
    case 'NOT_CONFIGURED':
      return <MinusCircle className="w-5 h-5 text-[#A2A69B]" />
  }
}

function PipelineStageCard({
  signal,
  isLast,
}: {
  signal: TelemetrySignal
  isLast: boolean
}) {
  return (
    <div className="relative flex flex-col gap-0">
      <div className="rounded-xl border border-[rgba(162,166,155,0.12)] bg-[#191B18] p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <StateIcon state={signal.state} />
            <div className="min-w-0">
              <span className="font-mono text-[10px] text-[#A2A69B] tracking-widest uppercase block mb-0.5">
                {signal.stage}
              </span>
              <h3 className="font-display font-semibold text-[#F4F4EC] text-base leading-tight">
                {signal.description}
              </h3>
            </div>
          </div>
          <SignalBadge state={signal.state} />
        </div>

        <p className="text-sm text-[#A2A69B] font-body leading-relaxed">
          {signal.detail}
        </p>

        {signal.actionRequired && (
          <div className="rounded-lg border border-[rgba(119,217,247,0.2)] bg-[rgba(119,217,247,0.05)] p-3 flex gap-3 items-start">
            <Terminal className="w-4 h-4 text-[#77D9F7] flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#77D9F7] uppercase tracking-wide block mb-1">
                Verification Command
              </span>
              <code className="font-mono text-xs text-[#F4F4EC] break-all whitespace-pre-wrap">
                {signal.actionRequired}
              </code>
            </div>
          </div>
        )}
      </div>

      {!isLast && (
        <div className="flex justify-center py-2">
          <div className="w-px h-6 bg-[rgba(162,166,155,0.2)]" />
        </div>
      )}
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-[rgba(162,166,155,0.12)]" />
      <span className="text-xs font-mono text-[#A2A69B] uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-[rgba(162,166,155,0.12)]" />
    </div>
  )
}

export function SignalInspector() {
  const stage1Verified = useMemo(() => hasRecentSuccessfulProbe(), [])
  const signals = useMemo(() => buildPipelineSignals(stage1Verified), [stage1Verified])

  return (
    <div className="space-y-8 pb-12">
      <SectionHeader
        icon={<Radio className="w-5 h-5" />}
        title="Signal Inspector"
        description="End-to-end OpenTelemetry pipeline evaluation. We distinguish between HTTP application responses, local Collector reception, and Cloud export without fabricating unverified telemetry."
      />

      {/* Pipeline Visualizer */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-sm text-[#F4F4EC] uppercase tracking-wider">
            Telemetry Delivery Stages
          </h3>
          <span className="font-mono text-xs text-[#A2A69B]">
            Browser Context Observed
          </span>
        </div>

        <div className="flex flex-col">
          {signals.map((signal, idx) => (
            <PipelineStageCard
              key={signal.id}
              signal={signal}
              isLast={idx === signals.length - 1}
            />
          ))}
        </div>
      </section>

      {/* Historical Trace Inspection State */}
      <section className="space-y-4">
        <SectionDivider label="Historical Trace Inspection" />

        <div className="rounded-xl border border-[rgba(162,166,155,0.12)] bg-[#191B18] p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-display font-semibold text-[#F4F4EC] text-base">
                Historical Trace Backend
              </h3>
              <p className="text-xs font-body text-[#A2A69B] mt-1">
                Persistent trace query engine & timeline analyzer
              </p>
            </div>
            <SignalBadge state="NOT_CONFIGURED" />
          </div>

          <p className="text-sm text-[#A2A69B] font-body leading-relaxed">
            The local Collector configuration outputs telemetry to a <span className="font-mono text-[#77D9F7]">debug</span> exporter in Docker logs.
            Because no trace storage backend (such as Google Cloud Trace, Jaeger, or Tempo) is attached, there is no historical query API available to this frontend.
          </p>

          <div className="rounded-lg border border-dashed border-[rgba(162,166,155,0.25)] bg-[#10110F]/60 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#A2A69B]" />
              <span className="font-mono text-xs text-[#A2A69B] uppercase font-semibold">
                Future Integration: Google Cloud Trace
              </span>
            </div>
            <p className="text-xs text-[#A2A69B]/80 font-body leading-relaxed">
              When a Cloud Trace exporter is configured in <code className="font-mono text-[#D7FF64]">otel-collector-config.yaml</code>,
              this panel can render span waterfall charts, root span latencies, and service dependency graphs directly from GCP APIs.
            </p>
          </div>
        </div>
      </section>

      {/* Metrics Inspection State */}
      <section className="space-y-4">
        <SectionDivider label="Metrics Query State" />

        <EmptyState
          icon={<Radio className="w-5 h-5 text-[#A2A69B]" />}
          title="No Historical Metrics Storage Configured"
          description="Collector debug exporter logs custom metrics to stdout only. Live metric aggregation requires a Prometheus endpoint or Google Cloud Monitoring metricWriter pipeline."
        />
      </section>
    </div>
  )
}

export default SignalInspector
