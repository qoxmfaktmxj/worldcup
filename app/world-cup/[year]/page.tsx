import { GroupBoard } from "@/components/kinetic/GroupBoard";
import { getStandings, getTournament } from "@/lib/data";

export function generateStaticParams() {
  return [{ year: "2002" }];
}

export default async function TournamentPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const y = Number(year);
  const [t, standings] = await Promise.all([getTournament(y), getStandings(y)]);
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="font-display text-5xl text-korea" style={{ transform: "skewX(-6deg)" }}>
        {t.name}
      </h1>
      <p className="text-muted mt-1">{t.host}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {standings.map((g) => (
          <GroupBoard key={g.group} g={g} />
        ))}
      </div>
    </main>
  );
}
