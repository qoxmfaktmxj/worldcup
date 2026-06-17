import { notFound } from "next/navigation";
import { KineticHero } from "@/components/kinetic/KineticHero";
import { MatchPitch } from "@/components/kinetic/MatchPitch";
import { PlayerChip } from "@/components/kinetic/PlayerChip";
import { ScheduledMatchCard } from "@/components/kinetic/ScheduledMatchCard";
import { getMatch, getMatches, getPlayerCards, getStandings, getWatchLinks } from "@/lib/data";
import { resolveMatchColors } from "@/lib/teamColors";
import { availableYears } from "@/lib/tournaments";

export async function generateStaticParams() {
  const params: { year: string; slug: string }[] = [];
  for (const year of availableYears()) {
    for (const m of await getMatches(year)) params.push({ year: String(year), slug: m.slug });
  }
  return params;
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ year: string; slug: string }>;
}) {
  const { year, slug } = await params;
  const m = await getMatch(Number(year), slug);
  if (!m) notFound();

  if (m.status === "scheduled") {
    const [standings, watchLinks] = await Promise.all([
      getStandings(Number(year)),
      getWatchLinks(Number(year)),
    ]);
    return (
      <main className="mx-auto max-w-4xl p-6">
        <ScheduledMatchCard m={m} year={Number(year)} standings={standings} watchLinks={watchLinks} />
      </main>
    );
  }

  const cards = await getPlayerCards(Number(year));
  const colors = resolveMatchColors(m.home.name, m.away.name);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <KineticHero m={m} year={Number(year)} />

      {m.goals.length > 0 && (
        <div
          className="kx-slide mt-3 text-sm text-muted"
          style={{ transform: "skewX(-6deg)", animationDelay: ".15s" }}
        >
          {m.goals.map((g, i) => (
            <span key={i} className="mr-3">
              {g.nameKo} {g.minute}&#39;{g.ownGoal ? " (자책골)" : ""}
              {g.penalty ? " (페널티골)" : ""}
            </span>
          ))}
        </div>
      )}

      {m.penaltyShootout && m.shootout.length > 0 && (
        <section className="mt-5 rounded-lg border border-line bg-panel/40 p-4">
          <h3 className="font-display text-lg mb-3" style={{ transform: "skewX(-6deg)" }}>
            승부차기 {m.homePenalties} - {m.awayPenalties}
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {[m.home, m.away].map((team) => (
              <div key={team.id}>
                <h4 className="text-muted text-sm mb-2">{team.nameKo}</h4>
                <div className="flex flex-col gap-1.5">
                  {m.shootout
                    .filter((k) => k.teamId === team.id)
                    .map((k, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className={`text-base leading-none ${k.converted ? "text-[#3ddc84]" : "text-[#ff5a5a]"}`} aria-hidden>
                          {k.converted ? "●" : "✕"}
                        </span>
                        <span className="w-5 text-xs text-muted-dim tabular-nums">{k.shirtNumber}</span>
                        <span className={k.converted ? "" : "text-muted-dim line-through"}>{k.nameKo}</span>
                        <span className="ml-auto text-xs text-muted">{k.converted ? "성공" : "실패"}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-6 grid items-stretch gap-4 md:grid-cols-2">
        <div className="flex flex-col">
          <h2 className="font-display text-xl mb-2">
            {m.home.nameKo} <span className="text-muted text-sm font-normal">{`(${m.home.name})`}</span>
          </h2>
          <MatchPitch players={m.lineups.home} side="home" color={colors.home} cards={cards} />
        </div>
        <div className="flex flex-col">
          <h2 className="font-display text-xl mb-2">
            {m.away.nameKo} <span className="text-muted text-sm font-normal">{`(${m.away.name})`}</span>
          </h2>
          <MatchPitch players={m.lineups.away} side="away" color={colors.away} cards={cards} />
        </div>
      </div>

      <h3 className="font-display text-lg mt-8 mb-3" style={{ transform: "skewX(-6deg)" }}>
        교체 투입
      </h3>
      <div className="grid gap-6 sm:grid-cols-2">
        {[
          { team: m.home, color: colors.home },
          { team: m.away, color: colors.away },
        ].map(({ team, color }) => {
          const subs = m.subs.filter((s) => s.teamId === team.id).sort((a, b) => a.minute - b.minute);
          return (
            <div key={team.id}>
              <h4 className="font-display mb-2 text-base text-muted">{team.nameKo}</h4>
              {subs.length ? (
                <div className="flex flex-col gap-2">
                  {subs.map((s, i) => {
                    const on = cards[s.onId];
                    const off = cards[s.offId];
                    if (!on) return null;
                    const half = s.minute <= 45 ? "전반" : "후반";
                    return (
                      <div key={i}>
                        <PlayerChip card={on} color={color} />
                        <div className="mt-0.5 pl-1 text-[11px] text-muted">
                          {s.minute}&#39; {half}
                          {off ? ` · ${off.nameKo} 아웃` : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted">교체 없음</p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
