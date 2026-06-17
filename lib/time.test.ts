import { describe, it, expect } from 'vitest'
import { toKstLabel, kstDateKey } from './time'

describe('toKstLabel', () => {
  it('UTC 01:00 → KST same day 10:00', () => {
    expect(toKstLabel('2026-06-19T01:00:00Z')).toBe('6/19 금 10:00')
  })
  it('UTC 17:00 → KST next day 02:00', () => {
    expect(toKstLabel('2026-06-17T17:00:00Z')).toBe('6/18 목 02:00')
  })
})

describe('kstDateKey', () => {
  it('returns KST calendar date YYYY-MM-DD', () => {
    expect(kstDateKey('2026-06-17T17:00:00Z')).toBe('2026-06-18')
  })
})
