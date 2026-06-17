'use client'

import { useState, useMemo } from 'react'
import type { Match } from '@/lib/types'
import { toKstLabel, kstDateKey } from '@/lib/time'
import { teamPrimary } from '@/lib/teamColors'
import { groupKo } from '@/lib/stages'

// 탭 정의
type Tab = '전체' | '오늘' | '대한민국' | string // string covers 'A조'..'L조'

const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

function todayKst(): string {
  // 현재 시각을 KST 날짜키로 변환
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(now)
}

/** toKstLabel에서 시간 부분만 추출: "6/19 금 10:00" → "10:00" */
function kstTime(kickoffUtc: string): string {
  const label = toKstLabel(kickoffUtc)
  // format: "M/D 요일 HH:mm"
  const parts = label.split(' ')
  return parts[parts.length - 1] ?? label
}

/** KST 날짜 + 요일 헤딩: "YYYY-MM-DD" → "6월 19일 (금)" */
function dateHeading(dateKey: string): string {
  const date = new Date(dateKey + 'T00:00:00+09:00')
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
  const parts = formatter.formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const month = get('month')   // "6월"
  const day = get('day')       // "19일"
  let weekday = get('weekday') // "금요일"
  if (weekday.endsWith('요일')) weekday = weekday.replace('요일', '')
  return `${month} ${day} (${weekday})`
}

interface Props {
  matches: Match[]
}

export function ScheduleView({ matches }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('전체')

  const tabs: Tab[] = [
    '전체',
    '오늘',
    '대한민국',
    ...GROUP_LETTERS.map((l) => `${l}조`),
  ]

  // 정렬: kickoffUtc 기준
  const sorted = useMemo(
    () =>
      [...matches].sort((a, b) => {
        const at = a.kickoffUtc ?? a.date
        const bt = b.kickoffUtc ?? b.date
        return at < bt ? -1 : at > bt ? 1 : 0
      }),
    [matches],
  )

  // 탭별 필터
  const filtered = useMemo(() => {
    if (activeTab === '전체') return sorted
    if (activeTab === '오늘') {
      const today = todayKst()
      return sorted.filter(
        (m) => m.kickoffUtc && kstDateKey(m.kickoffUtc) === today,
      )
    }
    if (activeTab === '대한민국') {
      return sorted.filter(
        (m) => m.home.code === 'KOR' || m.away.code === 'KOR',
      )
    }
    // 'X조' — Group X
    const letter = activeTab.replace('조', '')
    return sorted.filter((m) => m.group === `Group ${letter}`)
  }, [activeTab, sorted])

  // 날짜별 그룹핑
  const grouped = useMemo(() => {
    const map = new Map<string, Match[]>()
    for (const m of filtered) {
      const key = m.kickoffUtc ? kstDateKey(m.kickoffUtc) : m.date
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    }
    return map
  }, [filtered])

  return (
    <div className="flex flex-col gap-6">
      {/* 탭 바 — 모바일 가로 스크롤 */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1.5 min-w-max pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'px-3 py-1.5 text-sm rounded font-medium transition-colors whitespace-nowrap',
                activeTab === tab
                  ? 'bg-korea text-white'
                  : 'bg-panel border border-line text-muted hover:border-korea hover:text-white',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 경기 없음 */}
      {filtered.length === 0 && (
        <div className="text-muted text-sm py-8 text-center">
          {activeTab === '오늘' ? '오늘 경기 없음' : '해당 경기 없음'}
        </div>
      )}

      {/* 날짜별 섹션 */}
      {[...grouped.entries()].map(([dateKey, dayMatches]) => (
        <section key={dateKey}>
          {/* 날짜 헤딩 */}
          <h2
            className="font-display text-lg text-korea mb-2"
            style={{ transform: 'skewX(-6deg)' }}
          >
            {dateHeading(dateKey)}
          </h2>

          {/* 경기 행 테이블 */}
          <div className="bg-panel/60 border border-line rounded-xl overflow-hidden">
            {dayMatches.map((m, i) => {
              const homeColor = teamPrimary(m.home.name)
              const awayColor = teamPrimary(m.away.name)
              const isFinished = m.status === 'finished'
              const time = m.kickoffUtc ? kstTime(m.kickoffUtc) : m.time || '--:--'

              return (
                <div
                  key={m.id}
                  className={[
                    'flex items-center gap-3 px-4 py-3 text-sm',
                    i < dayMatches.length - 1 ? 'border-b border-line' : '',
                  ].join(' ')}
                >
                  {/* 시간 */}
                  <span className="tabular-nums text-muted text-xs w-12 shrink-0">
                    {time}
                  </span>

                  {/* 조 */}
                  <span className="text-muted text-xs w-8 shrink-0 hidden sm:inline">
                    {groupKo(m.group)}
                  </span>

                  {/* 홈팀 */}
                  <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
                    <span className="text-white truncate">{m.home.nameKo}</span>
                    <span
                      className="inline-block h-4 w-1 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: homeColor }}
                    />
                  </div>

                  {/* 스코어 / 예정 */}
                  <div className="flex items-center justify-center w-20 shrink-0">
                    {isFinished ? (
                      <span className="tabular-nums font-display text-base font-bold text-white">
                        {m.homeScore}&nbsp;:&nbsp;{m.awayScore}
                      </span>
                    ) : (
                      <span className="text-muted text-xs">예정</span>
                    )}
                  </div>

                  {/* 원정팀 */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span
                      className="inline-block h-4 w-1 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: awayColor }}
                    />
                    <span className="text-white truncate">{m.away.nameKo}</span>
                  </div>

                  {/* 경기장 — 고정폭이라야 스코어 칸 x좌표가 행마다 흔들리지 않음 */}
                  <span className="text-muted text-xs hidden md:block w-36 shrink-0 truncate text-right">
                    {m.stadium}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
