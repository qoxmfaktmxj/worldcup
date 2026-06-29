import Link from "next/link";
import { getMatches } from "@/lib/data";
import { teamPrimary } from "@/lib/teamColors";
import { stageKo } from "@/lib/stages";
import { toKstLabel } from "@/lib/time";
import { availableYears } from "@/lib/tournaments";
import type { Match, TeamRef } from "@/lib/types";

export function generateStaticParams() {
  return availableYears().map((year) => ({ year: String(year) }));
}

function TeamRow({ team, score, win, scheduled }: { team: TeamRef; score: number; win: boolean; scheduled?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 font-display text-sm">
      <span
        className="h-3.5 w-1 shrink-0 rounded-sm"
        style={{ background: teamPrimary(team.name) }}
        aria-hidden
      />
      <span className={`flex-1 truncate ${scheduled ? "text-white" : win ? "text-white" : "text-muted-dim"}`}>{team.nameKo}</span>
      {!scheduled && <span className={`tabular-nums shrink-0 ${win ? "text-korea" : "text-muted-dim"}`}>{score}</span>}
    </div>
  );
}

export default async function BracketPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const knockout = (await getMatches(Number(year))).filter((m) => !m.groupStage);

  const byStage = new Map<string, Match[]>();
  for (const m of knockout) {
    const arr = byStage.get(m.stage) ?? [];
    arr.push(m);
    byStage.set(m.stage, arr);
  }
  const rounds = [...byStage.entries()]
    .map(([stage, ms]) => ({ stage, matches: ms.sort((x, y) => x.date.localeCompare(y.date)) }))
    .sort((a, b) => a.matches[0].date.localeCompare(b.matches[0].date));

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-2">
        <h1 className="font-display text-5xl text-korea inline-block" style={{ transform: "skewX(-6deg)" }}>
          토너먼트
        </h1>
        <p className="text-muted mt-1 text-sm">{year} FIFA 월드컵 · 녹아웃</p>
      </div>

      {rounds.length === 0 && (
        <div className="mt-8 rounded-lg border border-line bg-panel/40 p-6 text-center">
          <p className="font-display text-xl text-white">토너먼트 대진 공개 전</p>
          <p className="text-muted text-sm mt-2">32강 대진은 조별리그 종료 후 반영됩니다.</p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:gap-2 lg:gap-3">
        {rounds.map(({ stage, matches }, roundIdx) => (
          <section key={stage} className="md:min-w-0 md:flex-1">
            <h2 className="font-display text-base text-muted mb-2 inline-block" style={{ transform: "skewX(-6deg)" }}>
              {stageKo(stage)}
            </h2>
            <div className="space-y-2.5">
              {matches.map((m, matchIdx) => {
                const scheduled = m.status === "scheduled";
                const homeWin = !scheduled && m.result === "win";
                const awayWin = !scheduled && m.result === "loss";
                const penNote = m.penaltyShootout
                  ? ` · 승부차기 ${m.result === "win" ? m.homePenalties : m.awayPenalties}-${
                      m.result === "win" ? m.awayPenalties : m.homePenalties
                    }`
                  : "";
                return (
                  <Link
                    key={m.slug}
                    href={`/world-cup/${year}/matches/${m.slug}`}
                    className="kx-slide block rounded-lg border border-line bg-panel p-2.5 transition-colors hover:border-korea"
                    style={{ animationDelay: `${(roundIdx * matches.length + matchIdx) * 0.05}s` }}
                  >
                    <TeamRow team={m.home} score={m.homeScore} win={homeWin} scheduled={scheduled} />
                    <div className="my-1 border-t border-line" />
                    <TeamRow team={m.away} score={m.awayScore} win={awayWin} scheduled={scheduled} />
                    <p className="text-muted-dim text-[11px] mt-1.5 leading-tight">
                      {scheduled && m.kickoffUtc ? `${toKstLabel(m.kickoffUtc)} · 예정` : `${m.date}${penNote}`}
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
