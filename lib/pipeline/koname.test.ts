import { describe, it, expect } from 'vitest'
import { koName, koTeam } from './koname'

const players = { 'P-1': '박지성' }
const teams = { 'T-71': '대한민국' }

describe('koName', () => {
  it('uses curated Korean name when present', () => {
    expect(koName('P-1', 'Park', 'Ji-sung', players)).toBe('박지성')
  })
  it('falls back to "Given Family" romanized when unmapped', () => {
    expect(koName('P-99', 'Smith', 'John', players)).toBe('John Smith')
  })
})

describe('koTeam', () => {
  it('maps team id to Korean', () => {
    expect(koTeam('T-71', 'South Korea', teams)).toBe('대한민국')
  })
  it('falls back to english name when unmapped', () => {
    expect(koTeam('T-00', 'Brazil', teams)).toBe('Brazil')
  })
})
