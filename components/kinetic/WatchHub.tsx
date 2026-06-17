import type { WatchLink } from '@/lib/types'

// Provider accent colors
const PROVIDER_STYLE: Record<
  string,
  { border: string; chip: string; dot: string }
> = {
  'naver-sports': {
    border: 'border-[#03C75A]/40 hover:border-[#03C75A]',
    chip: 'bg-[#03C75A]/10 text-[#03C75A]',
    dot: 'bg-[#03C75A]',
  },
  chzzk: {
    border: 'border-[#00E454]/40 hover:border-[#00E454]',
    chip: 'bg-[#00E454]/10 text-[#00E454]',
    dot: 'bg-[#00E454]',
  },
  jtbc: {
    border: 'border-line hover:border-white/50',
    chip: 'bg-white/10 text-white/80',
    dot: 'bg-white/60',
  },
  kbs: {
    border: 'border-line hover:border-white/50',
    chip: 'bg-white/10 text-white/80',
    dot: 'bg-white/60',
  },
  fifa: {
    border: 'border-[#326295]/40 hover:border-[#326295]',
    chip: 'bg-[#326295]/15 text-[#7eb3e8]',
    dot: 'bg-[#326295]',
  },
}

const PROVIDER_SHORT: Record<string, string> = {
  'naver-sports': 'NAVER',
  chzzk: 'CHZZK',
  jtbc: 'JTBC',
  kbs: 'KBS',
  fifa: 'FIFA',
}

interface Props {
  links: WatchLink[]
}

export function WatchHub({ links }: Props) {
  if (links.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-panel/40 p-8 text-center text-muted">
        <p className="text-lg mb-1">중계 정보를 준비 중입니다.</p>
        <p className="text-sm">잠시 후 다시 확인해 주세요.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 상단 안내 문구 */}
      <p className="text-sm text-muted border border-line/60 rounded-lg px-4 py-2.5 bg-panel/40">
        공식 중계 페이지로 이동합니다. 영상은 각 서비스에서 제공됩니다.
      </p>

      {/* 링크 카드 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((link) => {
          const style = PROVIDER_STYLE[link.provider] ?? {
            border: 'border-line hover:border-white/50',
            chip: 'bg-white/10 text-white/80',
            dot: 'bg-white/60',
          }
          const shortLabel = PROVIDER_SHORT[link.provider] ?? link.provider.toUpperCase()

          return (
            <a
              key={link.provider}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative rounded-xl border bg-ink p-5 flex flex-col gap-2 transition-colors ${style.border}`}
            >
              {/* Provider chip */}
              <span
                className={`self-start rounded px-2 py-0.5 text-xs font-medium tracking-wider ${style.chip}`}
              >
                {shortLabel}
              </span>

              {/* Label */}
              <p className="font-medium text-white leading-snug group-hover:text-white/90">
                {link.label}
              </p>

              {/* Note */}
              {link.note && (
                <p className="text-xs text-muted leading-relaxed">{link.note}</p>
              )}

              {/* External link indicator */}
              <span className="absolute top-4 right-4 text-muted/40 text-xs select-none">
                ↗
              </span>
            </a>
          )
        })}
      </div>

      {/* 하단 검증 날짜 */}
      <p className="text-xs text-muted/60 text-right">
        URL 검증일: {links[0]?.verifiedAt}
      </p>
    </div>
  )
}
