import type { PlayerCardData } from "@/lib/types";
import { FallbackAvatar } from "./FallbackAvatar";
import { PlayerTrigger } from "./PlayerTrigger";

export function PlayerChip({ card, accent = "red" }: { card: PlayerCardData; accent?: "red" | "blue" }) {
  const border = accent === "blue" ? "border-[#2f6bff]" : "border-korea";
  return (
    <PlayerTrigger card={card}>
      <span className={`flex w-full items-center gap-3 border-l-[3px] ${border} bg-panel px-3 py-2 transition-colors hover:bg-panel/70`}>
        <FallbackAvatar name={card.nameKo} shirt={card.shirtNumber} size={34} accent={accent} />
        <span className="text-left">
          <span className="block text-sm font-medium">{card.nameKo}</span>
          <span className="block text-[11px] text-muted">{card.position}</span>
        </span>
      </span>
    </PlayerTrigger>
  );
}
