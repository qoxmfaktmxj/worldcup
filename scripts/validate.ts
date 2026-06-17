import { readFile } from 'node:fs/promises'
import type { GroupStanding, Match } from '../lib/types'

const YEAR = process.argv[2] ?? process.env.YEAR ?? '2002'

async function json<T>(p: string): Promise<T> {
  return JSON.parse(await readFile(p, 'utf8')) as T
}

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`)
    process.exitCode = 1
  }
}

type Expected = { code: string; points: number; advanced: boolean }
type GroundTruth = {
  group: string
  rows: Expected[]
  match: { slug: string; home: number; away: number }
  shootoutSlug?: string
}

// Per-tournament ground truth, verified against official FIFA records.
const TRUTH: Record<string, GroundTruth> = {
  '2002': {
    group: 'Group D',
    rows: [
      { code: 'KOR', points: 7, advanced: true },
      { code: 'USA', points: 4, advanced: true },
      { code: 'PRT', points: 3, advanced: false },
      { code: 'POL', points: 3, advanced: false },
    ],
    match: { slug: 'south-korea-vs-poland', home: 2, away: 0 },
  },
  '2006': {
    group: 'Group G',
    rows: [
      { code: 'CHE', points: 7, advanced: true },
      { code: 'FRA', points: 5, advanced: true },
      { code: 'KOR', points: 4, advanced: false },
      { code: 'TGO', points: 0, advanced: false },
    ],
    match: { slug: 'south-korea-vs-togo', home: 2, away: 1 },
    shootoutSlug: 'italy-vs-france',
  },
}

async function main() {
  const matches = await json<Match[]>(`data/generated/${YEAR}/matches.json`)
  const standings = await json<GroupStanding[]>(`data/generated/${YEAR}/standings.json`)

  if (YEAR === '2026') {
    // 2026-specific checks
    assert(matches.length === 72, `expected 72 matches, got ${matches.length}`)

    // Every match must have kickoffUtc (parseable) and venueId
    for (const m of matches) {
      assert(
        m.kickoffUtc !== undefined && !isNaN(Date.parse(m.kickoffUtc)),
        `${m.id} ${m.slug}: invalid or missing kickoffUtc (${m.kickoffUtc})`,
      )
      assert(
        m.venueId !== undefined && m.venueId.length > 0,
        `${m.id} ${m.slug}: missing venueId`,
      )
    }

    // Finished matches must have numeric scores
    for (const m of matches.filter((x) => x.status === 'finished')) {
      assert(
        typeof m.homeScore === 'number' && typeof m.awayScore === 'number',
        `${m.id} ${m.slug}: finished but scores are not numeric`,
      )
    }

    // Each team appears in exactly 3 group matches
    const appearances = new Map<string, number>()
    for (const m of matches) {
      appearances.set(m.home.code, (appearances.get(m.home.code) ?? 0) + 1)
      appearances.set(m.away.code, (appearances.get(m.away.code) ?? 0) + 1)
    }
    for (const [code, count] of appearances) {
      assert(count === 3, `team ${code}: expected 3 group matches, got ${count}`)
    }

    const finished = matches.filter((m) => m.status === 'finished').length
    const groups = standings.length
    if (process.exitCode !== 1) {
      console.log(`Validation OK (2026): ${matches.length} matches, ${finished} finished, ${groups} groups — all 2026 checks passed`)
    } else {
      console.error('Validation FAILED')
      process.exit(1)
    }
    return
  }

  // Generic checks for completed tournaments (64 matches with full lineups)
  assert(matches.length === 64, `expected 64 matches, got ${matches.length}`)

  for (const m of matches) {
    const hs = m.lineups.home.filter((a) => a.starter).length
    const as = m.lineups.away.filter((a) => a.starter).length
    assert(hs === 11, `${m.id} ${m.slug}: home starters ${hs} != 11`)
    assert(as === 11, `${m.id} ${m.slug}: away starters ${as} != 11`)
  }

  const t = TRUTH[YEAR]
  if (!t) {
    console.log(`Validation OK (${YEAR}): 64 matches, 11+11 starters — generic checks only (no ground-truth block; add one to TRUTH for full gating)`)
  }
  if (t) {
    const g = standings.find((x) => x.group === t.group)
    assert(!!g, `${t.group} missing`)
    g?.rows.forEach((row, i) => {
      assert(row.team.code === t.rows[i].code, `${t.group} pos ${i + 1}: ${row.team.code} != ${t.rows[i].code}`)
      assert(row.points === t.rows[i].points, `${t.group} ${row.team.code}: points ${row.points} != ${t.rows[i].points}`)
      assert(row.advanced === t.rows[i].advanced, `${t.group} ${row.team.code}: advanced mismatch`)
    })

    const km = matches.find((m) => m.slug === t.match.slug)
    assert(!!km, `${t.match.slug} missing`)
    assert(
      km?.homeScore === t.match.home && km?.awayScore === t.match.away,
      `${t.match.slug} score ${km?.homeScore}-${km?.awayScore} != ${t.match.home}-${t.match.away}`,
    )

    if (t.shootoutSlug) {
      const sm = matches.find((m) => m.slug === t.shootoutSlug)
      assert(!!sm, `${t.shootoutSlug} missing`)
      assert(!!sm?.penaltyShootout, `${t.shootoutSlug} should be a penalty shootout`)
      assert((sm?.shootout.length ?? 0) > 0, `${t.shootoutSlug} has no kick-by-kick data`)
    }
  }

  if (process.exitCode === 1) {
    console.error('Validation FAILED')
    process.exit(1)
  }
  if (t) {
    console.log(`Validation OK (${YEAR}): 64 matches, 11+11 starters, ${t.group} ground-truth, ${t.match.slug} ${t.match.home}-${t.match.away}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
