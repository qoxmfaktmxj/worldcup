import type { PlayerCardData } from "@/lib/types";
import { PlayerAvatar } from "./PlayerAvatar";
import { PlayerTrigger } from "./PlayerTrigger";

export function PlayerChip({ card }: { card: PlayerCardData }) {
  return (
    <PlayerTrigger card={card}>
      <span className="flex w-full items-center gap-3 bg-panel border-l-[3px] border-korea px-3 py-2 hover:bg-panel/70 transition-colors">
        <PlayerAvatar card={card} size={34} />
        <span className="text-left">
          <span className="block text-sm font-medium">{card.nameKo}</span>
          <span className="block text-[11px] text-muted">{card.position}</span>
        </span>
      </span>
    </PlayerTrigger>
  );
}
