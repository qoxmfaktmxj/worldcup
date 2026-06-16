import { readFile } from "node:fs/promises";
import path from "node:path";
import type { FinalRankRow, GroupStanding, Match, Player, PlayerCardData, PlayerMeta, SearchDoc, TeamView, Tournament } from "./types";
import { buildFinalRanking, buildPlayers, buildSearchIndex, buildTeamView, getPlayer as pickPlayer, modePosition, teamSlugs } from "./aggregate";
import { availableYears } from "./tournaments";

const dir = (year: number) => path.join(process.cwd(), "data", "generated", String(year));

async function load<T>(year: number, file: string): Promise<T> {
  return JSON.parse(await readFile(path.join(dir(year), file), "utf8")) as T;
}

export const getTournament = (year: number) => load<Tournament>(year, "tournament.json");
export const getMatches = (year: number) => load<Match[]>(year, "matches.json");
export const getStandings = (year: number) => load<GroupStanding[]>(year, "standings.json");

export async function getMatch(year: number, slug: string): Promise<Match | undefined> {
  return (await getMatches(year)).find((m) => m.slug === slug);
}

export async function getTeamSlugs(year: number): Promise<string[]> {
  return teamSlugs(await getMatches(year));
}

export async function getTeamView(year: number, slug: string): Promise<TeamView | undefined> {
  const [matches, standings] = await Promise.all([getMatches(year), getStandings(year)]);
  return buildTeamView(matches, standings, slug);
}

export async function getPlayerSlugs(year: number): Promise<string[]> {
  return buildPlayers(await getMatches(year)).map((p) => p.slug);
}

export async function getPlayer(year: number, slug: string): Promise<Player | undefined> {
  return pickPlayer(await getMatches(year), slug);
}

export async function getSearchIndex(year: number): Promise<SearchDoc[]> {
  return buildSearchIndex(await getMatches(year), year);
}

// Search across every available tournament. Player docs are deduped by href
// (one player can appear in multiple World Cups but has a single global page).
export async function getSearchIndexAll(): Promise<SearchDoc[]> {
  const out: SearchDoc[] = [];
  const seenPlayer = new Set<string>();
  for (const y of [...availableYears()].reverse()) {
    for (const d of await getSearchIndex(y)) {
      if (d.type === "player") {
        if (seenPlayer.has(d.href)) continue;
        seenPlayer.add(d.href);
      }
      out.push(d);
    }
  }
  return out;
}

export async function getFinalRanking(year: number): Promise<FinalRankRow[]> {
  return buildFinalRanking(await getMatches(year));
}

export async function getPlayersMeta(year: number): Promise<Record<string, PlayerMeta>> {
  try {
    return JSON.parse(await readFile(path.join(dir(year), "players-meta.json"), "utf8")) as Record<string, PlayerMeta>;
  } catch {
    return {};
  }
}

export async function getPlayerCards(year: number): Promise<Record<string, PlayerCardData>> {
  const matches = await getMatches(year);
  const players = buildPlayers(matches);
  const meta = await getPlayersMeta(year);
  const out: Record<string, PlayerCardData> = {};
  for (const p of players) {
    const m = meta[p.id] ?? null;
    out[p.id] = {
      id: p.id,
      slug: p.slug,
      year,
      nameKo: m?.nameKo || p.nameKo,
      nameEn: m?.nameEn || p.nameEn,
      shirtNumber: p.shirtNumber,
      position: m?.position || p.position,
      teamNameKo: p.teamNameKo,
      stats: { matches: p.matches.length, starts: p.starts, subs: p.subs, goals: p.goals },
      meta: m,
    };
  }
  return out;
}

// Player pages live at /players/[slug] — global across tournaments. A player who
// appeared in several World Cups gets one page merging every appearance.
export async function getAllPlayerSlugs(): Promise<string[]> {
  const set = new Set<string>();
  for (const y of availableYears()) for (const p of buildPlayers(await getMatches(y))) set.add(p.slug);
  return [...set];
}

export async function getPlayerGlobal(slug: string): Promise<Player | undefined> {
  let merged: Player | undefined;
  for (const y of availableYears()) {
    const p = buildPlayers(await getMatches(y), y).find((x) => x.slug === slug);
    if (!p) continue;
    if (!merged) {
      merged = { ...p, matches: [...p.matches] };
    } else {
      merged.matches.push(...p.matches);
      merged.starts += p.starts;
      merged.subs += p.subs;
      merged.goals += p.goals;
      // Latest tournament wins for identity (name/team/shirt may change between cups).
      merged.nameKo = p.nameKo;
      merged.nameEn = p.nameEn;
      merged.teamId = p.teamId;
      merged.teamNameKo = p.teamNameKo;
      merged.teamSlug = p.teamSlug;
      merged.shirtNumber = p.shirtNumber;
      merged.position = p.position;
    }
  }
  if (merged) {
    merged.matches.sort((a, b) => a.date.localeCompare(b.date));
    merged.position = modePosition(merged.matches); // primary role across all cups
  }
  return merged;
}

// Best meta for a player across cups — newest first, preferring an entry with a photo.
export async function getPlayerMetaGlobal(id: string): Promise<PlayerMeta | null> {
  let best: PlayerMeta | null = null;
  for (const y of [...availableYears()].reverse()) {
    const meta = (await getPlayersMeta(y))[id];
    if (!meta) continue;
    if (meta.image) return meta;
    best ??= meta;
  }
  return best;
}
