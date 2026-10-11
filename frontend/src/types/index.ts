// ─── Section Navigation ───────────────────────────────────────────────────
export type SectionId =
  | 'service-pulse'
  | 'failure-lab'
  | 'signal-inspector'
  | 'sidecar-resilience'
  | 'resource-cost-guard'

// ─── Probe Result Classification ─────────────────────────────────────────
export type ResultClassification = 'success' | 'http-error' | 'network-failure'

/**
 * A single probe result from a frontend-issued HTTP request.
 * All timing is client-observed via performance.now().
 */
export interface ProbeResult {
  /** Unique identifier for this result (timestamp + random suffix) */
  id: string
  /** Unix millisecond timestamp of when the probe was fired */
  timestamp: number
  /** Endpoint path probed, e.g. '/health' */
  path: string
  /** HTTP status code, or null when no response was received (network failure) */
  status: number | null
  /** Client-observed round-trip duration in milliseconds */
  duration: number
  /** Semantic classification of the outcome */
  classification: ResultClassification
  /** Raw response body text; null if unavailable (network failure / body read error) */
  body: string | null
  /** Human-readable error message for network failures; null for HTTP responses */
  error: string | null
}

// ─── Service Status ───────────────────────────────────────────────────────
/** Derived health status shown in the shell status indicator */
export type ServiceStatus = 'healthy' | 'degraded' | 'unknown'

// ─── Telemetry Signal Pipeline ────────────────────────────────────────────
export type SignalState = 'VERIFIED' | 'UNAVAILABLE' | 'UNKNOWN' | 'NOT_CONFIGURED'

/**
 * Represents a single stage in the telemetry signal pipeline
 * (e.g. OpenTelemetry SDK → Collector → Backend).
 */
export interface TelemetrySignal {
  /** Stable identifier for this pipeline stage */
  id: string
  /** Short display name for the stage, e.g. "SDK Instrumentation" */
  stage: string
  /** One-line description of what this stage does */
  description: string
  /** Current observed state of the stage */
  state: SignalState
  /** Additional context about the current state */
  detail: string
  /** Actionable guidance when state is not VERIFIED; null if no action needed */
  actionRequired: string | null
}

// ─── Resilience Test ──────────────────────────────────────────────────────
/**
 * A single step in a sidecar / circuit-breaker resilience test walkthrough.
 */
export interface ResilienceStep {
  /** 0-based ordering index */
  index: number
  /** Short label shown in the step list */
  label: string
  /** Detailed instructions telling the user what action to take */
  instructions: string
  /** What the system should do when this step is executed correctly */
  expectedBehavior: string
  /** The user's recorded observation for this step */
  userObservation: string
  /** Whether the user has marked this step as confirmed/observed */
  markedAsObserved: boolean
}

// ─── Toast Notifications ──────────────────────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  /** Stable unique identifier for deduplication and dismissal */
  id: string
  /** Visual variant controlling icon and color scheme */
  variant: ToastVariant
  /** Primary title line shown in bold */
  title: string
  /** Optional secondary message shown below the title */
  message?: string
  /** Auto-dismiss delay in milliseconds */
  durationMs: number
}
