import Link from "next/link";
import type { GroupStanding } from "@/lib/types";
import { groupSlug, teamSlug } from "@/lib/aggregate";

export function GroupBoard({ g, year }: { g: GroupStanding; year: number }) {
  return (
    <div className="bg-panel/60 border border-line rounded-lg p-3">
      <Link
        href={`/world-cup/${year}/groups/${groupSlug(g.group)}`}
        className="font-display text-korea text-lg mb-2 inline-block hover:opacity-80"
        style={{ transform: "skewX(-6deg)" }}
      >
        {g.group}
      </Link>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] text-muted">
            <th className="text-left font-normal w-6">#</th>
            <th className="text-left font-normal">팀</th>
            <th className="text-right font-normal">승무패</th>
            <th className="text-right font-normal w-8">점</th>
          </tr>
        </thead>
        <tbody>
          {g.rows.map((r) => (
            <tr key={r.team.id} className={r.advanced ? "text-white" : "text-muted"}>
              <td className={`py-1 ${r.advanced ? "text-korea font-medium" : ""}`}>{r.position}</td>
              <td className="py-1">
                <Link href={`/world-cup/${year}/teams/${teamSlug(r.team)}`} className="hover:text-korea transition-colors">
                  {r.team.nameKo}
                </Link>
              </td>
              <td className="py-1 text-right text-xs text-muted">
                {r.wins}·{r.draws}·{r.losses}
              </td>
              <td className="py-1 text-right font-display">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
