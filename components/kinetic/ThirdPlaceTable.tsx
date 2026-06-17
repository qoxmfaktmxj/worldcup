import type { ThirdPlaceRow } from '@/lib/thirdplace'
import { teamPrimary } from '@/lib/teamColors'
import { groupKo } from '@/lib/stages'

const ADVANCE_DIVIDER_AFTER = 7 // index 7 = 8th row (0-based); divider between index 7 and 8

export function ThirdPlaceTable({ rows }: { rows: ThirdPlaceRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] text-muted">
            <th className="w-8 py-2 text-left font-normal">#</th>
            <th className="py-2 text-left font-normal">팀</th>
            <th className="w-9 py-2 text-center font-normal">경기</th>
            <th className="w-10 py-2 text-center font-normal">승점</th>
            <th className="w-12 py-2 text-center font-normal">득실</th>
            <th className="w-10 py-2 text-center font-normal">득점</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <>
              {i === ADVANCE_DIVIDER_AFTER + 1 && (
                <tr key="divider-row" aria-hidden>
                  <td colSpan={6} className="py-0">
                    <div className="flex items-center gap-2 py-1.5">
                      <span className="h-px flex-1 bg-line" />
                      <span className="text-[11px] text-muted shrink-0">탈락권</span>
                      <span className="h-px flex-1 bg-line" />
                    </div>
                  </td>
                </tr>
              )}
              {i === 0 && (
                <tr key="advance-label-row" aria-hidden>
                  <td colSpan={6} className="py-0">
                    <div className="flex items-center gap-2 py-1.5">
                      <span className="h-px flex-1 bg-korea/40" />
                      <span className="text-[11px] text-korea shrink-0">진출권 (상위 8)</span>
                      <span className="h-px flex-1 bg-korea/40" />
                    </div>
                  </td>
                </tr>
              )}
              <tr key={r.team.id} className="border-b border-line/50">
                <td className="py-1.5 font-display text-muted">{i + 1}</td>
                <td className="py-1.5">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-sm"
                      style={{ background: teamPrimary(r.team.name) }}
                      aria-hidden
                    />
                    <span className="truncate">
                      {r.team.nameKo}
                      <span className="ml-1 text-[11px] text-muted">{groupKo(r.group)}</span>
                    </span>
                  </span>
                </td>
                <td className="py-1.5 text-center text-muted">{r.played}</td>
                <td className="py-1.5 text-center font-display">{r.points}</td>
                <td className={`py-1.5 text-center tabular-nums ${r.gd > 0 ? 'text-korea' : r.gd < 0 ? 'text-red-400' : 'text-muted'}`}>
                  {r.gd > 0 ? `+${r.gd}` : r.gd}
                </td>
                <td className="py-1.5 text-center text-muted">{r.gf}</td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
