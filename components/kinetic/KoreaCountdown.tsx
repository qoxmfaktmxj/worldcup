'use client'

import { useEffect, useState } from 'react'

interface Props {
  kickoffUtc: string
}

function calcRemaining(kickoffUtc: string): { days: number; hours: number; minutes: number; seconds: number } | null {
  const diff = new Date(kickoffUtc).getTime() - Date.now()
  if (diff <= 0) return null
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds }
}

export function KoreaCountdown({ kickoffUtc }: Props) {
  const [mounted, setMounted] = useState(false)
  const [remaining, setRemaining] = useState<ReturnType<typeof calcRemaining>>(null)

  useEffect(() => {
    setMounted(true)
    setRemaining(calcRemaining(kickoffUtc))
    const id = setInterval(() => {
      setRemaining(calcRemaining(kickoffUtc))
    }, 1000)
    return () => clearInterval(id)
  }, [kickoffUtc])

  // SSR/hydration 전 정적 fallback
  if (!mounted) {
    return (
      <div className="text-sm text-muted">
        다음 경기까지 계산 중…
      </div>
    )
  }

  if (!remaining) {
    return (
      <div className="text-sm text-korea font-medium">
        경기 시작 또는 종료
      </div>
    )
  }

  const { days, hours, minutes, seconds } = remaining

  return (
    <div className="flex items-end gap-3">
      {days > 0 && (
        <div className="text-center">
          <div className="font-display text-3xl text-korea tabular-nums">{days}</div>
          <div className="text-[11px] text-muted mt-0.5">일</div>
        </div>
      )}
      <div className="text-center">
        <div className="font-display text-3xl text-korea tabular-nums">{String(hours).padStart(2, '0')}</div>
        <div className="text-[11px] text-muted mt-0.5">시간</div>
      </div>
      <div className="text-center">
        <div className="font-display text-3xl text-korea tabular-nums">{String(minutes).padStart(2, '0')}</div>
        <div className="text-[11px] text-muted mt-0.5">분</div>
      </div>
      <div className="text-center">
        <div className="font-display text-3xl text-muted tabular-nums">{String(seconds).padStart(2, '0')}</div>
        <div className="text-[11px] text-muted mt-0.5">초</div>
      </div>
    </div>
  )
}
