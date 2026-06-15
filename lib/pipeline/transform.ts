import type { Appearance, GroupStanding, Result, Standing, TeamRef } from '../types'
import { koName, koTeam } from './koname'

type Row = Record<string, string>

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function toResult(homeWin: string, awayWin: string, draw: string): Result {
  if (draw === '1') return 'draw'
  if (homeWin === '1') return 'win'
  if (awayWin === '1') return 'loss'
  return 'draw'
}

export function teamRef(id: string, name: string, code: string, teamMap: Record<string, string>): TeamRef {
  return { id, name, code, nameKo: koTeam(id, name, teamMap) }
}

export function buildAppearances(rows: Row[], playerMap: Record<string, string>): Appearance[] {
  return rows.map((r) => ({
    playerId: r.player_id,
    familyName: r.family_name,
    givenName: r.given_name,
    nameKo: koName(r.player_id, r.family_name, r.given_name, playerMap),
    shirtNumber: Number(r.shirt_number),
    position: r.position_name,
    positionCode: r.position_code,
    starter: r.starter === '1',
    substitute: r.substitute === '1',
  }))
}

export function buildStandings(rows: Row[], teamMap: Record<string, string>): GroupStanding[] {
  const byGroup = new Map<string, Standing[]>()
  for (const r of rows) {
    const s: Standing = {
      position: Number(r.position),
      team: teamRef(r.team_id, r.team_name, r.team_code, teamMap),
      played: Number(r.played),
      wins: Number(r.wins),
      draws: Number(r.draws),
      losses: Number(r.losses),
      gf: Number(r.goals_for),
      ga: Number(r.goals_against),
      gd: Number(r.goal_difference),
      points: Number(r.points),
      advanced: r.advanced === '1',
    }
    const arr = byGroup.get(r.group_name) ?? []
    arr.push(s)
    byGroup.set(r.group_name, arr)
  }
  return [...byGroup.entries()]
    .map(([group, rows]) => ({ group, rows: rows.sort((a, b) => a.position - b.position) }))
    .sort((a, b) => a.group.localeCompare(b.group))
}
