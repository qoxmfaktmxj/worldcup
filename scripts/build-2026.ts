/**
 * 2026 FIFA World Cup — builds from the full 72-fixture group stage in
 * fixtures-2026.ts. Scheduled matches carry no score; finished matches have
 * real scores. Standings are recomputed from finished fixtures only.
 *
 * No lineups are fabricated: matches carry empty lineups (no verified XI for a
 * live tournament). Re-run with refreshed fixtures-2026.ts to update.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { GroupStanding, Match, Standing, Venue } from "../lib/types";
import { slugify, teamRef } from "../lib/pipeline/transform";
import { kstDateKey } from "../lib/time";
import { CODES_2026, FIXTURES_2026, KNOCKOUT_2026, VENUES_2026 } from "./fixtures-2026";
import { DETAILS_2026, type MatchDetail } from "./match-details-2026";

// Generated per-match detail (lineups/goals/subs/cards) collected from official
// sources, one JSON per slug. Hand-curated DETAILS_2026 takes precedence.
const GEN_DIR = join("scripts", "gen-details-2026");
const genDetails: Record<string, MatchDetail> = {};
if (existsSync(GEN_DIR)) {
  for (const f of readdirSync(GEN_DIR)) {
    if (!f.endsWith(".json")) continue;
    const slug = f.replace(/\.json$/, "");
    try {
      genDetails[slug] = JSON.parse(readFileSync(join(GEN_DIR, f), "utf8")) as MatchDetail;
    } catch {
      console.warn(`skip malformed detail: ${f}`);
    }
  }
}
const detailFor = (slug: string): MatchDetail | undefined => DETAILS_2026[slug] ?? genDetails[slug];

const ASOF = "2026-07-03";

const ref = (name: string) => teamRef(`T-${CODES_2026[name]}`, name, CODES_2026[name], {});

// Build matches from fixtures
const matches: Match[] = FIXTURES_2026.map((tuple, i) => {
  const [g, kickoffUtc, home, away, homeScore, awayScore, venueId] = tuple;
  const finished = homeScore !== null && awayScore !== null;
  const hs = finished ? (homeScore as number) : 0;
  const as = finished ? (awayScore as number) : 0;
  const result = finished ? (hs > as ? "win" : hs < as ? "loss" : "draw") : "draw";
  const venue: Venue | undefined = VENUES_2026.find((v) => v.id === venueId);
  const slug = slugify(`${home} vs ${away}`);
  // Verified per-match detail (lineups/goals/subs/cards), if collected. Matches
  // without an entry keep empty detail — a score-only snapshot, nothing fabricated.
  const detail = detailFor(slug);

  return {
    id: `M-2026-${String(i + 1).padStart(2, "0")}`,
    slug,
    status: finished ? ("finished" as const) : ("scheduled" as const),
    date: kstDateKey(kickoffUtc),
    time: "",
    kickoffUtc,
    venueId,
    stadium: venue?.commonName ?? venue?.fifaName ?? "",
    city: venue?.city ?? "",
    country: venue?.country ?? "",
    group: `Group ${g}`,
    stage: "group stage",
    groupStage: true,
    home: ref(home),
    away: ref(away),
    homeScore: hs,
    awayScore: as,
    penaltyShootout: false,
    homePenalties: 0,
    awayPenalties: 0,
    result,
    lineups: detail?.lineups ?? { home: [], away: [] }, // empty unless verified detail collected
    goals: detail?.goals ?? [],
    bookings: detail?.bookings ?? [],
    subs: detail?.subs ?? [],
    shootout: [],
  } satisfies Match;
});

// Knockout matches (group_name = not applicable so the UI shows the round).
// A penalty shootout keeps the regulation score; result reflects who advances.
const knockout: Match[] = KNOCKOUT_2026.map((k, i) => {
  const finished = k.homeScore !== null && k.awayScore !== null;
  const hs = finished ? (k.homeScore as number) : 0;
  const as = finished ? (k.awayScore as number) : 0;
  const pens = k.homePens !== undefined && k.awayPens !== undefined;
  // Advancing side: penalties decide a level regulation score.
  const homeAdv = pens ? (k.homePens as number) > (k.awayPens as number) : hs > as;
  const result = finished ? (hs === as && pens ? (homeAdv ? "win" : "loss") : hs > as ? "win" : hs < as ? "loss" : "draw") : "draw";
  const venue: Venue | undefined = VENUES_2026.find((v) => v.id === k.venueId);
  const slug = slugify(`${k.home} vs ${k.away}`);
  const detail = detailFor(slug);

  return {
    id: `M-2026-K${String(i + 1).padStart(2, "0")}`,
    slug,
    status: finished ? ("finished" as const) : ("scheduled" as const),
    date: kstDateKey(k.kickoffUtc),
    time: "",
    kickoffUtc: k.kickoffUtc,
    venueId: k.venueId,
    stadium: venue?.commonName ?? venue?.fifaName ?? "",
    city: venue?.city ?? "",
    country: venue?.country ?? "",
    group: "not applicable",
    stage: k.stage,
    groupStage: false,
    home: ref(k.home),
    away: ref(k.away),
    homeScore: hs,
    awayScore: as,
    penaltyShootout: pens,
    homePenalties: pens ? (k.homePens as number) : 0,
    awayPenalties: pens ? (k.awayPens as number) : 0,
    result,
    lineups: detail?.lineups ?? { home: [], away: [] },
    goals: detail?.goals ?? [],
    bookings: detail?.bookings ?? [],
    subs: detail?.subs ?? [],
    shootout: [],
  } satisfies Match;
});

matches.push(...knockout);

// Recompute standings from FINISHED fixtures only
const groupTeams = new Map<string, Set<string>>();
for (const [g, , home, away] of FIXTURES_2026) {
  const grp = `Group ${g}`;
  if (!groupTeams.has(grp)) groupTeams.set(grp, new Set());
  groupTeams.get(grp)!.add(home);
  groupTeams.get(grp)!.add(away);
}

type StatRow = { w: number; d: number; l: number; gf: number; ga: number };
const teamStats = new Map<string, StatRow>();
for (const [, teamName] of [...groupTeams.values()].flatMap((s) => [...s].map((n) => [n, n]))) {
  teamStats.set(teamName as string, { w: 0, d: 0, l: 0, gf: 0, ga: 0 });
}

for (const m of matches.filter((m) => m.status === "finished" && m.groupStage)) {
  const hName = m.home.name;
  const aName = m.away.name;
  const hs = m.homeScore;
  const as = m.awayScore;

  const hStat = teamStats.get(hName) ?? { w: 0, d: 0, l: 0, gf: 0, ga: 0 };
  const aStat = teamStats.get(aName) ?? { w: 0, d: 0, l: 0, gf: 0, ga: 0 };

  hStat.gf += hs;
  hStat.ga += as;
  aStat.gf += as;
  aStat.ga += hs;

  if (hs > as) {
    hStat.w++;
    aStat.l++;
  } else if (hs < as) {
    hStat.l++;
    aStat.w++;
  } else {
    hStat.d++;
    aStat.d++;
  }

  teamStats.set(hName, hStat);
  teamStats.set(aName, aStat);
}

const standings: GroupStanding[] = [...groupTeams.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([grp, teams]) => {
    const rows: Standing[] = [...teams].map((name) => {
      const s = teamStats.get(name) ?? { w: 0, d: 0, l: 0, gf: 0, ga: 0 };
      const played = s.w + s.d + s.l;
      const points = s.w * 3 + s.d;
      const gd = s.gf - s.ga;
      return {
        position: 0, // will be set after sort
        team: ref(name),
        played,
        wins: s.w,
        draws: s.d,
        losses: s.l,
        gf: s.gf,
        ga: s.ga,
        gd,
        points,
        advanced: false, // group stage in progress
      };
    });

    // Sort: points desc, gd desc, gf desc
    rows.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
    rows.forEach((r, i) => {
      r.position = i + 1;
    });

    return { group: grp, rows };
  });

async function main() {
  await mkdir("data/generated/2026", { recursive: true });

  await writeFile(
    "data/generated/2026/tournament.json",
    JSON.stringify({ year: 2026, id: "WC-2026", name: "2026 FIFA 월드컵", host: "미국·캐나다·멕시코", asOf: ASOF }, null, 2),
  );
  await writeFile("data/generated/2026/matches.json", JSON.stringify(matches, null, 2));
  await writeFile("data/generated/2026/standings.json", JSON.stringify(standings, null, 2));
  await writeFile("data/generated/2026/venues.json", JSON.stringify(VENUES_2026, null, 2));

  const finished = matches.filter((m) => m.status === "finished").length;
  const groupCount = standings.length;
  const venueCount = VENUES_2026.length;

  console.log(`2026 snapshot (${ASOF}): ${matches.length} matches, ${finished} finished, ${groupCount} groups, ${venueCount} venues`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
