import { describe, it, expect } from 'vitest'
import { classifyResult, formatDuration, tryParseJson } from '@/lib/utils'
import { appendResult, clearHistory } from '@/lib/probeHistory'
import type { ProbeResult } from '@/types'

describe('classifyResult', () => {
  it('correctly classifies 200 as success', () => {
    expect(classifyResult(200, false)).toBe('success')
  })

  it('correctly classifies 500 as http-error, distinguishing from network failure', () => {
    expect(classifyResult(500, false)).toBe('http-error')
  })

  it('correctly classifies network errors and null status as network-failure', () => {
    expect(classifyResult(null, true)).toBe('network-failure')
    expect(classifyResult(null, false)).toBe('network-failure')
    expect(classifyResult(500, true)).toBe('network-failure')
  })
})

describe('formatDuration', () => {
  it('formats milliseconds under 1s as ms', () => {
    expect(formatDuration(42.3)).toBe('42ms')
    expect(formatDuration(999)).toBe('999ms')
  })

  it('formats durations >= 1s with decimal seconds', () => {
    expect(formatDuration(2000)).toBe('2.00s')
    expect(formatDuration(2500)).toBe('2.50s')
  })
})

describe('tryParseJson', () => {
  it('parses valid JSON text', () => {
    expect(tryParseJson('{"status":"ok"}')).toEqual({ status: 'ok' })
  })

  it('returns null on invalid JSON text without throwing', () => {
    expect(tryParseJson('Internal Server Error')).toBeNull()
  })
})

describe('probeHistory bounded storage', () => {
  it('bounds history to max 50 items', () => {
    let history: ProbeResult[] = []
    for (let i = 0; i < 60; i++) {
      const sample: ProbeResult = {
        id: `test-${i}`,
        timestamp: Date.now(),
        path: '/test',
        status: 200,
        duration: 15,
        classification: 'success',
        body: 'ok',
        error: null,
      }
      history = appendResult(history, sample)
    }

    expect(history.length).toBe(50)
    expect(history[0].id).toBe('test-10')
    expect(history[49].id).toBe('test-59')
  })

  it('clears history correctly', () => {
    const cleared = clearHistory()
    expect(cleared).toEqual([])
  })
})
