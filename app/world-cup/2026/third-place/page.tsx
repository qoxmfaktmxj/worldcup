import Link from 'next/link'
import { getStandings } from '@/lib/data'
import { thirdPlaceRanking } from '@/lib/thirdplace'
import { ThirdPlaceTable } from '@/components/kinetic/ThirdPlaceTable'

export const dynamic = 'force-static'

export default async function ThirdPlacePage() {
  const standings = await getStandings(2026)
  const rows = thirdPlaceRanking(standings)

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1
          className="font-display text-4xl text-korea"
          style={{ transform: 'skewX(-6deg)' }}
        >
          3위 와일드카드 경쟁 · 2026
        </h1>
        <Link
          href="/world-cup/2026"
          className="text-sm text-muted hover:text-korea transition-colors"
        >
          ← 2026 월드컵
        </Link>
      </div>

      <p className="text-muted text-sm mb-6">
        각 조 3위 중 상위 8팀이 32강 진출
      </p>

      <ThirdPlaceTable rows={rows} />
    </main>
  )
}
