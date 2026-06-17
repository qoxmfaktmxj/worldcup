import type { GroupStanding, TeamRef } from './types'

export interface ThirdPlaceRow {
  group: string
  team: TeamRef
  played: number
  points: number
  gd: number
  gf: number
  advancing: boolean
}

/**
 * Extracts each group's 3rd-placed team, ranks them by:
 *   1. points desc
 *   2. goal difference desc
 *   3. goals for desc
 * Top 8 are marked advancing (2026 format: 12 groups, best 8 third-placed teams advance).
 */
export function thirdPlaceRanking(groups: GroupStanding[]): ThirdPlaceRow[] {
  const thirds = groups
    .map((g) => {
      const row = g.rows.find((r) => r.position === 3)
      if (!row) return null
      return {
        group: g.group,
        team: row.team,
        played: row.played,
        points: row.points,
        gd: row.gd,
        gf: row.gf,
      }
    })
    .filter((x): x is Omit<ThirdPlaceRow, 'advancing'> => x !== null)

  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.gd !== a.gd) return b.gd - a.gd
    return b.gf - a.gf
  })

  return thirds.map((row, i) => ({ ...row, advancing: i < 8 }))
}
