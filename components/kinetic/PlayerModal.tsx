"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PlayerCardData } from "@/lib/types";

export function PlayerModal({ card, onClose }: { card: PlayerCardData; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const m = card.meta;
  const stat = (n: number, label: string, accent?: boolean) => (
    <div className="rounded-[10px] border border-[#2b2f3a] bg-[#1b1f29] p-2 text-center transition-colors hover:border-korea">
      <div className={`font-display text-[22px] ${accent ? "text-[#ff4d6a]" : "text-white"}`}>{n}</div>
      <div className="text-[10px] text-muted">{label}</div>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={card.nameKo}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="kx-pop relative w-full max-w-[560px] overflow-hidden rounded-[18px] border border-[#2b2f3a] bg-ink"
      >
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-3 top-3 z-10 text-muted hover:text-white"
        >
          <i className="ti ti-x text-xl" aria-hidden="true" />
        </button>
        <div className="grid grid-cols-[150px_1fr]">
          <div
            className="relative flex min-h-[210px] items-end justify-center"
            style={{ background: "linear-gradient(160deg,#e4002b,#5c0014)" }}
          >
            <div className="font-display absolute left-3 top-2 text-[40px] text-white/35">{card.shirtNumber}</div>
            {m?.image?.url ? (
              <Image src={m.image.url} alt={card.nameKo} width={150} height={210} unoptimized className="h-[210px] w-[150px] object-cover" />
            ) : (
              <i className="ti ti-user mb-2 text-[96px] text-white/90" aria-hidden="true" />
            )}
          </div>
          <div className="p-[18px]">
            <span className="inline-block bg-korea px-2.5 py-0.5 text-[11px] tracking-wider text-white" style={{ transform: "skewX(-12deg)" }}>
              <span style={{ display: "inline-block", transform: "skewX(12deg)" }}>
                {card.teamNameKo} · {card.position}
              </span>
            </span>
            <div className="font-display mt-2 text-[28px] leading-tight text-white" style={{ transform: "skewX(-4deg)" }}>
              {card.nameKo}
            </div>
            <div className="mt-0.5 text-sm text-muted">
              {card.nameEn}
              {m?.nameKo && m.nameKo !== card.nameEn ? ` · ${card.nameKo}` : ""}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-[13px] text-[#e6e9ef]">
              {m?.birthDate && (
                <div>
                  <div className="text-[11px] text-[#9aa1b0]">생년월일</div>
                  {m.birthDate}
                </div>
              )}
              {m?.height && (
                <div>
                  <div className="text-[11px] text-[#9aa1b0]">키</div>
                  {m.height}cm
                </div>
              )}
              {m?.birthPlace && (
                <div>
                  <div className="text-[11px] text-[#9aa1b0]">출생</div>
                  {m.birthPlace}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-[18px] pt-3">
          <div className="mb-1.5 text-[11px] tracking-wider text-[#9aa1b0]">2002 월드컵</div>
          <div className="grid grid-cols-4 gap-2">
            {stat(card.stats.matches, "출전")}
            {stat(card.stats.starts, "선발")}
            {stat(card.stats.subs, "교체")}
            {stat(card.stats.goals, "골", true)}
          </div>
          {m?.clubs?.length ? (
            <>
              <div className="mb-1.5 mt-3.5 text-[11px] tracking-wider text-[#9aa1b0]">소속팀 이력</div>
              <div className="flex flex-col gap-1.5 text-[13px] text-[#e6e9ef]">
                {m.clubs.map((c, i) => (
                  <div key={i} className="flex justify-between border-l-2 border-[#4a4f5c] pl-2.5 first:border-korea">
                    <span>{c.name}</span>
                    <span className="text-muted">{[c.start, c.end].filter(Boolean).join("–")}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
          {m?.bio && (
            <p className="mt-3 border-t border-[#2b2f3a] pt-2.5 text-[12px] leading-relaxed text-[#c2c8d2]">{m.bio}</p>
          )}
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[9px] text-muted-dim">
              {m?.image ? `사진: ${m.image.author} · ${m.image.license}` : ""}
            </span>
            <Link
              href={`/players/${card.slug}`}
              onClick={onClose}
              className="font-display flex-shrink-0 bg-korea px-3.5 py-1.5 text-[12px] text-white"
              style={{ transform: "skewX(-6deg)" }}
            >
              <span style={{ display: "inline-block", transform: "skewX(6deg)" }}>전체 페이지 ↗</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
