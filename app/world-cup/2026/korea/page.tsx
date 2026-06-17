import Link from 'next/link'
import { getStandings, getMatches, getWatchLinks } from '@/lib/data'
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
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1
          className="font-display text-5xl text-korea"
          style={{ transform: 'skewX(-6deg)' }}
        >
          대한민국 — 2026 월드컵
        </h1>
        <Link
          href="/world-cup/2026"
          className="text-sm text-muted hover:text-korea transition-colors"
        >
          ← 2026 월드컵
        </Link>
      </div>

      <KoreaTracker
        standings={standings}
        matches={matches}
        watchLinks={watchLinks}
      />
    </main>
  )
}
