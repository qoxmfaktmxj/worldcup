import Link from "next/link";
import { getMatches } from "@/lib/data";
import { teamPrimary } from "@/lib/teamColors";
import type { Match, TeamRef } from "@/lib/types";

export function generateStaticParams() {
  return [{ year: "2002" }];
}

const STAGE_KO: Record<string, string> = {
  "round of 16": "16강",
  "quarter-finals": "8강",
  "semi-finals": "준결승",
  "third-place match": "3·4위전",
  final: "결승",
};

function TeamRow({ team, score, win }: { team: TeamRef; score: number; win: boolean }) {
  return (
    <div className="flex items-center gap-2 font-display text-base">
      <span
        className="h-4 w-1 shrink-0 rounded-sm"
        style={{ background: teamPrimary(team.name) }}
        aria-hidden
      />
      <span className={`flex-1 truncate ${win ? "text-white" : "text-muted-dim"}`}>{team.nameKo}</span>
      <span className={`tabular-nums shrink-0 ${win ? "text-korea" : "text-muted-dim"}`}>{score}</span>
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

      <div className="mt-6 flex gap-4 overflow-x-auto pb-4 sm:gap-6">
        {rounds.map(({ stage, matches }, roundIdx) => (
          <section key={stage} className="min-w-[230px] flex-shrink-0">
            <h2 className="font-display text-lg text-muted mb-3 inline-block" style={{ transform: "skewX(-6deg)" }}>
              {STAGE_KO[stage] ?? stage}
            </h2>
            <div className="space-y-3">
              {matches.map((m, matchIdx) => {
                const homeWin = m.result === "win";
                const awayWin = m.result === "loss";
                const pens = m.homeScore === m.awayScore;
                return (
                  <Link
                    key={m.slug}
                    href={`/world-cup/2002/matches/${m.slug}`}
                    className="kx-slide block rounded-lg border border-line bg-panel p-3 transition-colors hover:border-korea"
                    style={{ animationDelay: `${(roundIdx * matches.length + matchIdx) * 0.05}s` }}
                  >
                    <TeamRow team={m.home} score={m.homeScore} win={homeWin} />
                    <div className="my-1.5 border-t border-line" />
                    <TeamRow team={m.away} score={m.awayScore} win={awayWin} />
                    <p className="text-muted-dim text-xs mt-2">
                      {m.date}
                      {pens ? " · 승부차기" : ""}
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
