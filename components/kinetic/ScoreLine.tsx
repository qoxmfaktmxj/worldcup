import type { Match } from "@/lib/types";

export function ScoreLine({ m }: { m: Match }) {
  return (
    <div className="kx-slide font-display text-3xl leading-tight" style={{ transform: "skewX(-6deg)" }}>
      {m.home.nameKo}{" "}
      <span className="text-korea text-5xl">{m.homeScore}</span>
      <span className="text-muted-dim"> : </span>
      <span className="text-muted-dim text-5xl">{m.awayScore}</span>{" "}
      {m.away.nameKo}
    </div>
  );
}
