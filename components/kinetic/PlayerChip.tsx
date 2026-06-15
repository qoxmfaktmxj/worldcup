import type { Appearance } from "@/lib/types";
import { FallbackAvatar } from "./FallbackAvatar";

export function PlayerChip({ a }: { a: Appearance }) {
  return (
    <div className="flex items-center gap-3 bg-panel border-l-[3px] border-korea px-3 py-2">
      <FallbackAvatar name={a.nameKo} shirt={a.shirtNumber} size={34} />
      <div>
        <div className="text-sm font-medium">{a.nameKo}</div>
        <div className="text-[11px] text-muted">{a.position}</div>
      </div>
    </div>
  );
}
