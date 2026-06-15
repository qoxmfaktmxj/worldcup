import { mkdir, writeFile } from 'node:fs/promises'

// Pin to a commit SHA for reproducibility. Update deliberately.
const SHA = 'master' // TODO Plan 3: replace with a pinned 40-char SHA before deploy
const BASE = `https://raw.githubusercontent.com/jfjelstul/worldcup/${SHA}/data-csv`
const FILES = [
  'matches.csv',
  'group_standings.csv',
  'player_appearances.csv',
  'goals.csv',
  'bookings.csv',
  'substitutions.csv',
  'squads.csv',
  'players.csv',
  'penalty_kicks.csv',
]
const UA = 'WorldCupArchive/1.0 (+https://worldcup.minseok91.cloud)'

async function main() {
  await mkdir('data/raw/2002', { recursive: true })
  for (const f of FILES) {
    const res = await fetch(`${BASE}/${f}`, { headers: { 'User-Agent': UA } })
    if (!res.ok) throw new Error(`fetch ${f} failed: ${res.status}`)
    const text = await res.text()
    const lines = text.split('\n')
    // players.csv is a global dimension table (no tournament id) — keep all rows.
    const kept = f === 'players.csv' ? lines : lines.filter((l, i) => i === 0 || l.includes('WC-2002'))
    await writeFile(`data/raw/2002/${f}`, kept.join('\n'))
    console.log(`${f}: ${kept.length - 1} rows`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
