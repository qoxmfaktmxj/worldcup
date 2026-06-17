import { describe, it, expect } from 'vitest'
import { qualifyScenarios } from './qualify'

const groupA = [
  { code: 'MEX', points: 3, played: 1 },
  { code: 'KOR', points: 3, played: 1 },
  { code: 'CZE', points: 0, played: 1 },
  { code: 'RSA', points: 0, played: 1 },
]
describe('qualifyScenarios', () => {
  it('projects KOR points for win/draw/loss', () => {
    const s = qualifyScenarios(groupA, 'KOR')
    expect(s.win.points).toBe(6)
    expect(s.draw.points).toBe(4)
    expect(s.loss.points).toBe(3)
  })
  it('each outcome has a Korean note string', () => {
    const s = qualifyScenarios(groupA, 'KOR')
    expect(typeof s.win.note).toBe('string')
    expect(s.win.note.length).toBeGreaterThan(0)
  })
})
