import type { Venue } from "@/lib/types";

const COUNTRY_ACCENT: Record<string, { border: string; chip: string; label: string }> = {
  "United States": { border: "border-[#3C3B6E]", chip: "bg-[#3C3B6E]/20 text-[#8888ff]", label: "USA" },
  "Canada": { border: "border-[#D80621]", chip: "bg-[#D80621]/20 text-[#ff6b7a]", label: "CAN" },
  "Mexico": { border: "border-[#006847]", chip: "bg-[#006847]/20 text-[#4cd98e]", label: "MEX" },
};

export function VenueCard({
  venue,
  matchCount,
  tzOffsetLabel,
}: {
  venue: Venue;
  matchCount: number;
  tzOffsetLabel: string;
}) {
  const accent = COUNTRY_ACCENT[venue.country];

  return (
    <div
      className={`relative rounded-xl border bg-ink p-5 flex flex-col gap-3 transition-colors hover:bg-panel/40 ${
        accent ? accent.border : "border-line"
      }`}
    >
      {/* 국가 chip */}
      {accent && (
        <span
          className={`absolute top-4 right-4 rounded px-2 py-0.5 text-xs font-medium tracking-wider ${accent.chip}`}
        >
          {accent.label}
        </span>
      )}

      {/* FIFA 대회 명칭 */}
      <div>
        <p className="font-display text-lg leading-tight text-white pr-10">
          {venue.fifaName}
        </p>
        {venue.commonName && (
          <p className="mt-0.5 text-sm text-muted">
            실제: {venue.commonName}
          </p>
        )}
      </div>

      {/* 도시 · 국가 */}
      <p className="text-sm text-white/80">
        {venue.city} · {venue.country}
      </p>

      {/* 구분선 */}
      <div className="border-t border-line" />

      {/* 시간대 + 시차 */}
      <div className="flex flex-col gap-1 text-xs text-muted">
        <span>{venue.timezone}</span>
        <span className="text-korea/90">{tzOffsetLabel}</span>
      </div>

      {/* 경기 수 */}
      <div
        className="inline-block bg-korea/10 px-2 py-1 text-sm font-medium text-korea rounded self-start"
      >
        {matchCount}경기
      </div>
    </div>
  );
}
