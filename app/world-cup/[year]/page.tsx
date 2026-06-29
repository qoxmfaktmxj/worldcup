import { GroupBoard } from "@/components/kinetic/GroupBoard";
import { FinalRanking } from "@/components/kinetic/FinalRanking";
import { Nav } from "@/components/kinetic/Nav";
import { getFinalRanking, getMatches, getStandings, getTournament } from "@/lib/data";
import { availableYears, emblemLarge } from "@/lib/tournaments";

export function generateStaticParams() {
  return availableYears().map((year) => ({ year: String(year) }));
}

export default async function TournamentPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const y = Number(year);
  const [t, standings, ranking] = await Promise.all([getTournament(y), getStandings(y), getFinalRanking(y)]);
  // 녹아웃 경기가 있으면 토너먼트 nav 노출(없으면 브래킷이 빈 상태이므로 숨김).
  const hasKnockout = (await getMatches(y)).some((m) => !m.groupStage);
  const tournamentExtra = hasKnockout ? [{ label: "토너먼트", href: `/world-cup/${y}/bracket` }] : [];

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Nav extra={tournamentExtra} />
      <div className="flex flex-wrap items-end gap-4 mt-6">
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
