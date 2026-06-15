import Link from "next/link";
import type { Appearance } from "@/lib/types";
import { playerSlug } from "@/lib/aggregate";
import { fullName } from "@/lib/pipeline/names";
import { FallbackAvatar } from "./FallbackAvatar";

export function PlayerChip({ a }: { a: Appearance }) {
  return (
    <Link
      href={`/players/${playerSlug(fullName(a.givenName, a.familyName), a.playerId)}`}
      className="flex items-center gap-3 bg-panel border-l-[3px] border-korea px-3 py-2 hover:bg-panel/70 transition-colors"
    >
      <FallbackAvatar name={a.nameKo} shirt={a.shirtNumber} size={34} />
      <div>
        <div className="text-sm font-medium">{a.nameKo}</div>
        <div className="text-[11px] text-muted">{a.position}</div>
      </div>
    </Link>
  );
}
