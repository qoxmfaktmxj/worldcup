"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import type { PlayerCardData } from "@/lib/types";
import { PlayerModal } from "./PlayerModal";

export function PlayerTrigger({
  card,
  children,
  preview = true,
  className = "",
}: {
  card: PlayerCardData;
  children: React.ReactNode;
  preview?: boolean;
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enter = () => {
    timer.current = setTimeout(() => setHover(true), 180);
  };
  const leave = () => {
    if (timer.current) clearTimeout(timer.current);
    setHover(false);
  };

  return (
    <>
      <span
        className={`relative inline-flex cursor-pointer ${className}`}
        onMouseEnter={enter}
        onMouseLeave={leave}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen(true)}
        tabIndex={0}
        role="button"
        aria-haspopup="dialog"
      >
        {children}
        {preview && hover && (
          <span className="kx-pop pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-44 -translate-x-1/2 rounded-lg border border-[#2b2f3a] bg-panel p-2 text-left shadow-xl">
            <span className="flex items-center gap-2">
              {card.meta?.image?.url ? (
                <Image src={card.meta.image.url} alt="" width={34} height={34} unoptimized className="h-[34px] w-[34px] rounded object-cover" />
              ) : (
                <span className="font-display flex h-[34px] w-[34px] items-center justify-center rounded text-white" style={{ background: "linear-gradient(135deg,#e4002b,#7a0018)" }}>
                  {card.shirtNumber}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-white">{card.nameKo}</span>
                <span className="block truncate text-[11px] text-muted">{card.position}</span>
              </span>
            </span>
            <span className="mt-1 block text-[11px] text-muted">
              2002: 출전 {card.stats.matches} · 골 {card.stats.goals}
            </span>
          </span>
        )}
      </span>
      {open && <PlayerModal card={card} onClose={() => setOpen(false)} />}
    </>
  );
}
