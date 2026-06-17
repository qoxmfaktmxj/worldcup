import Link from "next/link";
import { Live2026Strip } from "@/components/kinetic/Live2026Strip";
import { Nav } from "@/components/kinetic/Nav";
import { getMatches, getTournament } from "@/lib/data";
import { TOURNAMENTS, emblemSmall } from "@/lib/tournaments";

export default async function Home() {
  const [matches, tournament] = await Promise.all([
    getMatches(2026),
    getTournament(2026),
  ]);

  const archiveYears = TOURNAMENTS.filter((t) => t.status === "archive-complete");

  return (
    <main className="mx-auto max-w-5xl p-6 sm:p-8 space-y-10">
      <Nav active="2026" />

      {/* 2026 현황 스트립 */}
      <Live2026Strip matches={matches} asOf={tournament.asOf} />

      {/* 역대 월드컵 아카이브 */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2
            className="font-display text-2xl text-white"
            style={{ transform: "skewX(-6deg)" }}
          >
            역대 월드컵
          </h2>
          <Link
            href="/archive"
            className="text-sm text-korea hover:underline"
          >
            전체 보기 →
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          {archiveYears.map((t, i) => (
            <Link
              key={t.year}
              href={`/world-cup/${t.year}`}
              className="kx-pop group flex flex-col items-center gap-1.5 rounded-xl border border-line bg-panel px-4 py-3 hover:border-korea transition-all hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <img
                src={emblemSmall(t.year)}
                alt={`${t.year} 엠블럼`}
                className="h-12 w-12 object-contain"
              />
              <span className="font-display text-lg leading-none">{t.year}</span>
              <span className="text-[10px] text-muted">{t.nameKo}</span>
            </Link>
          ))}

          {/* 전체 보기 CTA 칩 */}
          <Link
            href="/archive"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line bg-panel/50 px-4 py-3 hover:border-korea transition-all hover:-translate-y-0.5 min-w-[80px]"
          >
            <span className="text-2xl text-muted">+</span>
            <span className="text-[10px] text-muted">전체 보기</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
