import { notFound } from "next/navigation";
import { KineticHero } from "@/components/kinetic/KineticHero";
import { MatchPitch } from "@/components/kinetic/MatchPitch";
import { PlayerChip } from "@/components/kinetic/PlayerChip";
import { getMatch, getMatches, getPlayerCards } from "@/lib/data";
import { resolveMatchColors } from "@/lib/teamColors";

export async function generateStaticParams() {
  const matches = await getMatches(2002);
  return matches.map((m) => ({ year: "2002", slug: m.slug }));
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ year: string; slug: string }>;
}) {
  const { year, slug } = await params;
  const m = await getMatch(Number(year), slug);
  if (!m) notFound();

  const cards = await getPlayerCards(Number(year));
  const colors = resolveMatchColors(m.home.name, m.away.name);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <KineticHero m={m} />

      {m.goals.length > 0 && (
        <div
          className="kx-slide mt-3 text-sm text-muted"
          style={{ transform: "skewX(-6deg)", animationDelay: ".15s" }}
        >
          {m.goals.map((g, i) => (
            <span key={i} className="mr-3">
              {g.nameKo} {g.minute}&#39;{g.ownGoal ? " (OG)" : ""}
              {g.penalty ? " (PK)" : ""}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 grid items-stretch gap-4 md:grid-cols-2">
        <div className="flex flex-col">
          <h2 className="font-display text-xl mb-2">{m.home.nameKo}</h2>
          <MatchPitch players={m.lineups.home} side="home" color={colors.home} cards={cards} />
        </div>
        <div className="flex flex-col">
          <h2 className="font-display text-xl mb-2">{m.away.nameKo}</h2>
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
