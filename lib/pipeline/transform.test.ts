import { describe, it, expect } from 'vitest'
import { slugify, toResult, buildStandings, buildAppearances } from './transform'

describe('slugify', () => {
  it('slugifies a match name', () => {
    expect(slugify('South Korea vs Poland')).toBe('south-korea-vs-poland')
  })
})

describe('toResult', () => {
  it('maps home win', () => {
    expect(toResult('1', '0', '0')).toBe('win')
  })
  it('maps draw', () => {
    expect(toResult('0', '0', '1')).toBe('draw')
  })
})

describe('buildStandings', () => {
  const rows = [
    { tournament_id: 'WC-2002', group_name: 'Group D', position: '1', team_id: 'T-71', team_name: 'South Korea', team_code: 'KOR', played: '3', wins: '2', draws: '1', losses: '0', goals_for: '4', goals_against: '1', goal_difference: '3', points: '7', advanced: '1' },
    { tournament_id: 'WC-2002', group_name: 'Group D', position: '4', team_id: 'T-57', team_name: 'Poland', team_code: 'POL', played: '3', wins: '1', draws: '0', losses: '2', goals_for: '3', goals_against: '7', goal_difference: '-4', points: '3', advanced: '0' },
  ]
  it('groups by group_name and sorts by position', () => {
    const groups = buildStandings(rows, {})
    expect(groups).toHaveLength(1)
    expect(groups[0].group).toBe('Group D')
    expect(groups[0].rows[0].team.code).toBe('KOR')
    expect(groups[0].rows[0].points).toBe(7)
    expect(groups[0].rows[0].advanced).toBe(true)
    expect(groups[0].rows[1].advanced).toBe(false)
  })
})

describe('buildAppearances', () => {
  const rows = [
    { match_id: 'M-1', team_id: 'T-71', team_name: 'South Korea', player_id: 'P-1', family_name: 'Park', given_name: 'Ji-sung', shirt_number: '21', position_name: 'right forward', position_code: 'RF', starter: '1', substitute: '0' },
    { match_id: 'M-1', team_id: 'T-71', team_name: 'South Korea', player_id: 'P-2', family_name: 'Lee', given_name: 'Eul-yong', shirt_number: '13', position_name: 'left midfielder', position_code: 'LM', starter: '0', substitute: '1' },
  ]
  it('maps rows to appearances with booleans', () => {
    const out = buildAppearances(rows, {})
    expect(out).toHaveLength(2)
    expect(out[0].starter).toBe(true)
    expect(out[0].shirtNumber).toBe(21)
    expect(out[1].substitute).toBe(true)
  })
})
