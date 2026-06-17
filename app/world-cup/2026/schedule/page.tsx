import Link from 'next/link'
import { getMatches } from '@/lib/data'
import { ScheduleView } from '@/components/kinetic/ScheduleView'

export const dynamic = 'force-static'

export default async function Schedule2026Page() {
  const matches = await getMatches(2026)

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1
            className="font-display text-4xl text-korea"
            style={{ transform: 'skewX(-6deg)' }}
          >
            2026 월드컵 일정
          </h1>
          <p className="text-muted text-sm mt-1">한국시간(KST) 기준</p>
        </div>
        <Link
          href="/world-cup/2026"
          className="text-sm text-muted hover:text-korea transition-colors"
        >
          ← 2026 월드컵
        </Link>
      </div>

      <ScheduleView matches={matches} />
    </main>
  )
}
