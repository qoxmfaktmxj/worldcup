import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlayerSlugs, getPlayer } from "@/lib/data";
import { roundLabel } from "@/lib/stages";
import { FallbackAvatar } from "@/components/kinetic/FallbackAvatar";

export async function generateStaticParams() {
  return (await getPlayerSlugs(2002)).map((slug) => ({ slug }));
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPlayer(2002, slug);
  if (!p) notFound();

  const sortedMatches = [...p.matches].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const STAT_TILES = [
    { label: "출전", value: p.matches.length, accent: false },
    { label: "선발", value: p.starts, accent: false },
    { label: "교체", value: p.subs, accent: false },
    { label: "골", value: p.goals, accent: true },
  ];

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* Back navigation */}
      <Link
        href={`/world-cup/2002/teams/${p.teamSlug}`}
        className="inline-flex items-center gap-1 text-muted text-xs mb-5 hover:text-white transition-colors"
      >
        ← {p.teamNameKo}
      </Link>

      {/* Hero */}
      <div className="kx-slide bg-panel border border-line rounded-xl p-6 flex items-center gap-5">
        <FallbackAvatar name={p.nameKo} shirt={p.shirtNumber} size={72} />
        <div className="flex-1 min-w-0">
          <h1
            className="font-display text-4xl leading-none text-white truncate"
            style={{ transform: "skewX(-6deg)" }}
          >
            {p.nameKo}
          </h1>
          <p className="text-sm text-muted-dim mt-0.5 truncate">{p.nameEn}</p>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <Link
              href={`/world-cup/2002/teams/${p.teamSlug}`}
              className="text-sm text-white hover:text-korea transition-colors font-medium"
            >
              {p.teamNameKo}
            </Link>
            <span className="text-muted-dim text-sm">·</span>
            <span className="text-muted text-sm">{p.position}</span>
            <span className="text-muted-dim text-sm">·</span>
            <span className="text-muted text-sm">#{p.shirtNumber}</span>
          </div>
        </div>
        {/* Decorative shirt number */}
        <div
          className="font-display text-7xl leading-none select-none pointer-events-none"
          style={{
            color: "rgba(228,0,43,0.12)",
            transform: "skewX(-6deg)",
          }}
          aria-hidden="true"
        >
          {p.shirtNumber}
        </div>
      </div>

      {/* Stat tiles */}
      <div
        className="kx-slide grid grid-cols-4 gap-2 mt-4"
        style={{ animationDelay: "0.08s" }}
      >
        {STAT_TILES.map((tile) => (
          <div
            key={tile.label}
            className="bg-panel border border-line rounded-lg p-3 text-center"
          >
            <div
              className={`font-display text-2xl leading-none ${
                tile.accent ? "text-korea" : "text-white"
              }`}
            >
              {tile.value}
            </div>
            <div className="text-muted text-xs mt-1">{tile.label}</div>
          </div>
        ))}
      </div>

      {/* Match history */}
      <div className="mt-8">
        <h2
          className="font-display text-xl mb-3"
          style={{ transform: "skewX(-6deg)" }}
        >
          경기별 기록
        </h2>

        {sortedMatches.length === 0 ? (
          <p className="text-muted text-sm">경기 기록이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedMatches.map((pm, i) => (
              <Link
                key={pm.matchId}
                href={`/world-cup/2002/matches/${pm.slug}`}
                className="kx-slide bg-panel border border-line rounded-lg p-3 flex items-center gap-3 hover:border-korea transition-colors group"
                style={{ animationDelay: `${0.12 + i * 0.05}s` }}
              >
                {/* Badge: 선발 or 교체 */}
                <div className="flex-shrink-0">
                  {pm.starter ? (
                    <span className="bg-korea text-white text-[10px] font-display px-2 py-0.5 rounded">
                      선발
                    </span>
                  ) : (
                    <span className="border border-line text-muted text-[10px] font-display px-2 py-0.5 rounded">
                      교체
                    </span>
                  )}
                </div>

                {/* Opponent + meta */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white group-hover:text-korea transition-colors truncate">
                    vs {pm.opponentNameKo}
                  </div>
                  <div className="text-muted text-xs mt-0.5">
                    {roundLabel(pm.group, pm.stage)} · {pm.date}
                  </div>
                </div>

                {/* Goal indicator */}
                {pm.goals > 0 && (
                  <div className="flex-shrink-0 font-display text-sm text-korea">
                    골 {pm.goals}
                  </div>
                )}

                {/* Chevron */}
                <svg
                  className="flex-shrink-0 w-4 h-4 text-muted-dim group-hover:text-korea transition-colors"
                  fill="none"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path
                    d="M6 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
