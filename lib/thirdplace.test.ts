import { describe, it, expect } from 'vitest'
import { thirdPlaceRanking } from './thirdplace'
import type { GroupStanding } from './types'

const mk = (group: string, third: { code: string; points: number; gd: number; gf: number }): GroupStanding => ({
  group,
  rows: [
    { position: 1, team: { id: 't1', name: 'A', nameKo: 'A', code: 'AAA' }, played: 1, wins: 1, draws: 0, losses: 0, gf: 3, ga: 0, gd: 3, points: 3, advanced: false },
    { position: 2, team: { id: 't2', name: 'B', nameKo: 'B', code: 'BBB' }, played: 1, wins: 0, draws: 1, losses: 0, gf: 1, ga: 1, gd: 0, points: 1, advanced: false },
    { position: 3, team: { id: 't3'+third.code, name: third.code, nameKo: third.code, code: third.code }, played: 1, wins: 0, draws: 1, losses: 0, gf: third.gf, ga: third.gf - third.gd, gd: third.gd, points: third.points, advanced: false },
    { position: 4, team: { id: 't4', name: 'D', nameKo: 'D', code: 'DDD' }, played: 1, wins: 0, draws: 0, losses: 1, gf: 0, ga: 3, gd: -3, points: 0, advanced: false },
  ],
})

describe('thirdPlaceRanking', () => {
  it('ranks third-placed teams by points then gd then gf, top 8 advancing', () => {
    const groups = [
      mk('Group A', { code: 'AA3', points: 3, gd: 1, gf: 2 }),
      mk('Group B', { code: 'BB3', points: 1, gd: 0, gf: 1 }),
    ]
    const r = thirdPlaceRanking(groups)
    expect(r[0].team.code).toBe('AA3') // 3 pts ahead of 1 pt
    expect(r[0].advancing).toBe(true)
    expect(r.length).toBe(2)
  })
})
