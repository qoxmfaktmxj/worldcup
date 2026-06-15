import type { Appearance, PlayerCardData } from "@/lib/types";
import { FallbackAvatar } from "./FallbackAvatar";
import { PlayerTrigger } from "./PlayerTrigger";

const BANDS: { key: string; codes: string[] }[] = [
  { key: "GK", codes: ["GK"] },
  { key: "DF", codes: ["RB", "RCB", "CB", "LCB", "LB", "RWB", "LWB"] },
  { key: "MF", codes: ["RM", "RCM", "CM", "LCM", "LM", "CDM", "CAM", "RDM", "LDM"] },
  { key: "FW", codes: ["RF", "RW", "CF", "ST", "SS", "LF", "LW"] },
];

function band(code: string): string {
  return BANDS.find((b) => b.codes.includes(code))?.key ?? "MF";
}

export function MatchPitch({
  players,
  side,
  accent,
  cards,
}: {
  players: Appearance[];
  side: "home" | "away";
  accent: "red" | "blue";
  cards: Record<string, PlayerCardData>;
}) {
  const starters = players.filter((p) => p.starter);
  const rows = BANDS
    .map((b) => ({ key: b.key, list: starters.filter((p) => band(p.positionCode) === b.key) }))
    .filter((r) => r.list.length > 0);
  const order = side === "home" ? rows : [...rows].reverse();
  return (
    <div className="relative flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-lg border border-line bg-[#0a1f12] p-3">
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" aria-hidden />
      <div className="relative flex flex-1 flex-col justify-between gap-3">
        {order.map((r) => (
          <div key={r.key} className="flex flex-wrap justify-center gap-3">
            {r.list.map((p) => {
              const card = cards[p.playerId];
              const label = card?.nameKo ?? p.nameKo;
              const badge = <FallbackAvatar name={label} shirt={p.shirtNumber} size={36} accent={accent} />;
              return (
                <div key={p.playerId} className="flex w-14 flex-col items-center">
                  {card ? (
                    <PlayerTrigger card={card}>
                      <span className="flex flex-col items-center gap-1 transition-opacity hover:opacity-80">
                        {badge}
                        <span className="text-center text-[10px] leading-tight text-white/80">{label}</span>
                      </span>
                    </PlayerTrigger>
                  ) : (
                    <span className="flex flex-col items-center gap-1">
                      {badge}
                      <span className="text-center text-[10px] leading-tight text-white/80">{label}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
