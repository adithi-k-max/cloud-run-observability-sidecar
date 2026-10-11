import { useState, useCallback, useEffect } from 'react'
import type { ProbeResult } from '@/types'
import {
  loadHistory,
  saveHistory,
  appendResult,
  clearHistory,
} from '@/lib/probeHistory'

/**
 * Manages the probe history array with persistent localStorage backing.
 *
 * - Initialises from localStorage on mount (lazy initialiser avoids re-reads).
 * - Persists to localStorage whenever `history` changes.
 * - Provides `addResult` to append a new probe and `clearAll` to reset.
 */
export function useProbeHistory() {
  // Lazy initialiser: localStorage is read exactly once on mount
  const [history, setHistory] = useState<ProbeResult[]>(() => loadHistory())

  // Sync to localStorage whenever history changes
  useEffect(() => {
    saveHistory(history)
  }, [history])

  const addResult = useCallback((result: ProbeResult) => {
    setHistory((prev) => appendResult(prev, result))
  }, [])

  const clearAll = useCallback(() => {
    setHistory(clearHistory())
  }, [])

  return { history, addResult, clearAll, clearHistory: clearAll }
}
