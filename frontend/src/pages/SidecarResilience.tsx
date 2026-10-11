import { useState } from 'react'
import { Shield, CheckCircle2, Circle, AlertTriangle, Terminal, Info } from 'lucide-react'
import { SectionHeader } from '@/components/SectionHeader'
import type { ResilienceStep } from '@/types'

const INITIAL_STEPS: ResilienceStep[] = [
  {
    index: 0,
    label: 'Baseline Request',
    instructions:
      'Run a probe to /products or /health in Failure Lab. Verify the backend responds with HTTP 200 while the Collector is running normally.',
    expectedBehavior:
      'HTTP 200 response. Application is healthy and spans are accepted by the Collector sidecar over gRPC :4317.',
    userObservation: '',
    markedAsObserved: false,
  },
  {
    index: 1,
    label: 'Stop Collector Sidecar',
    instructions:
      'In your terminal, stop only the OpenTelemetry Collector container:\n\ndocker compose stop otel-collector\n\nDo NOT stop the FastAPI backend container.',
    expectedBehavior:
      'The Collector container halts. The application remains running. The OTLP exporter will begin encountering connection refusals on :4317.',
    userObservation: '',
    markedAsObserved: false,
  },
  {
    index: 2,
    label: 'Probe During Collector Outage',
    instructions:
      'Run another probe to /products or /health in Failure Lab. Check if the HTTP response succeeds and note the client duration.',
    expectedBehavior:
      'HTTP 200 should still return. The application must not block or crash even though telemetry transport is unavailable.',
    userObservation: '',
    markedAsObserved: false,
  },
  {
    index: 3,
    label: 'Inspect Application Logs',
    instructions:
      'In your terminal, inspect recent FastAPI backend logs:\n\ndocker compose logs app --tail=30\n\nObserve whether OTLP batch processor errors or retry warnings are logged.',
    expectedBehavior:
      'The application logs transient OTLP export failures or retry warnings, but continue serving user requests without 500 errors.',
    userObservation: '',
    markedAsObserved: false,
  },
  {
    index: 4,
    label: 'Restart Collector Sidecar',
    instructions:
      'In your terminal, restart the Collector container:\n\ndocker compose start otel-collector\n\nWait approximately 5-10 seconds for the gRPC server to bind.',
    expectedBehavior:
      'The Collector resumes listening on :4317. The OTel SDK gRPC client channel reconnects automatically.',
    userObservation: '',
    markedAsObserved: false,
  },
  {
    index: 5,
    label: 'Post-Recovery Verification',
    instructions:
      'Run a new probe in Failure Lab. Then verify that spans once again reach the Collector:\n\ndocker compose logs otel-collector --tail=30',
    expectedBehavior:
      'HTTP 200 response. Collector stdout displays newly exported ScopeSpans. Service resilience is confirmed.',
    userObservation: '',
    markedAsObserved: false,
  },
]

export function SidecarResilience() {
  const [steps, setSteps] = useState<ResilienceStep[]>(INITIAL_STEPS)

  const observedCount = steps.filter((s) => s.markedAsObserved).length
  const allCompleted = observedCount === steps.length

  const handleObservationChange = (index: number, text: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.index === index ? { ...s, userObservation: text } : s))
    )
  }

  const handleMarkObserved = (index: number) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.index === index ? { ...s, markedAsObserved: true } : s
      )
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <SectionHeader
        icon={<Shield className="w-5 h-5" />}
        title="Sidecar Resilience"
        description="Verify service availability decoupling. Observability failures must never cause customer-facing downtime. Test Collector outage recovery using this safe manual workflow."
      />

      {/* Safety Banner */}
      <div className="rounded-xl border border-[rgba(255,107,94,0.3)] bg-[rgba(255,107,94,0.06)] p-5 flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-[#FF6B5E] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-display font-semibold text-sm text-[#FF6B5E] uppercase tracking-wider">
            Safety Guardrail: Manual Terminal Execution
          </h4>
          <p className="font-body text-xs text-[#A2A69B] leading-relaxed">
            TraceForge does NOT execute shell commands or manage Docker containers automatically.
            All commands must be executed manually in your terminal. You record actual observations below.
          </p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="rounded-xl border border-[rgba(162,166,155,0.12)] bg-[#191B18] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-display font-semibold text-sm text-[#F4F4EC]">
            Investigation Progress
          </span>
          <span className="font-mono text-xs text-[#D7FF64]">
            {observedCount} / {steps.length} Steps Verified
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#10110F] overflow-hidden">
          <div
            className="h-full bg-[#D7FF64] transition-all duration-300"
            style={{ width: `${(observedCount / steps.length) * 100}%` }}
          />
        </div>
        {allCompleted && (
          <p className="font-mono text-xs text-[#D7FF64] pt-1">
            ✓ Resilience audit completed. Application demonstrated availability decoupling during telemetry outage.
          </p>
        )}
      </div>

      {/* Why Resilience Matters Card */}
      <div className="rounded-xl border border-[rgba(162,166,155,0.12)] bg-[#191B18] p-6 space-y-3">
        <h3 className="font-display font-semibold text-sm text-[#F4F4EC] uppercase tracking-wider">
          Why Sidecar Resilience Matters
        </h3>
        <p className="font-body text-xs text-[#A2A69B] leading-relaxed">
          OpenTelemetry exporters communicate over gRPC or HTTP to an external sidecar process.
          If the sidecar crashes or runs out of memory, the application&apos;s OTel SDK must use non-blocking background threads
          and bounded memory queues so user requests never experience latency spikes or 500 errors.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.index}
            className={`rounded-xl border p-5 space-y-4 transition-colors ${
              step.markedAsObserved
                ? 'border-[rgba(215,255,100,0.3)] bg-[#191B18]'
                : 'border-[rgba(162,166,155,0.12)] bg-[#191B18]/70'
            }`}
          >
            {/* Step Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {step.markedAsObserved ? (
                  <CheckCircle2 className="w-5 h-5 text-[#D7FF64]" />
                ) : (
                  <Circle className="w-5 h-5 text-[#A2A69B]" />
                )}
                <div>
                  <span className="font-mono text-[10px] text-[#A2A69B] uppercase tracking-wider">
                    Step 0{step.index + 1}
                  </span>
                  <h4 className="font-display font-semibold text-sm text-[#F4F4EC]">
                    {step.label}
                  </h4>
                </div>
              </div>

              {step.markedAsObserved && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#D7FF64]/10 text-[#D7FF64] uppercase tracking-wider">
                  Observed
                </span>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase text-[#A2A69B] tracking-wider">
                Instructions
              </span>
              <div className="rounded-lg bg-[#10110F] border border-[rgba(162,166,155,0.12)] p-3 text-xs font-mono text-[#F4F4EC] whitespace-pre-line leading-relaxed">
                {step.instructions}
              </div>
            </div>

            {/* Expected Behavior */}
            <div className="flex items-start gap-2.5 rounded-lg bg-[#10110F]/50 border border-[rgba(162,166,155,0.08)] p-3">
              <Info className="w-4 h-4 text-[#77D9F7] flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-mono text-[10px] text-[#77D9F7] uppercase tracking-wider block">
                  Expected Behavior
                </span>
                <p className="font-body text-xs text-[#A2A69B] leading-relaxed">
                  {step.expectedBehavior}
                </p>
              </div>
            </div>

            {/* Observation Input */}
            <div className="space-y-2">
              <label
                htmlFor={`obs-${step.index}`}
                className="font-mono text-[10px] uppercase text-[#A2A69B] tracking-wider block"
              >
                Recorded Observation
              </label>
              <textarea
                id={`obs-${step.index}`}
                value={step.userObservation}
                onChange={(e) => handleObservationChange(step.index, e.target.value)}
                placeholder="Record actual HTTP status, response time, and terminal logs..."
                disabled={step.markedAsObserved}
                rows={2}
                className="w-full bg-[#10110F] border border-[rgba(162,166,155,0.15)] rounded-lg px-3 py-2 text-xs font-body text-[#F4F4EC] placeholder-[#A2A69B]/40 focus:outline-none focus:border-[#D7FF64] disabled:opacity-60"
              />
            </div>

            {/* Action Button */}
            {!step.markedAsObserved && (
              <button
                onClick={() => handleMarkObserved(step.index)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#191B18] border border-[#D7FF64]/40 text-[#D7FF64] hover:bg-[#D7FF64]/10 font-display text-xs font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D7FF64]"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Mark as Observed</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SidecarResilience
