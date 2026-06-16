import Link from "next/link";
import { GroupBoard } from "@/components/kinetic/GroupBoard";
import { FinalRanking } from "@/components/kinetic/FinalRanking";
import { getFinalRanking, getStandings, getTournament } from "@/lib/data";
import { availableYears, emblemLarge } from "@/lib/tournaments";

export function generateStaticParams() {
  return availableYears().map((year) => ({ year: String(year) }));
}

export default async function TournamentPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const y = Number(year);
  const [t, standings, ranking] = await Promise.all([getTournament(y), getStandings(y), getFinalRanking(y)]);
  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={emblemLarge(y)} alt={`${t.name} 로고`} className="h-28 w-auto" />
          <div>
            <h1 className="font-display text-5xl text-korea" style={{ transform: "skewX(-6deg)" }}>
              {t.name}
            </h1>
            <p className="text-muted mt-1">
              {t.host}
              {t.asOf ? <span className="text-korea"> · 진행 중 ({t.asOf} 기준)</span> : ""}
            </p>
          </div>
        </div>
        <nav className="flex gap-2 text-sm">
          <Link href={`/world-cup/${y}/bracket`} className="bg-panel border border-line rounded-lg px-3 py-2 hover:border-korea transition-colors">
            토너먼트
          </Link>
          <Link href="/search" className="bg-panel border border-line rounded-lg px-3 py-2 hover:border-korea transition-colors">
            검색
          </Link>
          <Link href="/sources" className="bg-panel border border-line rounded-lg px-3 py-2 hover:border-korea transition-colors">
            출처
          </Link>
        </nav>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {standings.map((g) => (
          <GroupBoard key={g.group} g={g} year={y} />
        ))}
      </div>

      {!t.asOf && (
        <section className="mt-10">
          <h2 className="font-display text-3xl text-korea mb-4" style={{ transform: "skewX(-6deg)" }}>
            최종 순위
          </h2>
          <FinalRanking rows={ranking} year={y} />
        </section>
      )}
    </main>
  );
}
