import { readFileSync } from "node:fs";
import type { Match } from "../lib/types";
import { teamKo, teamPrimary } from "../lib/teamColors";

// Lists teams in a generated tournament that still need a Korean name and/or a
// kit color in lib/teamColors.ts. Run after `generate.ts <year>` when adding a
// new tournament, then add the listed countries before regenerating.
//   npx tsx scripts/missing-teams.ts 2010
const year = process.argv[2] ?? process.argv[1];
const matches: Match[] = JSON.parse(readFileSync(`data/generated/${year}/matches.json`, "utf8"));

const seen = new Map<string, string>(); // english name -> code
for (const m of matches) {
  seen.set(m.home.name, m.home.code);
  seen.set(m.away.name, m.away.code);
}

const DEFAULT_RED = "#e4002b"; // teamColors.ts DEFAULT.primary[0]
const rows: string[] = [];
for (const [name, code] of [...seen].sort()) {
  const ko = teamKo(name);
  const color = teamPrimary(name);
  const needsKo = !ko;
  const needsColor = color === DEFAULT_RED;
  if (needsKo || needsColor) {
    rows.push(`${name} [${code}] — ${needsKo ? "NO Korean name" : `ko=${ko}`}${needsColor ? " · NO kit color (using default red)" : ""}`);
  }
}

console.log(`=== ${year}: ${rows.length} team(s) need attention (of ${seen.size}) ===`);
console.log(rows.length ? rows.join("\n") : "all teams have Korean names and kit colors ✓");
