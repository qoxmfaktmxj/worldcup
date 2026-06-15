import { readFile } from "node:fs/promises";
import path from "node:path";
import type { GroupStanding, Match, Player, SearchDoc, TeamView, Tournament } from "./types";
import { buildPlayers, buildSearchIndex, buildTeamView, getPlayer as pickPlayer, teamSlugs } from "./aggregate";

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
  return buildSearchIndex(await getMatches(year));
}
