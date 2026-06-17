import { getWatchLinks } from '@/lib/data'
import { Nav } from '@/components/kinetic/Nav'
import { WatchHub } from '@/components/kinetic/WatchHub'

export const dynamic = 'force-static'

export const metadata = {
  title: '2026 월드컵 중계 보기 · 한국 방송·스트리밍',
  description: '2026 FIFA 월드컵 한국 중계 링크 — 네이버 스포츠, 치지직, KBS, FIFA 공식 등.',
}

export default async function Watch2026Page() {
  const links = await getWatchLinks(2026)

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Nav active="중계" />
      <div className="flex items-start flex-wrap gap-3 mb-6 mt-6">
        <div>
          <h1
            className="font-display text-4xl text-korea"
            style={{ transform: 'skewX(-6deg)' }}
          >
            중계 보기 · 2026 월드컵
          </h1>
          <p className="text-muted text-sm mt-1">
            한국 공식 중계 및 스트리밍 채널
          </p>
        </div>
      </div>

      <WatchHub links={links} />
    </main>
  )
}
