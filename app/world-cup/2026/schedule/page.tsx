import { getMatches } from '@/lib/data'
import { Nav } from '@/components/kinetic/Nav'
import { ScheduleView } from '@/components/kinetic/ScheduleView'

export const dynamic = 'force-static'

export const metadata = {
  title: '2026 월드컵 조별리그 일정 · 한국시간(KST)',
  description: '2026 FIFA 월드컵 조별리그 일정을 한국시간 기준으로 — 대한민국 경기, 조별 필터, 경기장 정보 포함.',
}

export default async function Schedule2026Page() {
  const matches = await getMatches(2026)

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Nav active="일정" />
      <div className="flex items-center flex-wrap gap-3 mb-6 mt-6">
        <div>
          <h1
            className="font-display text-4xl text-korea"
            style={{ transform: 'skewX(-6deg)' }}
          >
            2026 월드컵 조별리그 일정
          </h1>
          <p className="text-muted text-sm mt-1">한국시간(KST) 기준 · 72경기 · 토너먼트 일정 추후 추가</p>
        </div>
      </div>

      <ScheduleView matches={matches} />
    </main>
  )
}
