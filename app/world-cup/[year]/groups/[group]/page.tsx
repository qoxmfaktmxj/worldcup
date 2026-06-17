import { notFound } from "next/navigation";
import Link from "next/link";
import { GroupBoard } from "@/components/kinetic/GroupBoard";
import { getStandings, getMatches } from "@/lib/data";
import { groupSlug } from "@/lib/aggregate";
import { groupKo } from "@/lib/stages";
import { availableYears } from "@/lib/tournaments";
import { TeamLabel } from "@/components/kinetic/TeamLabel";

export async function generateStaticParams() {
  const params: { year: string; group: string }[] = [];
  for (const year of availableYears()) {
    for (const g of await getStandings(year)) params.push({ year: String(year), group: groupSlug(g.group) });
  }
  return params;
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ year: string; group: string }>;
}) {
  const { year, group } = await params;
  const y = Number(year);
  const standings = await getStandings(y);
  const g = standings.find((x) => groupSlug(x.group) === group);
  if (!g) notFound();

  const matches = (await getMatches(y))
    .filter((m) => m.group === g.group)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1
        className="font-display text-5xl text-korea"
        style={{ transform: "skewX(-6deg)" }}
      >
        {groupKo(g.group)}
      </h1>

      <div className="mt-6">
        <GroupBoard g={g} year={y} />
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
              href={`/world-cup/${y}/matches/${m.slug}`}
              className="kx-slide bg-panel border border-line rounded-lg p-3 flex items-center justify-between hover:border-korea transition-colors"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="flex items-center gap-3 text-sm">
                <TeamLabel name={m.home.name} nameKo={m.home.nameKo} className="text-white" />
                {m.status === "finished" ? (
                  <span className="font-display text-korea text-base tabular-nums">
                    {m.homeScore}&nbsp;:&nbsp;{m.awayScore}
                  </span>
                ) : (
                  <span className="text-muted text-xs">예정</span>
                )}
                <TeamLabel name={m.away.name} nameKo={m.away.nameKo} className="text-white" />
              </div>
              <span className="text-muted text-xs shrink-0 ml-4">{m.date}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
