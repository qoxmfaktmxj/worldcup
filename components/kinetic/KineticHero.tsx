import type { Match } from "@/lib/types";
import { roundLabel } from "@/lib/stages";
import { StreakBg } from "./StreakBg";
import { ScoreLine } from "./ScoreLine";

export function KineticHero({ m, year }: { m: Match; year: number }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-ink p-6">
      <StreakBg />
      <div className="relative">
        <div
          className="kx-slide inline-block bg-korea px-3 py-1 text-xs font-medium tracking-wider"
          style={{ transform: "skewX(-12deg)" }}
        >
          <span style={{ display: "inline-block", transform: "skewX(12deg)" }}>
            {year} 월드컵 · {roundLabel(m.group, m.stage)} · {m.city}
          </span>
        </div>
        <div className="mt-4">
          <ScoreLine m={m} />
        </div>
        <div
          className="kx-slide mt-1 text-sm text-muted"
          style={{ transform: "skewX(-6deg)", animationDelay: ".1s" }}
        >
          {m.date} · {m.stadium}
          {m.penaltyShootout ? " · 승부차기" : ""}
        </div>
      </div>
    </div>
  );
}
