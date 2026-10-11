import { Gauge, Terminal, AlertCircle } from 'lucide-react'
import { SectionHeader } from '@/components/SectionHeader'
import { EmptyState } from '@/components/EmptyState'
import { SignalBadge } from '@/components/SignalBadge'

interface ResourceRowProps {
  label: string
  value: string
  note?: string
}

function ResourceRow({ label, value, note }: ResourceRowProps) {
  return (
    <tr className="border-b border-[rgba(162,166,155,0.08)] last:border-b-0">
      <td className="py-2.5 pr-4 font-mono text-xs text-[#A2A69B] whitespace-nowrap align-top">
        {label}
      </td>
      <td className="py-2.5 pl-0 align-top">
        <span className="text-sm font-body text-[#F4F4EC]">{value}</span>
        {note && (
          <span className="block text-xs text-[#A2A69B] font-body mt-0.5">
            {note}
          </span>
        )}
      </td>
    </tr>
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

export function ResourceCostGuard() {
  return (
    <div className="space-y-8 pb-12">
      <SectionHeader
        icon={<Gauge className="w-5 h-5" />}
        title="Resource & Cost Guard"
        description="Audit configured resource limits, container memory footprints, and telemetry export costs. We report verified static boundaries and honest unavailable states for uninstrumented metrics."
      />

      {/* 1. Configured Resource Limits */}
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-display font-semibold text-sm text-[#F4F4EC] uppercase tracking-wider">
              Configured Resource Limits
            </h3>
            <p className="text-xs text-[#A2A69B] font-body mt-0.5">
              Statically known from local Docker Compose environment configuration.
            </p>
          </div>
          <SignalBadge state="VERIFIED" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[rgba(162,166,155,0.12)] bg-[#191B18] p-5 space-y-3">
            <h4 className="font-display font-semibold text-sm text-[#F4F4EC]">
              FastAPI Application Container
            </h4>
            <table className="w-full border-collapse">
              <tbody>
                <ResourceRow
                  label="CPU Limit"
                  value="Unbounded"
                  note="No deploy.resources.limits.cpus specified"
                />
                <ResourceRow
                  label="Memory Limit"
                  value="Unbounded"
                  note="No deploy.resources.limits.memory specified"
                />
                <ResourceRow
                  label="Network"
                  value="Docker Bridge"
                  note="Exposing 8080:8080 to host"
                />
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-[rgba(162,166,155,0.12)] bg-[#191B18] p-5 space-y-3">
            <h4 className="font-display font-semibold text-sm text-[#F4F4EC]">
              OpenTelemetry Collector Sidecar
            </h4>
            <table className="w-full border-collapse">
              <tbody>
                <ResourceRow
                  label="CPU Limit"
                  value="Unbounded"
                  note="No deploy.resources.limits.cpus specified"
                />
                <ResourceRow
                  label="Memory Limit"
                  value="Unbounded"
                  note="No memory_limiter processor configured"
                />
                <ResourceRow
                  label="Port Binding"
                  value="gRPC :4317"
                  note="Internal container-to-container network"
                />
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg bg-[#10110F] border border-[rgba(162,166,155,0.12)] p-4 text-xs font-body text-[#A2A69B] flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#77D9F7] flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Neither container has explicit memory or CPU limits. In production environments,
            an unbounded Collector sidecar can crash or starve the main application if telemetry cardinality spikes.
          </p>
        </div>
      </section>

      {/* 2. Runtime Resource Usage */}
      <section className="space-y-4">
        <SectionDivider label="Runtime Utilization" />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-display font-semibold text-sm text-[#F4F4EC] uppercase tracking-wider">
              Runtime Resource Usage
            </h3>
            <p className="text-xs text-[#A2A69B] font-body mt-0.5">
              Live container CPU and memory consumption.
            </p>
          </div>
          <SignalBadge state="UNAVAILABLE" />
        </div>

        <EmptyState
          icon={<Gauge className="w-5 h-5 text-[#A2A69B]" />}
          title="Runtime Measurements Unavailable"
          description="Live CPU and memory usage cannot be scraped directly from the browser without a container monitoring agent or cAdvisor Prometheus endpoint."
        />

        <div className="rounded-lg border border-[rgba(119,217,247,0.2)] bg-[rgba(119,217,247,0.05)] p-3 flex gap-3 items-start">
          <Terminal className="w-4 h-4 text-[#77D9F7] flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-xs font-semibold text-[#77D9F7] uppercase tracking-wide block mb-1">
              Manual Terminal Inspection
            </span>
            <code className="font-mono text-xs text-[#F4F4EC] break-all">
              docker stats app otel-collector
            </code>
          </div>
        </div>
      </section>

      {/* 3. Telemetry Volume & Cardinality */}
      <section className="space-y-4">
        <SectionDivider label="Telemetry Volume" />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-display font-semibold text-sm text-[#F4F4EC] uppercase tracking-wider">
              Telemetry Volume & Cardinality
            </h3>
            <p className="text-xs text-[#A2A69B] font-body mt-0.5">
              Span ingress rates, dropped spans, and memory queue pressure.
            </p>
          </div>
          <SignalBadge state="UNAVAILABLE" />
        </div>

        <EmptyState
          icon={<Gauge className="w-5 h-5 text-[#A2A69B]" />}
          title="Telemetry Volume Unmetered"
          description="The debug exporter prints spans to stdout but does not maintain queryable internal volume metrics. Check container stdout logs for span emissions."
        />
      </section>

      {/* 4. Cloud Billing */}
      <section className="space-y-4">
        <SectionDivider label="Cloud Ingestion Billing" />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-display font-semibold text-sm text-[#F4F4EC] uppercase tracking-wider">
              Cloud Ingestion Billing
            </h3>
            <p className="text-xs text-[#A2A69B] font-body mt-0.5">
              Google Cloud Trace & Cloud Monitoring cost attribution.
            </p>
          </div>
          <SignalBadge state="NOT_CONFIGURED" />
        </div>

        <EmptyState
          title="No Cloud Billing Active"
          description="No telemetry is exported to Google Cloud Platform. Cloud Monitoring and Trace ingestion charges only accrue when a GCP exporter is active with credentials."
        />
      </section>

      {/* 5. Why Monitor the Sidecar */}
      <section className="rounded-xl border border-[rgba(162,166,155,0.12)] bg-[#191B18] p-6 space-y-4">
        <h3 className="font-display font-semibold text-sm text-[#F4F4EC] uppercase tracking-wider">
          Why Observability Sidecars Require Independent Monitoring
        </h3>
        <div className="space-y-3 font-body text-xs text-[#A2A69B] leading-relaxed">
          <p>
            An OpenTelemetry Collector sidecar is an autonomous software component that runs beside the application.
            During high traffic or error spikes, telemetry generation multiplies rapidly.
          </p>
          <p>
            If high cardinality attributes (such as unmasked UUIDs or raw query strings) enter span tags,
            the Collector&apos;s memory consumption grows exponentially. Without a <code className="font-mono text-[#D7FF64]">memory_limiter</code> processor,
            the Collector can crash, silently discarding observability signals right when debugging data is needed most.
          </p>
        </div>
      </section>
    </div>
  )
}

export default ResourceCostGuard
