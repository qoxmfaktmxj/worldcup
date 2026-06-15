import type { Match } from "@/lib/types";

export function ScoreLine({ m }: { m: Match }) {
  const draw = m.result === "draw";
  const hc = draw ? "text-white" : m.result === "win" ? "text-korea" : "text-muted-dim";
  const ac = draw ? "text-white" : m.result === "loss" ? "text-korea" : "text-muted-dim";
  return (
    <div className="kx-slide font-display text-3xl leading-tight" style={{ transform: "skewX(-6deg)" }}>
      {m.home.nameKo}{" "}
      <span className={`text-5xl ${hc}`}>{m.homeScore}</span>
      {m.penaltyShootout && <span className="text-2xl text-muted">{` (${m.homePenalties})`}</span>}
      <span className="text-muted-dim"> : </span>
      {m.penaltyShootout && <span className="text-2xl text-muted">{`(${m.awayPenalties}) `}</span>}
      <span className={`text-5xl ${ac}`}>{m.awayScore}</span>{" "}
      {m.away.nameKo}
    </div>
  );
}
