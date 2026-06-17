import { getVenues, getMatches } from "@/lib/data";
import { Nav } from "@/components/kinetic/Nav";
import { VenueCard } from "@/components/kinetic/VenueCard";

export const dynamic = "force-static";

/**
 * Parse a shortOffset string like "GMT+9" or "GMT-7" into a numeric hour offset.
 */
function parseTzOffset(tz: string): number {
  const ref = new Date("2026-06-20T12:00:00Z");
  const fmt = new Intl.DateTimeFormat("en", {
    timeZone: tz,
    timeZoneName: "shortOffset",
  });
  const parts = fmt.formatToParts(ref);
  const off = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  const m = off.match(/GMT([+-]\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function tzOffsetLabel(venueTimezone: string): string {
  const seoulOffset = parseTzOffset("Asia/Seoul"); // +9
  const venueOffset = parseTzOffset(venueTimezone);
  const diff = seoulOffset - venueOffset; // positive → KST is ahead
  return `한국보다 ${diff}시간 느림`;
}

const COUNTRY_ORDER: Record<string, number> = {
  Mexico: 0,
  "United States": 1,
  Canada: 2,
};

export default async function Venues2026Page() {
  const [venues, matches] = await Promise.all([
    getVenues(2026),
    getMatches(2026),
  ]);

  // count matches per venue
  const countByVenue = new Map<string, number>();
  for (const m of matches) {
    if (m.venueId) {
      countByVenue.set(m.venueId, (countByVenue.get(m.venueId) ?? 0) + 1);
    }
  }

  // sort: Mexico → USA → Canada, then by city
  const sorted = [...venues].sort((a, b) => {
    const ca = COUNTRY_ORDER[a.country] ?? 9;
    const cb = COUNTRY_ORDER[b.country] ?? 9;
    if (ca !== cb) return ca - cb;
    return a.city.localeCompare(b.city);
  });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Nav />
      {/* Header */}
      <div className="flex items-start flex-wrap gap-3 mb-2 mt-6">
        <div>
          <h1
            className="font-display text-4xl text-korea"
            style={{ transform: "skewX(-6deg)" }}
          >
            2026 경기장 · {venues.length}개 도시
          </h1>
          <p className="text-muted text-sm mt-1">
            FIFA 대회 명칭 / 실제 경기장명
          </p>
        </div>
      </div>

      {/* Venue grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            matchCount={countByVenue.get(venue.id) ?? 0}
            tzOffsetLabel={tzOffsetLabel(venue.timezone)}
          />
        ))}
      </div>
    </main>
  );
}
