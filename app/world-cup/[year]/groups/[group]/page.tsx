import { notFound } from "next/navigation";
import Link from "next/link";
import { GroupBoard } from "@/components/kinetic/GroupBoard";
import { getStandings, getMatches } from "@/lib/data";
import { groupSlug } from "@/lib/aggregate";

export async function generateStaticParams() {
  const s = await getStandings(2002);
  return s.map((g) => ({ year: "2002", group: groupSlug(g.group) }));
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ year: string; group: string }>;
}) {
  const { group } = await params;
  const standings = await getStandings(2002);
  const g = standings.find((x) => groupSlug(x.group) === group);
  if (!g) notFound();

  const matches = (await getMatches(2002))
    .filter((m) => m.group === g.group)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1
        className="font-display text-5xl text-korea"
        style={{ transform: "skewX(-6deg)" }}
      >
        {g.group}
      </h1>

      <div className="mt-6">
        <GroupBoard g={g} />
      </div>

      <section className="mt-6">
        <h2
          className="font-display text-xl mb-3"
          style={{ transform: "skewX(-6deg)" }}
        >
          경기
        </h2>
        <div className="flex flex-col gap-2">
          {matches.map((m, i) => (
            <Link
              key={m.slug}
              href={`/world-cup/2002/matches/${m.slug}`}
              className="kx-slide bg-panel border border-line rounded-lg p-3 flex items-center justify-between hover:border-korea transition-colors"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="flex items-center gap-3 text-sm">
                <span className="text-white">{m.home.nameKo}</span>
                <span className="font-display text-korea text-base tabular-nums">
                  {m.homeScore}&nbsp;:&nbsp;{m.awayScore}
                </span>
                <span className="text-white">{m.away.nameKo}</span>
              </div>
              <span className="text-muted text-xs shrink-0 ml-4">{m.date}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
