import type { Match } from "@/lib/types";
import { TeamLabel } from "./TeamLabel";

export function ScoreLine({ m }: { m: Match }) {
  const draw = m.result === "draw";
  const hc = draw ? "text-white" : m.result === "win" ? "text-korea" : "text-muted-dim";
  const ac = draw ? "text-white" : m.result === "loss" ? "text-korea" : "text-muted-dim";
  return (
    <div className="kx-slide flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-3xl leading-tight" style={{ transform: "skewX(-6deg)" }}>
      <TeamLabel name={m.home.name} nameKo={m.home.nameKo} barClass="h-6 w-1.5" />
      <span>
        <span className={`text-5xl ${hc}`}>{m.homeScore}</span>
        {m.penaltyShootout && <span className="text-2xl text-muted">{` (${m.homePenalties})`}</span>}
        <span className="text-muted-dim"> : </span>
        {m.penaltyShootout && <span className="text-2xl text-muted">{`(${m.awayPenalties}) `}</span>}
        <span className={`text-5xl ${ac}`}>{m.awayScore}</span>
      </span>
      <TeamLabel name={m.away.name} nameKo={m.away.nameKo} barSide="right" barClass="h-6 w-1.5" />
    </div>
  );
}
