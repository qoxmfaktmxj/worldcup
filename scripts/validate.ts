import { readFile } from 'node:fs/promises'
import type { GroupStanding, Match } from '../lib/types'

async function json<T>(p: string): Promise<T> {
  return JSON.parse(await readFile(p, 'utf8')) as T
}

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`)
    process.exitCode = 1
  }
}

async function main() {
  const matches = await json<Match[]>('data/generated/2002/matches.json')
  const standings = await json<GroupStanding[]>('data/generated/2002/standings.json')

  assert(matches.length === 64, `expected 64 matches, got ${matches.length}`)

  for (const m of matches) {
    const hs = m.lineups.home.filter((a) => a.starter).length
    const as = m.lineups.away.filter((a) => a.starter).length
    assert(hs === 11, `${m.id} ${m.slug}: home starters ${hs} != 11`)
    assert(as === 11, `${m.id} ${m.slug}: away starters ${as} != 11`)
  }

  const d = standings.find((g) => g.group === 'Group D')
  assert(!!d, 'Group D missing')
  const expected = [
    { code: 'KOR', points: 7, advanced: true },
    { code: 'USA', points: 4, advanced: true },
    { code: 'PRT', points: 3, advanced: false },
    { code: 'POL', points: 3, advanced: false },
  ]
  d?.rows.forEach((row, i) => {
    assert(row.team.code === expected[i].code, `Group D pos ${i + 1}: ${row.team.code} != ${expected[i].code}`)
    assert(row.points === expected[i].points, `Group D ${row.team.code}: points ${row.points} != ${expected[i].points}`)
    assert(row.advanced === expected[i].advanced, `Group D ${row.team.code}: advanced mismatch`)
  })

  const kp = matches.find((m) => m.slug === 'south-korea-vs-poland')
  assert(!!kp, 'south-korea-vs-poland missing')
  assert(kp?.homeScore === 2 && kp?.awayScore === 0, `KOR-POL score ${kp?.homeScore}-${kp?.awayScore} != 2-0`)

  if (process.exitCode === 1) {
    console.error('Validation FAILED')
    process.exit(1)
  }
  console.log('Validation OK: 64 matches, 11+11 starters each, Group D ground-truth, KOR-POL 2-0')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
