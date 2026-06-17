import Link from "next/link";
import type { GroupStanding } from "@/lib/types";
import { groupSlug, teamSlug } from "@/lib/aggregate";
import { groupKo } from "@/lib/stages";
import { teamPrimary } from "@/lib/teamColors";

export function GroupBoard({ g, year }: { g: GroupStanding; year: number }) {
  return (
    <div className="bg-panel/60 border border-line rounded-lg p-3">
      <Link
        href={`/world-cup/${year}/groups/${groupSlug(g.group)}`}
        className="font-display text-korea text-lg mb-2 inline-block hover:opacity-80"
        style={{ transform: "skewX(-6deg)" }}
      >
        {groupKo(g.group)}
      </Link>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-muted-dim border-b border-line/60">
            <th className="text-left font-normal w-6 pb-1">#</th>
            <th className="text-left font-normal pb-1">팀</th>
            <th className="text-right font-normal pb-1">승무패</th>
            <th className="text-right font-normal w-8 pb-1">점</th>
          </tr>
        </thead>
        <tbody>
          {g.rows.map((r) => (
            <tr key={r.team.id}>
              <td className={`py-1 tabular-nums ${r.advanced ? "text-korea font-bold" : "text-muted-dim"}`}>{r.position}</td>
              <td className="py-1">
                <Link
                  href={`/world-cup/${year}/teams/${teamSlug(r.team)}`}
                  className="flex items-center gap-1.5 font-medium text-white transition-colors hover:text-korea"
                >
                  <span className="h-3.5 w-1 shrink-0 rounded-sm" style={{ background: teamPrimary(r.team.name) }} aria-hidden />
                  <span className="truncate">{r.team.nameKo}</span>
                </Link>
              </td>
              <td className="py-1 text-right text-xs text-muted tabular-nums">
                {r.wins}·{r.draws}·{r.losses}
              </td>
              <td className={`py-1 text-right font-display tabular-nums ${r.advanced ? "text-korea" : "text-white"}`}>{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
