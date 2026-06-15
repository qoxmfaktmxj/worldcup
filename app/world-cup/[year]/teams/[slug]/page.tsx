import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamSlugs, getTeamView } from "@/lib/data";
import { FallbackAvatar } from "@/components/kinetic/FallbackAvatar";

export async function generateStaticParams() {
  return (await getTeamSlugs(2002)).map((slug) => ({ year: "2002", slug }));
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ year: string; slug: string }>;
}) {
  const { slug } = await params;
  const view = await getTeamView(2002, slug);
  if (!view) notFound();

  const { team, standing, squad, matches } = view;

  return (
    <main className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-display text-5xl text-korea inline-block"
          style={{ transform: "skewX(-6deg)" }}
        >
          {team.nameKo}
        </h1>
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
                {standing.advanced ? "16강 진출" : "조별 탈락"}
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
                href={`/world-cup/2002/matches/${line.slug}`}
                className="kx-slide bg-panel rounded p-3 border border-line hover:border-korea transition-colors flex items-center gap-4"
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                {/* Result pill */}
                <span
                  className={`font-display text-sm rounded px-2 py-0.5 shrink-0 ${
                    line.result === "win"
                      ? "bg-korea text-white"
                      : line.result === "draw"
                      ? "bg-panel border border-line text-white"
                      : "text-muted-dim"
                  }`}
                >
                  {line.result === "win" ? "승" : line.result === "draw" ? "무" : "패"}
                </span>

                {/* Opponent */}
                <span className="text-white font-medium flex-1 truncate">
                  {line.opponentNameKo}
                </span>

                {/* Score */}
                <span className="font-display text-xl text-white shrink-0">
                  {line.gf} : {line.ga}
                </span>

                {/* Group & date */}
                <span className="text-muted text-xs shrink-0 hidden sm:block">
                  {line.group} · {line.date}
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
            {squad.map((entry, i) => (
              <Link
                key={entry.slug}
                href={`/players/${entry.slug}`}
                className="kx-pop bg-panel rounded p-3 border border-line hover:border-korea hover:-translate-y-0.5 transition-all flex items-center gap-3 group"
                style={{ animationDelay: `${0.04 * i}s` }}
              >
                <FallbackAvatar name={entry.nameKo} shirt={entry.shirtNumber} size={40} />
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate group-hover:text-korea transition-colors">
                    {entry.nameKo}
                  </p>
                  <p className="text-muted text-xs truncate">{entry.position}</p>
                  <p className="text-muted text-xs mt-0.5">
                    선발 {entry.starts} · 교체 {entry.subs} · 골 {entry.goals}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
