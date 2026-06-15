import { notFound } from "next/navigation";
import { KineticHero } from "@/components/kinetic/KineticHero";
import { MatchPitch } from "@/components/kinetic/MatchPitch";
import { PlayerChip } from "@/components/kinetic/PlayerChip";
import { getMatch, getMatches, getPlayerCards } from "@/lib/data";

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

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="font-display text-xl mb-2">{m.home.nameKo}</h2>
          <MatchPitch players={m.lineups.home} side="home" cards={cards} />
        </div>
        <div>
          <h2 className="font-display text-xl mb-2">{m.away.nameKo}</h2>
          <MatchPitch players={m.lineups.away} side="away" cards={cards} />
        </div>
      </div>

      <h3 className="font-display text-lg mt-6 mb-2">교체 투입</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {[...m.lineups.home, ...m.lineups.away]
          .filter((a) => a.substitute && cards[a.playerId])
          .map((a) => (
            <PlayerChip key={a.playerId} card={cards[a.playerId]} />
          ))}
      </div>
    </main>
  );
}
