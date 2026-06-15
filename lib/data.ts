import { readFile } from "node:fs/promises";
import path from "node:path";
import type { GroupStanding, Match, Tournament } from "./types";

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
