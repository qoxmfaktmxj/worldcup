import { getStandings, getMatches, getWatchLinks } from '@/lib/data'
import { Nav } from '@/components/kinetic/Nav'
import { KoreaTracker } from '@/components/kinetic/KoreaTracker'

export const dynamic = 'force-static'

export default async function Korea2026Page() {
  const [standings, matches, watchLinks] = await Promise.all([
    getStandings(2026),
    getMatches(2026),
    getWatchLinks(2026),
  ])

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Nav active="대한민국" />
      <div className="flex items-center flex-wrap gap-3 mb-6 mt-6">
        <h1
          className="font-display text-5xl text-korea"
          style={{ transform: 'skewX(-6deg)' }}
        >
          대한민국 — 2026 월드컵
        </h1>
      </div>

      <KoreaTracker
        standings={standings}
        matches={matches}
        watchLinks={watchLinks}
      />
    </main>
  )
}
