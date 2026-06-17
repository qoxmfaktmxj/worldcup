import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlayerCards, getTeamSlugs, getTeamView } from "@/lib/data";
import { roundLabel } from "@/lib/stages";
import { availableYears } from "@/lib/tournaments";
import { teamPrimary } from "@/lib/teamColors";
import { PlayerAvatar } from "@/components/kinetic/PlayerAvatar";
import { PlayerTrigger } from "@/components/kinetic/PlayerTrigger";
import { TeamLabel } from "@/components/kinetic/TeamLabel";

export async function generateStaticParams() {
  const params: { year: string; slug: string }[] = [];
  for (const year of availableYears()) {
    for (const slug of await getTeamSlugs(year)) params.push({ year: String(year), slug });
  }
  return params;
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ year: string; slug: string }>;
}) {
  const { year, slug } = await params;
  const y = Number(year);
  const view = await getTeamView(y, slug);
  if (!view) notFound();

  const { team, standing, squad, matches } = view;
  const cards = await getPlayerCards(y);

  return (
    <main className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span
            className="h-10 w-1.5 shrink-0 rounded-sm"
            style={{ background: teamPrimary(team.name) }}
            aria-hidden
          />
          <h1
            className="font-display text-5xl text-korea inline-block"
            style={{ transform: "skewX(-6deg)" }}
          >
            {team.nameKo}
          </h1>
        </div>
        <p className="text-muted-dim text-sm mt-1 tracking-widest uppercase">
          {team.name} · {team.code}
        </p>

        {standing && (
          <div
            className="kx-slide mt-4 flex flex-wrap gap-3"
            style={{ animationDelay: ".1s" }}
          >
            <div className="bg-panel rounded px-4 py-2 border border-line flex flex-col items-center min-w-[72px]">
              <span className="font-display text-2xl text-white">{standing.wins}</span>
              <span className="text-muted text-xs mt-0.5">승</span>
            </div>
            <div className="bg-panel rounded px-4 py-2 border border-line flex flex-col items-center min-w-[72px]">
              <span className="font-display text-2xl text-white">{standing.draws}</span>
              <span className="text-muted text-xs mt-0.5">무</span>
            </div>
            <div className="bg-panel rounded px-4 py-2 border border-line flex flex-col items-center min-w-[72px]">
              <span className="font-display text-2xl text-white">{standing.losses}</span>
              <span className="text-muted text-xs mt-0.5">패</span>
            </div>
            <div className="bg-panel rounded px-4 py-2 border border-line flex flex-col items-center min-w-[72px]">
              <span className="font-display text-2xl text-white">{standing.points}</span>
              <span className="text-muted text-xs mt-0.5">승점</span>
            </div>
            <div className="bg-panel rounded px-4 py-2 border border-line flex flex-col items-center min-w-[72px]">
              <span className="font-display text-2xl text-white">
                {standing.gf}:{standing.ga}
              </span>
              <span className="text-muted text-xs mt-0.5">득:실</span>
            </div>
            <div
              className={`bg-panel rounded px-4 py-2 border flex flex-col items-center justify-center min-w-[100px] ${
                standing.advanced ? "border-korea" : "border-line"
              }`}
            >
              <span
                className={`font-display text-sm ${
                  standing.advanced ? "text-korea" : "text-muted-dim"
                }`}
              >
                {standing.played < 3 ? "조별리그 진행 중" : standing.advanced ? "16강 진출" : "조별 탈락"}
              </span>
              <span className="text-muted-dim text-xs mt-0.5">{standing.position}위</span>
            </div>
          </div>
        )}
      </div>

      {/* 경기 섹션 */}
      {matches.length > 0 && (
        <section className="mb-10">
          <h2
            className="font-display text-2xl mb-4"
            style={{ transform: "skewX(-6deg)" }}
          >
            경기
          </h2>
          <div className="flex flex-col gap-2">
            {matches.map((line, i) => (
              <Link
                key={line.slug}
                href={`/world-cup/${y}/matches/${line.slug}`}
                className="kx-slide bg-panel rounded p-3 border border-line hover:border-korea transition-colors flex items-center gap-4"
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                {/* Result pill (예정 경기는 결과 없음) */}
                <span
                  className={`font-display text-sm rounded px-2 py-0.5 shrink-0 ${
                    line.status === "scheduled"
                      ? "border border-line text-muted-dim"
                      : line.result === "win"
                      ? "bg-korea text-white"
                      : line.result === "draw"
                      ? "bg-panel border border-line text-white"
                      : "text-muted-dim"
                  }`}
                >
                  {line.status === "scheduled"
                    ? "예정"
                    : line.result === "win"
                    ? "승"
                    : line.result === "draw"
                    ? "무"
                    : "패"}
                </span>

                {/* Opponent */}
                <TeamLabel
                  name={line.opponentName}
                  nameKo={line.opponentNameKo}
                  className="flex-1 text-white font-medium"
                />

                {/* Round & date */}
                <span className="text-muted text-xs shrink-0 hidden text-right tabular-nums sm:block">
                  {roundLabel(line.group, line.stage)} · {line.date}
                </span>

                {/* Score (right edge) — 예정 경기는 스코어 없음 */}
                <span className="font-display text-xl text-white shrink-0 w-16 text-right tabular-nums">
                  {line.status === "finished" ? `${line.gf} : ${line.ga}` : "—"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 스쿼드 섹션 */}
      {squad.length > 0 && (
        <section>
          <h2
            className="font-display text-2xl mb-4"
            style={{ transform: "skewX(-6deg)" }}
          >
            스쿼드
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {squad.map((entry, i) => {
              const card = cards[entry.playerId];
              const inner = (
                <span
                  className="kx-pop group flex w-full items-center gap-3 rounded border border-line bg-panel p-3 transition-all hover:-translate-y-0.5 hover:border-korea"
                  style={{ animationDelay: `${0.04 * i}s` }}
                >
                  {card ? <PlayerAvatar card={card} size={40} /> : null}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white transition-colors group-hover:text-korea">
                      {entry.nameKo}
                    </span>
                    <span className="block truncate text-xs text-muted">{entry.position}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      선발 {entry.starts} · 교체 {entry.subs} · 골 {entry.goals}
                    </span>
                  </span>
                </span>
              );
              return card ? (
                <PlayerTrigger key={entry.slug} card={card} preview={false} className="w-full text-left">
                  {inner}
                </PlayerTrigger>
              ) : (
                <Link key={entry.slug} href={`/players/${entry.slug}`} className="w-full">
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
