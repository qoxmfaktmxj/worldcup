/**
 * 2026 FIFA World Cup is in progress (June 11 – July 19, 2026) and is NOT in the
 * Fjelstul database. This builds a live SNAPSHOT from public results (Wikipedia
 * per-group pages) — group standings + played match scores only.
 *
 * No lineups are fabricated: matches carry empty lineups (the source has no
 * verified XI), so match pages show the score/teams without a starting XI.
 * Re-run with refreshed SNAPSHOT data to update. asOf marks the snapshot date.
 */
import { mkdir, writeFile } from "node:fs/promises";
import type { GroupStanding, Match, Standing } from "../lib/types";
import { slugify, teamRef } from "../lib/pipeline/transform";

const ASOF = "2026-06-17";

type TeamStat = [name: string, code: string, p: number, w: number, d: number, l: number, gf: number, ga: number, pts: number];

// Current standings order per group (A–L). I–L have not kicked off yet (all zeros).
const GROUPS: Record<string, TeamStat[]> = {
  A: [["Mexico", "MEX", 1, 1, 0, 0, 2, 0, 3], ["South Korea", "KOR", 1, 1, 0, 0, 2, 1, 3], ["Czech Republic", "CZE", 1, 0, 0, 1, 1, 2, 0], ["South Africa", "RSA", 1, 0, 0, 1, 0, 2, 0]],
  B: [["Switzerland", "SUI", 1, 0, 1, 0, 1, 1, 1], ["Canada", "CAN", 1, 0, 1, 0, 1, 1, 1], ["Qatar", "QAT", 1, 0, 1, 0, 1, 1, 1], ["Bosnia and Herzegovina", "BIH", 1, 0, 1, 0, 1, 1, 1]],
  C: [["Scotland", "SCO", 1, 1, 0, 0, 1, 0, 3], ["Morocco", "MAR", 1, 0, 1, 0, 1, 1, 1], ["Brazil", "BRA", 1, 0, 1, 0, 1, 1, 1], ["Haiti", "HAI", 1, 0, 0, 1, 0, 1, 0]],
  D: [["United States", "USA", 1, 1, 0, 0, 4, 1, 3], ["Australia", "AUS", 1, 1, 0, 0, 2, 0, 3], ["Turkey", "TUR", 1, 0, 0, 1, 0, 2, 0], ["Paraguay", "PAR", 1, 0, 0, 1, 1, 4, 0]],
  E: [["Germany", "GER", 1, 1, 0, 0, 7, 1, 3], ["Ivory Coast", "CIV", 1, 1, 0, 0, 1, 0, 3], ["Ecuador", "ECU", 1, 0, 0, 1, 0, 1, 0], ["Curaçao", "CUW", 1, 0, 0, 1, 1, 7, 0]],
  F: [["Sweden", "SWE", 1, 1, 0, 0, 5, 1, 3], ["Japan", "JPN", 1, 0, 1, 0, 2, 2, 1], ["Netherlands", "NED", 1, 0, 1, 0, 2, 2, 1], ["Tunisia", "TUN", 1, 0, 0, 1, 1, 5, 0]],
  G: [["New Zealand", "NZL", 1, 0, 1, 0, 2, 2, 1], ["Iran", "IRN", 1, 0, 1, 0, 2, 2, 1], ["Belgium", "BEL", 1, 0, 1, 0, 1, 1, 1], ["Egypt", "EGY", 1, 0, 1, 0, 1, 1, 1]],
  H: [["Uruguay", "URU", 1, 0, 1, 0, 1, 1, 1], ["Saudi Arabia", "KSA", 1, 0, 1, 0, 1, 1, 1], ["Spain", "ESP", 1, 0, 1, 0, 0, 0, 1], ["Cape Verde", "CPV", 1, 0, 1, 0, 0, 0, 1]],
  I: [["France", "FRA", 0, 0, 0, 0, 0, 0, 0], ["Senegal", "SEN", 0, 0, 0, 0, 0, 0, 0], ["Iraq", "IRQ", 0, 0, 0, 0, 0, 0, 0], ["Norway", "NOR", 0, 0, 0, 0, 0, 0, 0]],
  J: [["Argentina", "ARG", 0, 0, 0, 0, 0, 0, 0], ["Algeria", "ALG", 0, 0, 0, 0, 0, 0, 0], ["Austria", "AUT", 0, 0, 0, 0, 0, 0, 0], ["Jordan", "JOR", 0, 0, 0, 0, 0, 0, 0]],
  K: [["Portugal", "POR", 0, 0, 0, 0, 0, 0, 0], ["DR Congo", "COD", 0, 0, 0, 0, 0, 0, 0], ["Uzbekistan", "UZB", 0, 0, 0, 0, 0, 0, 0], ["Colombia", "COL", 0, 0, 0, 0, 0, 0, 0]],
  L: [["England", "ENG", 0, 0, 0, 0, 0, 0, 0], ["Croatia", "CRO", 0, 0, 0, 0, 0, 0, 0], ["Ghana", "GHA", 0, 0, 0, 0, 0, 0, 0], ["Panama", "PAN", 0, 0, 0, 0, 0, 0, 0]],
};

type Played = [date: string, group: string, home: string, hs: number, away: string, as: number];

// Completed matches as of ASOF (group stage round 1; I–L not started).
const RESULTS: Played[] = [
  ["2026-06-11", "A", "Mexico", 2, "South Africa", 0],
  ["2026-06-11", "A", "South Korea", 2, "Czech Republic", 1],
  ["2026-06-12", "B", "Canada", 1, "Bosnia and Herzegovina", 1],
  ["2026-06-13", "B", "Qatar", 1, "Switzerland", 1],
  ["2026-06-13", "C", "Brazil", 1, "Morocco", 1],
  ["2026-06-13", "C", "Haiti", 0, "Scotland", 1],
  ["2026-06-12", "D", "United States", 4, "Paraguay", 1],
  ["2026-06-13", "D", "Australia", 2, "Turkey", 0],
  ["2026-06-14", "E", "Germany", 7, "Curaçao", 1],
  ["2026-06-14", "E", "Ivory Coast", 1, "Ecuador", 0],
  ["2026-06-14", "F", "Netherlands", 2, "Japan", 2],
  ["2026-06-14", "F", "Sweden", 5, "Tunisia", 1],
  ["2026-06-15", "G", "Belgium", 1, "Egypt", 1],
  ["2026-06-15", "G", "Iran", 2, "New Zealand", 2],
  ["2026-06-15", "H", "Spain", 0, "Cape Verde", 0],
  ["2026-06-15", "H", "Saudi Arabia", 1, "Uruguay", 1],
];

const codeOf: Record<string, string> = {};
for (const stats of Object.values(GROUPS)) for (const [name, code] of stats) codeOf[name] = code;
const ref = (name: string) => teamRef(`T-${codeOf[name]}`, name, codeOf[name], {});

const standings: GroupStanding[] = Object.entries(GROUPS).map(([letter, stats]) => ({
  group: `Group ${letter}`,
  rows: stats.map(([name, code, p, w, d, l, gf, ga, pts], i): Standing => ({
    position: i + 1,
    team: ref(name),
    played: p,
    wins: w,
    draws: d,
    losses: l,
    gf,
    ga,
    gd: gf - ga,
    points: pts,
    advanced: false, // group stage in progress
  })),
}));

const matches: Match[] = RESULTS.map(([date, group, home, hs, away, as], i) => ({
  id: `M-2026-${String(i + 1).padStart(2, "0")}`,
  slug: slugify(`${home} vs ${away}`),
  status: "finished" as const,
  date,
  time: "",
  stadium: "",
  city: "",
  group: `Group ${group}`,
  stage: "group stage",
  groupStage: true,
  home: ref(home),
  away: ref(away),
  homeScore: hs,
  awayScore: as,
  penaltyShootout: false,
  homePenalties: 0,
  awayPenalties: 0,
  result: hs > as ? "win" : hs < as ? "loss" : "draw",
  lineups: { home: [], away: [] }, // no verified XI for a live tournament — not fabricated
  goals: [],
  bookings: [],
  subs: [],
  shootout: [],
}));

async function main() {
  await mkdir("data/generated/2026", { recursive: true });
  await writeFile(
    "data/generated/2026/tournament.json",
    JSON.stringify({ year: 2026, id: "WC-2026", name: "2026 FIFA 월드컵", host: "미국·캐나다·멕시코", asOf: ASOF }, null, 2),
  );
  await writeFile("data/generated/2026/matches.json", JSON.stringify(matches, null, 2));
  await writeFile("data/generated/2026/standings.json", JSON.stringify(standings, null, 2));
  console.log(`2026 snapshot (${ASOF}): ${matches.length} played matches, ${standings.length} groups, ${Object.keys(codeOf).length} teams`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
