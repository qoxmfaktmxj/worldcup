import { getStandings, getMatches, getWatchLinks } from '@/lib/data'
import { Nav } from '@/components/kinetic/Nav'
import { KoreaTracker } from '@/components/kinetic/KoreaTracker'

export const dynamic = 'force-static'

export const metadata = {
  title: '2026 월드컵 대한민국 · 한국시간 일정·진출 시나리오',
  description: '2026 FIFA 월드컵 대한민국 경기 일정(한국시간), 조 순위, 다음 경기, 진출 시나리오, 중계 링크.',
}

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
