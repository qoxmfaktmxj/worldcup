import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { parse } from 'csv-parse/sync'
import type { Booking, Goal, Match, Substitution } from '../lib/types'
import { buildAppearances, buildStandings, slugify, teamRef, toResult } from '../lib/pipeline/transform'
import { fullName } from '../lib/pipeline/names'

type Row = Record<string, string>

async function csv(name: string): Promise<Row[]> {
  const text = await readFile(`data/raw/2002/${name}`, 'utf8')
  return parse(text, { columns: true, skip_empty_lines: true, relax_column_count: true })
}

async function json<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T
}

function groupBy(rows: Row[], key: string): Map<string, Row[]> {
  const m = new Map<string, Row[]>()
  for (const r of rows) {
    const arr = m.get(r[key]) ?? []
    arr.push(r)
    m.set(r[key], arr)
  }
  return m
}

function buildSubs(rows: Row[]): Substitution[] {
  const out: Substitution[] = []
  const teams = [...new Set(rows.map((r) => r.team_id))]
  for (const t of teams) {
    const min = (r: Row) => Number(r.minute_regulation)
    const offs = rows.filter((r) => r.team_id === t && r.going_off === '1').sort((a, b) => min(a) - min(b))
    const ons = rows.filter((r) => r.team_id === t && r.coming_on === '1').sort((a, b) => min(a) - min(b))
    const n = Math.max(offs.length, ons.length)
    for (let i = 0; i < n; i++) {
      const off = offs[i]
      const on = ons[i]
      out.push({
        minute: Number((on ?? off).minute_regulation),
        offId: off?.player_id ?? '',
        onId: on?.player_id ?? '',
        teamId: t,
      })
    }
  }
  return out.sort((a, b) => a.minute - b.minute)
}

async function main() {
  const teamMap = await json<Record<string, string>>('data/mappings/teams.ko.json')
  const playerMap = (await json<{ names: Record<string, string> }>('data/mappings/players.ko.json')).names

  const matchRows = await csv('matches.csv')
  const appRows = await csv('player_appearances.csv')
  const goalRows = await csv('goals.csv')
  const bookingRows = await csv('bookings.csv')
  const subRows = await csv('substitutions.csv')
  const standingRows = await csv('group_standings.csv')

  const appsByMatchTeam = new Map<string, Row[]>()
  for (const r of appRows) {
    const k = `${r.match_id}|${r.team_id}`
    const arr = appsByMatchTeam.get(k) ?? []
    arr.push(r)
    appsByMatchTeam.set(k, arr)
  }
  const apps = (matchId: string, teamId: string) => appsByMatchTeam.get(`${matchId}|${teamId}`) ?? []

  const goalsByMatch = groupBy(goalRows, 'match_id')
  const bookingsByMatch = groupBy(bookingRows, 'match_id')
  const subsByMatch = groupBy(subRows, 'match_id')

  const ko = (r: Row) => playerMap[r.player_id] ?? fullName(r.given_name, r.family_name)

  const matches: Match[] = matchRows.map((m) => {
    const home = teamRef(m.home_team_id, m.home_team_name, m.home_team_code, teamMap)
    const away = teamRef(m.away_team_id, m.away_team_name, m.away_team_code, teamMap)

    const goals: Goal[] = (goalsByMatch.get(m.match_id) ?? []).map((g) => ({
      minute: Number(g.minute_regulation),
      playerId: g.player_id,
      nameKo: ko(g),
      teamId: g.team_id,
      ownGoal: g.own_goal === '1',
      penalty: g.penalty === '1',
    }))

    const bookings: Booking[] = (bookingsByMatch.get(m.match_id) ?? []).map((b) => ({
      minute: Number(b.minute_regulation),
      playerId: b.player_id,
      nameKo: ko(b),
      teamId: b.team_id,
      card: b.red_card === '1' ? 'red' : b.second_yellow_card === '1' ? 'second yellow' : 'yellow',
    }))

    const subs = buildSubs(subsByMatch.get(m.match_id) ?? [])

    return {
      id: m.match_id,
      slug: slugify(m.match_name),
      date: m.match_date,
      time: m.match_time,
      stadium: m.stadium_name,
      city: m.city_name,
      group: m.group_name,
      stage: m.stage_name,
      groupStage: m.group_stage === '1',
      home,
      away,
      homeScore: Number(m.home_team_score),
      awayScore: Number(m.away_team_score),
      penaltyShootout: m.penalty_shootout === '1',
      homePenalties: Number(m.home_team_score_penalties || 0),
      awayPenalties: Number(m.away_team_score_penalties || 0),
      result: toResult(m.home_team_win, m.away_team_win, m.draw),
      lineups: {
        home: buildAppearances(apps(m.match_id, home.id), playerMap),
        away: buildAppearances(apps(m.match_id, away.id), playerMap),
      },
      goals: goals.sort((a, b) => a.minute - b.minute),
      bookings: bookings.sort((a, b) => a.minute - b.minute),
      subs,
    }
  })

  const standings = buildStandings(standingRows, teamMap)

  await mkdir('data/generated/2002', { recursive: true })
  await writeFile(
    'data/generated/2002/tournament.json',
    JSON.stringify({ year: 2002, id: 'WC-2002', name: '2002 FIFA 월드컵', host: '대한민국/일본' }, null, 2),
  )
  await writeFile('data/generated/2002/matches.json', JSON.stringify(matches, null, 2))
  await writeFile('data/generated/2002/standings.json', JSON.stringify(standings, null, 2))
  console.log(`generated ${matches.length} matches, ${standings.length} groups`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
