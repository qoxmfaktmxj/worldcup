import Image from "next/image";
import type { PlayerCardData } from "@/lib/types";
import { FallbackAvatar } from "./FallbackAvatar";

export function PlayerAvatar({ card, size = 40 }: { card: PlayerCardData; size?: number }) {
  if (card.meta?.image?.url) {
    return (
      <Image
        src={card.meta.image.url}
        alt={card.nameKo}
        width={size}
        height={size}
        unoptimized
        className="rounded-md object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return <FallbackAvatar name={card.nameKo} shirt={card.shirtNumber} size={size} />;
}
