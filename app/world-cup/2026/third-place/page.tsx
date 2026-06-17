import { getStandings } from '@/lib/data'
import { thirdPlaceRanking } from '@/lib/thirdplace'
import { Nav } from '@/components/kinetic/Nav'
import { ThirdPlaceTable } from '@/components/kinetic/ThirdPlaceTable'

export const dynamic = 'force-static'

export default async function ThirdPlacePage() {
  const standings = await getStandings(2026)
  const rows = thirdPlaceRanking(standings)

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Nav />
      <div className="flex items-center flex-wrap gap-3 mb-6 mt-6">
        <h1
          className="font-display text-4xl text-korea"
          style={{ transform: 'skewX(-6deg)' }}
        >
          3위 와일드카드 경쟁 · 2026
        </h1>
      </div>

      <p className="text-muted text-sm mb-6">
        각 조 3위 중 상위 8팀이 32강 진출
      </p>

      <ThirdPlaceTable rows={rows} />
    </main>
  )
}
