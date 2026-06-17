import Link from 'next/link'
import type { GroupStanding, Match, WatchLink } from '@/lib/types'
import { qualifyScenarios } from '@/lib/qualify'
import { toKstLabel } from '@/lib/time'
import { KoreaCountdown } from './KoreaCountdown'
import { TeamLabel } from './TeamLabel'

interface Props {
  standings: GroupStanding[]
  matches: Match[]
  watchLinks: WatchLink[]
}

export function KoreaTracker({ standings, matches, watchLinks }: Props) {
  // 한국 그룹 찾기
  const korGroup = standings.find((g) =>
    g.rows.some((r) => r.team.code === 'KOR'),
  )
  const korRow = korGroup?.rows.find((r) => r.team.code === 'KOR')

  // 한국 경기 목록 (kickoffUtc 기준 정렬)
  const korMatches = matches
    .filter((m) => m.home.code === 'KOR' || m.away.code === 'KOR')
    .sort((a, b) => {
      const at = a.kickoffUtc ?? a.date
      const bt = b.kickoffUtc ?? b.date
      return at < bt ? -1 : at > bt ? 1 : 0
    })

  // 다음 예정 경기
  const nextMatch = korMatches.find((m) => m.status === 'scheduled')

  // 진출 시나리오: 그룹 rows에서 {code, points, played} 추출
  const scenarioRows = (korGroup?.rows ?? []).map((r) => ({
    code: r.team.code,
    points: r.points,
    played: r.played,
  }))
  const scenarios = qualifyScenarios(scenarioRows, 'KOR')

  // 토너먼트 범위 중계 링크
  const tournamentLinks = watchLinks.filter((w) => w.scope === 'tournament')

  return (
    <div className="flex flex-col gap-6">
      {/* 현재 순위 요약 */}
      {korRow && (
        <div className="rounded-xl border border-korea/40 bg-korea/5 p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-korea mb-3">
            현재 성적 — {korGroup?.group}
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <div className="text-muted text-[11px]">순위</div>
              <div className="font-display text-3xl text-korea">{korRow.position}위</div>
            </div>
            <div>
              <div className="text-muted text-[11px]">승점</div>
              <div className="font-display text-3xl text-white">{korRow.points}</div>
            </div>
            <div>
              <div className="text-muted text-[11px]">승무패</div>
              <div className="font-display text-xl text-white mt-1">
                {korRow.wins}·{korRow.draws}·{korRow.losses}
              </div>
            </div>
            <div>
              <div className="text-muted text-[11px]">득실</div>
              <div className="font-display text-xl text-white mt-1">
                {korRow.gf}:{korRow.ga}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 다음 경기 카운트다운 */}
      {nextMatch && (
        <div className="rounded-xl border border-line bg-panel/60 p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted mb-3">
            다음 경기까지
          </div>
          <KoreaCountdown kickoffUtc={nextMatch.kickoffUtc!} />
          <div className="mt-3 text-sm text-muted">
            {nextMatch.home.code === 'KOR'
              ? `vs ${nextMatch.away.nameKo}`
              : `vs ${nextMatch.home.nameKo}`}{' '}
            ·{' '}
            {nextMatch.kickoffUtc
              ? toKstLabel(nextMatch.kickoffUtc)
              : nextMatch.date}{' '}
            · {nextMatch.stadium}
          </div>
        </div>
      )}

      {/* 경기 목록 */}
      <section>
        <h2
          className="font-display text-xl mb-3"
          style={{ transform: 'skewX(-6deg)' }}
        >
          경기 일정
        </h2>
        <div className="flex flex-col gap-2">
          {korMatches.map((m, i) => {
            const isHome = m.home.code === 'KOR'
            const opponent = isHome ? m.away : m.home
            if (m.status === 'finished') {
              const kor = isHome ? m.homeScore : m.awayScore
              const opp = isHome ? m.awayScore : m.homeScore
              const resultLabel =
                kor > opp ? '승' : kor < opp ? '패' : '무'
              return (
                <Link
                  key={m.id}
                  href={`/world-cup/2026/matches/${m.slug}`}
                  className="bg-panel border border-line rounded-lg p-3 flex items-center justify-between hover:border-korea transition-colors"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted text-xs w-12 shrink-0">완료</span>
                    <span className="inline-flex items-center gap-1.5 text-white">
                      vs <TeamLabel name={opponent.name} nameKo={opponent.nameKo} />
                    </span>
                    <span className="font-display text-korea tabular-nums">
                      {kor}&nbsp;:&nbsp;{opp}
                    </span>
                    <span
                      className={
                        resultLabel === '승'
                          ? 'text-green-400 text-xs font-medium'
                          : resultLabel === '패'
                            ? 'text-red-400 text-xs font-medium'
                            : 'text-muted text-xs font-medium'
                      }
                    >
                      ({resultLabel})
                    </span>
                  </div>
                  <span className="text-muted text-xs shrink-0 ml-4">{m.date}</span>
                </Link>
              )
            }
            // 예정
            return (
              <Link
                key={m.id}
                href={`/world-cup/2026/matches/${m.slug}`}
                className="bg-panel border border-line rounded-lg p-3 flex items-center justify-between hover:border-korea transition-colors"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted text-xs w-12 shrink-0">예정</span>
                  <span className="inline-flex items-center gap-1.5 text-white">vs <TeamLabel name={opponent.name} nameKo={opponent.nameKo} /></span>
                  <span className="text-muted text-xs">
                    {m.kickoffUtc ? toKstLabel(m.kickoffUtc) : m.date}
                  </span>
                  {m.stadium && (
                    <span className="text-muted text-xs hidden sm:inline">
                      · {m.stadium}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 진출 시나리오 */}
      <section>
        <h2
          className="font-display text-xl mb-3"
          style={{ transform: 'skewX(-6deg)' }}
        >
          진출 시나리오
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {/* 승 */}
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-green-400 mb-2">
              승리
            </div>
            <div className="font-display text-2xl text-white mb-1">
              승점 {scenarios.win.points}
            </div>
            <div className="text-xs text-muted leading-relaxed">
              {scenarios.win.note}
            </div>
          </div>
          {/* 무 */}
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-yellow-400 mb-2">
              무승부
            </div>
            <div className="font-display text-2xl text-white mb-1">
              승점 {scenarios.draw.points}
            </div>
            <div className="text-xs text-muted leading-relaxed">
              {scenarios.draw.note}
            </div>
          </div>
          {/* 패 */}
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-red-400 mb-2">
              패배
            </div>
            <div className="font-display text-2xl text-white mb-1">
              승점 {scenarios.loss.points}
            </div>
            <div className="text-xs text-muted leading-relaxed">
              {scenarios.loss.note}
            </div>
          </div>
        </div>
      </section>

      {/* 중계 링크 */}
      {tournamentLinks.length > 0 && (
        <section>
          <h2
            className="font-display text-xl mb-3"
            style={{ transform: 'skewX(-6deg)' }}
          >
            중계 링크
          </h2>
          <div className="flex flex-wrap gap-2">
            {tournamentLinks.map((w, i) => (
              <a
                key={i}
                href={w.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded border border-line bg-panel/60 px-3 py-1.5 text-sm hover:border-korea hover:text-korea transition-colors"
              >
                {w.label}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
