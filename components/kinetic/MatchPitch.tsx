import type { Appearance } from "@/lib/types";
import { FallbackAvatar } from "./FallbackAvatar";

const BANDS: { key: string; codes: string[] }[] = [
  { key: "GK", codes: ["GK"] },
  { key: "DF", codes: ["RB", "RCB", "CB", "LCB", "LB", "RWB", "LWB"] },
  { key: "MF", codes: ["RM", "RCM", "CM", "LCM", "LM", "CDM", "CAM", "RDM", "LDM"] },
  { key: "FW", codes: ["RF", "RW", "CF", "ST", "SS", "LF", "LW"] },
];

function band(code: string): string {
  return BANDS.find((b) => b.codes.includes(code))?.key ?? "MF";
}

export function MatchPitch({ players, side }: { players: Appearance[]; side: "home" | "away" }) {
  const starters = players.filter((p) => p.starter);
  const rows = BANDS.map((b) => ({
    key: b.key,
    list: starters.filter((p) => band(p.positionCode) === b.key),
  }));
  const order = side === "home" ? rows : [...rows].reverse();
  return (
    <div className="relative bg-[#0a1f12] border border-line rounded-lg p-3 overflow-hidden">
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" aria-hidden />
      <div className="relative flex flex-col gap-3">
        {order.map((r) => (
          <div key={r.key} className="flex justify-center gap-3 flex-wrap">
            {r.list.map((p) => (
              <div key={p.playerId} className="flex flex-col items-center gap-1 w-14">
                <FallbackAvatar name={p.nameKo} shirt={p.shirtNumber} size={36} />
                <span className="text-[10px] text-center text-white/80 leading-tight">{p.nameKo}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
