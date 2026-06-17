import Link from 'next/link'
import { getWatchLinks } from '@/lib/data'
import { WatchHub } from '@/components/kinetic/WatchHub'

export const dynamic = 'force-static'

export default async function Watch2026Page() {
  const links = await getWatchLinks(2026)

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
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
        <Link
          href="/world-cup/2026"
          className="text-sm text-muted hover:text-korea transition-colors mt-1"
        >
          ← 2026 월드컵
        </Link>
      </div>

      <WatchHub links={links} />
    </main>
  )
}
