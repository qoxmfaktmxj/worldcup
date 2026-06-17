import Link from "next/link";
import type { FinalRankRow } from "@/lib/types";
import { teamSlug } from "@/lib/aggregate";
import { teamPrimary } from "@/lib/teamColors";

const FINISH_STYLE: Record<string, string> = {
  우승: "bg-[#f0b323] text-[#3a2c00]",
  준우승: "bg-[#c4c8d0] text-[#23262f]",
  "3위": "bg-[#cd7f32] text-[#2a1600]",
  "4위": "border border-line text-muted",
  "8강": "border border-line text-muted",
  "16강": "border border-line text-muted",
  조별리그: "text-muted-dim",
};

export function FinalRanking({ rows, year }: { rows: FinalRankRow[]; year: number }) {
  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] text-muted">
            <th className="w-8 py-2 text-left font-normal">#</th>
            <th className="py-2 text-left font-normal">팀</th>
            <th className="hidden w-9 py-2 text-center font-normal sm:table-cell">경기</th>
            <th className="hidden w-8 py-2 text-center font-normal sm:table-cell">승</th>
            <th className="hidden w-8 py-2 text-center font-normal sm:table-cell">무</th>
            <th className="hidden w-8 py-2 text-center font-normal sm:table-cell">패</th>
            <th className="hidden w-12 py-2 text-center font-normal sm:table-cell">득실</th>
            <th className="w-10 py-2 text-center font-normal">승점</th>
            <th className="w-16 py-2 text-right font-normal">비고</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.team.id} className="border-b border-line/50">
              <td className="py-1.5 font-display text-muted">{r.position}</td>
              <td className="py-1.5">
                <Link
                  href={`/world-cup/${year}/teams/${teamSlug(r.team)}`}
                  className="flex items-center gap-2 transition-colors hover:text-korea"
                >
                  <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: teamPrimary(r.team.name) }} aria-hidden />
                  <span className="truncate">{r.team.nameKo}</span>
                </Link>
              </td>
              <td className="hidden py-1.5 text-center text-muted sm:table-cell">{r.played}</td>
              <td className="hidden py-1.5 text-center sm:table-cell">{r.wins}</td>
              <td className="hidden py-1.5 text-center text-muted sm:table-cell">{r.draws}</td>
              <td className="hidden py-1.5 text-center text-muted sm:table-cell">{r.losses}</td>
              <td className="hidden py-1.5 text-center tabular-nums text-muted sm:table-cell">
                {r.gf}:{r.ga}
              </td>
              <td className="py-1.5 text-center font-display">{r.points}</td>
              <td className="py-1.5 text-right">
                <span className={`inline-block rounded px-2 py-0.5 text-[11px] ${FINISH_STYLE[r.finish] ?? "text-muted"}`}>
                  {r.finish}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
