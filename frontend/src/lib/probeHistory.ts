import type { ProbeResult } from '@/types'

const STORAGE_KEY = 'traceforge_probe_history'
const MAX_RESULTS = 50

/**
 * Loads the probe history array from localStorage.
 * Returns an empty array on any parse / storage error (never throws).
 */
export function loadHistory(): ProbeResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as ProbeResult[]
  } catch {
    return []
  }
}

/**
 * Persists the history array to localStorage, bounded to MAX_RESULTS entries.
 * Silently ignores QuotaExceededError and other storage errors.
 */
export function saveHistory(results: ProbeResult[]): void {
  try {
    const bounded = results.slice(-MAX_RESULTS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bounded))
  } catch {
    // Ignore quota errors — history is best-effort
  }
}

/**
 * Returns a new array with `newResult` appended, capping at MAX_RESULTS.
 * The oldest entries are dropped first (FIFO eviction).
 */
export function appendResult(results: ProbeResult[], newResult: ProbeResult): ProbeResult[] {
  const updated = [...results, newResult]
  if (updated.length > MAX_RESULTS) {
    return updated.slice(updated.length - MAX_RESULTS)
  }
  return updated
}

/**
 * Removes the history entry from localStorage and returns an empty array.
 * Safe to call even when no entry exists.
 */
export function clearHistory(): ProbeResult[] {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage errors
  }
  return []
}
