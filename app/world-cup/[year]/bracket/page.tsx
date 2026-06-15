import Link from "next/link";
import { getMatches } from "@/lib/data";
import type { Match } from "@/lib/types";

export function generateStaticParams() {
  return [{ year: "2002" }];
}

export default async function BracketPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const knockout = (await getMatches(Number(year))).filter(
    (m) => !m.groupStage
  );

  // 라운드별 그룹핑 후 각 라운드의 첫 경기 날짜 기준 정렬
  const byStage = new Map<string, Match[]>();
  for (const m of knockout) {
    const arr = byStage.get(m.stage) ?? [];
    arr.push(m);
    byStage.set(m.stage, arr);
  }

  const rounds = [...byStage.entries()]
    .map(([stage, ms]) => ({
      stage,
      matches: ms.sort((x, y) => x.date.localeCompare(y.date)),
    }))
    .sort((a, b) => a.matches[0].date.localeCompare(b.matches[0].date));

  return (
    <main className="mx-auto max-w-6xl p-6">
      {/* 헤더 */}
      <div className="mb-2">
        <h1
          className="font-display text-5xl text-korea inline-block"
          style={{ transform: "skewX(-6deg)" }}
        >
          토너먼트
        </h1>
        <p className="text-muted mt-1 text-sm">{year} FIFA 월드컵 · 녹아웃 스테이지</p>
      </div>

      {/* 라운드 컬럼 — 데스크탑: 가로 스크롤, 모바일: 세로 스택 */}
      <div className="mt-6 flex gap-4 overflow-x-auto pb-4 sm:gap-6">
        {rounds.map(({ stage, matches }, roundIdx) => (
          <section
            key={stage}
            className="min-w-[230px] flex-shrink-0"
          >
            {/* 라운드 타이틀 */}
            <h2
              className="font-display text-lg text-muted mb-3 uppercase tracking-wide inline-block"
              style={{ transform: "skewX(-6deg)" }}
            >
              {stage}
            </h2>

            {/* 경기 카드 */}
            <div className="space-y-3">
              {matches.map((m, matchIdx) => {
                const homeWins = m.homeScore > m.awayScore;
                const awayWins = m.awayScore > m.homeScore;
                const draw = m.homeScore === m.awayScore;

                const delay = (roundIdx * matches.length + matchIdx) * 0.05;

                return (
                  <Link
                    key={m.slug}
                    href={`/world-cup/2002/matches/${m.slug}`}
                    className="kx-slide bg-panel border border-line rounded-lg p-3 block hover:border-korea transition-colors"
                    style={{ animationDelay: `${delay}s` }}
                  >
                    {/* 홈팀 행 */}
                    <div
                      className={`flex justify-between items-center font-display text-base ${
                        homeWins
                          ? "text-korea font-medium"
                          : draw
                          ? "text-white"
                          : "text-muted"
                      }`}
                    >
                      <span className="truncate max-w-[140px]">
                        {m.home.nameKo}
                      </span>
                      <span className="ml-2 tabular-nums shrink-0">
                        {m.homeScore}
                      </span>
                    </div>

                    {/* 구분선 */}
                    <div className="border-t border-line my-1.5" />

                    {/* 원정팀 행 */}
                    <div
                      className={`flex justify-between items-center font-display text-base ${
                        awayWins
                          ? "text-korea font-medium"
                          : draw
                          ? "text-white"
                          : "text-muted"
                      }`}
                    >
                      <span className="truncate max-w-[140px]">
                        {m.away.nameKo}
                      </span>
                      <span className="ml-2 tabular-nums shrink-0">
                        {m.awayScore}
                      </span>
                    </div>

                    {/* 날짜 */}
                    <p className="text-muted-dim text-xs mt-2">
                      {m.date}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
