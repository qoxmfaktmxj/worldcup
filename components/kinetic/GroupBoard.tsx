import type { GroupStanding } from "@/lib/types";

export function GroupBoard({ g }: { g: GroupStanding }) {
  return (
    <div className="bg-panel/60 border border-line rounded-lg p-3">
      <div className="font-display text-korea text-lg mb-2" style={{ transform: "skewX(-6deg)" }}>
        {g.group}
      </div>
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
              <td className="py-1">{r.team.nameKo}</td>
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
