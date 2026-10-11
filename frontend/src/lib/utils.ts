import { clsx, type ClassValue } from 'clsx'
import type { ResultClassification, SignalState } from '@/types'

/**
 * Merges class names using clsx. Keeps conditional class logic readable.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

/**
 * Generates a collision-resistant unique id using timestamp + random base-36 suffix.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Formats a duration (in ms) as a human-readable string.
 * Values under 1 000 ms render as "NNNms"; above as "N.NNs".
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

/**
 * Formats a Unix-ms timestamp as HH:MM:SS (24-hour, locale en-US).
 */
export function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

/**
 * Formats a Unix-ms timestamp as "Mon DD, HH:MM:SS" (24-hour, locale en-US).
 */
export function formatFullTimestamp(ms: number): string {
  return new Date(ms).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

/**
 * Derives a ResultClassification from the raw HTTP status and error flag.
 * Network errors (no response) take priority over status codes.
 */
export function classifyResult(
  status: number | null,
  hadNetworkError: boolean,
): ResultClassification {
  if (hadNetworkError || status === null) return 'network-failure'
  if (status >= 200 && status < 300) return 'success'
  return 'http-error'
}

/**
 * Maps a SignalState enum value to its display label.
 */
export function getSignalStateLabel(state: SignalState): string {
  switch (state) {
    case 'VERIFIED':       return 'Verified'
    case 'UNAVAILABLE':    return 'Unavailable'
    case 'UNKNOWN':        return 'Unknown'
    case 'NOT_CONFIGURED': return 'Not Configured'
  }
}

/**
 * Attempts to JSON-parse a string. Returns the parsed value or null on failure.
 * Does NOT throw.
 */
export function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * Pretty-prints a JSON string with 2-space indentation.
 * Falls back to the original string if parsing fails.
 */
export function formatJsonBody(body: string): string {
  const parsed = tryParseJson(body)
  if (parsed !== null) {
    return JSON.stringify(parsed, null, 2)
  }
  return body
}
