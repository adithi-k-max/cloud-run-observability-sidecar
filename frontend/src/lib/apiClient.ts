import type { ProbeResult, ResultClassification } from '@/types'
import { generateId } from '@/lib/utils'

// ─── Custom Error Types ───────────────────────────────────────────────────

/**
 * Thrown when a fetch fails without receiving an HTTP response
 * (connection refused, DNS failure, timeout, etc.).
 */
export class NetworkError extends Error {
  readonly duration: number
  constructor(message: string, duration: number) {
    super(message)
    this.name = 'NetworkError'
    this.duration = duration
  }
}

/**
 * Thrown when the server responds with a non-2xx status code.
 */
export class HttpError extends Error {
  readonly status: number
  readonly body: string
  readonly duration: number
  constructor(status: number, body: string, duration: number) {
    super(`HTTP ${status}`)
    this.name = 'HttpError'
    this.status = status
    this.body = body
    this.duration = duration
  }
}

// ─── Configuration ────────────────────────────────────────────────────────

/** Default request timeout in milliseconds */
const DEFAULT_TIMEOUT_MS = 10_000

/**
 * Extended timeout for the /slow endpoint, which intentionally blocks
 * for several seconds to test timeout/retry behaviour.
 */
const SLOW_TIMEOUT_MS = 20_000

function getTimeout(path: string): number {
  return path === '/slow' ? SLOW_TIMEOUT_MS : DEFAULT_TIMEOUT_MS
}

// ─── Raw Fetch ────────────────────────────────────────────────────────────

/**
 * Low-level fetch wrapper that:
 *  - Prepends /api to every path
 *  - Enforces a hard timeout via AbortController
 *  - Measures client-side round-trip duration
 *  - Throws typed errors (HttpError | NetworkError) instead of raw exceptions
 */
async function rawFetch(
  path: string,
  timeoutMs: number,
): Promise<{ status: number; body: string; duration: number }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const t0 = performance.now()

  try {
    const response = await fetch(`/api${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json, text/plain, */*' },
    })
    const duration = performance.now() - t0
    const body = await response.text()

    if (!response.ok) {
      throw new HttpError(response.status, body, duration)
    }

    return { status: response.status, body, duration }
  } catch (err) {
    const duration = performance.now() - t0

    // Re-throw HttpError as-is — it already carries status + body
    if (err instanceof HttpError) throw err

    // Map AbortError to a friendly timeout message
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new NetworkError(
        `Request timed out after ${Math.round(timeoutMs / 1000)}s`,
        duration,
      )
    }

    // All other fetch errors (CORS, refused, etc.)
    throw new NetworkError(
      err instanceof Error ? err.message : 'Network error',
      duration,
    )
  } finally {
    clearTimeout(timer)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Issues a single probe to the given path and returns a fully-shaped ProbeResult.
 * This function NEVER throws — all error states are captured in the return value.
 */
export async function probeEndpoint(path: string): Promise<ProbeResult> {
  const timestamp = Date.now()
  const id = generateId()
  const timeout = getTimeout(path)

  try {
    const { status, body, duration } = await rawFetch(path, timeout)
    return {
      id,
      timestamp,
      path,
      status,
      duration,
      classification: 'success' as ResultClassification,
      body,
      error: null,
    }
  } catch (err) {
    if (err instanceof HttpError) {
      return {
        id,
        timestamp,
        path,
        status: err.status,
        duration: err.duration,
        classification: 'http-error' as ResultClassification,
        body: err.body,
        error: null,
      }
    }

    if (err instanceof NetworkError) {
      return {
        id,
        timestamp,
        path,
        status: null,
        duration: err.duration,
        classification: 'network-failure' as ResultClassification,
        body: null,
        error: err.message,
      }
    }

    // Safety net — should never be reached
    return {
      id,
      timestamp,
      path,
      status: null,
      duration: 0,
      classification: 'network-failure' as ResultClassification,
      body: null,
      error: 'Unknown error',
    }
  }
}
