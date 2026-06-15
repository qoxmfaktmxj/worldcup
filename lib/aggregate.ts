import type {
  GroupStanding,
  Match,
  Player,
  PlayerMatch,
  Result,
  SearchDoc,
  Standing,
  TeamMatchLine,
  TeamRef,
  TeamSquadEntry,
  TeamView,
} from "./types";
import { slugify } from "./pipeline/transform";
import { fullName } from "./pipeline/names";

export function teamSlug(t: TeamRef): string {
  return slugify(t.name);
}

export function groupSlug(group: string): string {
  return slugify(group);
}

export function playerSlug(nameEn: string, id: string): string {
  return `${slugify(nameEn)}-${id.replace(/^P-/, "")}`;
}

export function buildPlayers(matches: Match[]): Player[] {
  const map = new Map<string, Player>();
  for (const m of matches) {
    for (const side of ["home", "away"] as const) {
      const team = side === "home" ? m.home : m.away;
      const opponent = side === "home" ? m.away : m.home;
      for (const a of m.lineups[side]) {
        const goals = m.goals.filter((g) => g.playerId === a.playerId && !g.ownGoal).length;
        const pm: PlayerMatch = {
          matchId: m.id,
          slug: m.slug,
          group: m.group,
          stage: m.stage,
          date: m.date,
          teamId: team.id,
          opponentNameKo: opponent.nameKo,
          side,
          starter: a.starter,
          substitute: a.substitute,
          position: a.position,
          shirtNumber: a.shirtNumber,
          goals,
        };
        let p = map.get(a.playerId);
        if (!p) {
          p = {
            id: a.playerId,
            slug: playerSlug(fullName(a.givenName, a.familyName), a.playerId),
            nameKo: a.nameKo,
            nameEn: fullName(a.givenName, a.familyName),
            teamId: team.id,
            teamNameKo: team.nameKo,
            teamSlug: teamSlug(team),
            shirtNumber: a.shirtNumber,
            position: a.position,
            matches: [],
            starts: 0,
            subs: 0,
            goals: 0,
          };
          map.set(a.playerId, p);
        }
        p.matches.push(pm);
        if (a.starter) p.starts++;
        if (a.substitute) p.subs++;
        p.goals += goals;
      }
    }
  }
  return [...map.values()].sort((a, b) => b.goals - a.goals || b.starts - a.starts);
}

export function findTeam(matches: Match[], slug: string): TeamRef | undefined {
  for (const m of matches) for (const t of [m.home, m.away]) if (teamSlug(t) === slug) return t;
  return undefined;
}

export function teamSlugs(matches: Match[]): string[] {
  return [...new Set(matches.flatMap((m) => [teamSlug(m.home), teamSlug(m.away)]))];
}

export function buildTeamView(
  matches: Match[],
  standings: GroupStanding[],
  slug: string,
): TeamView | undefined {
  const team = findTeam(matches, slug);
  if (!team) return undefined;

  const squad: TeamSquadEntry[] = buildPlayers(matches)
    .filter((p) => p.teamId === team.id)
    .map((p) => ({
      playerId: p.id,
      slug: p.slug,
      nameKo: p.nameKo,
      shirtNumber: p.shirtNumber,
      position: p.position,
      starts: p.starts,
      subs: p.subs,
      goals: p.goals,
    }))
    .sort((a, b) => a.shirtNumber - b.shirtNumber);

  const lines: TeamMatchLine[] = matches
    .filter((m) => m.home.id === team.id || m.away.id === team.id)
    .map((m) => {
      const home = m.home.id === team.id;
      const gf = home ? m.homeScore : m.awayScore;
      const ga = home ? m.awayScore : m.homeScore;
      const result: Result = gf > ga ? "win" : gf < ga ? "loss" : "draw";
      return {
        slug: m.slug,
        date: m.date,
        group: m.group,
        opponentNameKo: (home ? m.away : m.home).nameKo,
        gf,
        ga,
        result,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  let standing: Standing | undefined;
  for (const g of standings) {
    const r = g.rows.find((row) => row.team.id === team.id);
    if (r) standing = r;
  }

  return { team, slug, standing, squad, matches: lines };
}

export function getPlayer(matches: Match[], slug: string): Player | undefined {
  return buildPlayers(matches).find((p) => p.slug === slug);
}

export function buildSearchIndex(matches: Match[]): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const t of teamSlugs(matches)) {
    const team = findTeam(matches, t);
    if (team) docs.push({ type: "team", title: team.nameKo, subtitle: "국가", href: `/world-cup/2002/teams/${t}` });
  }
  for (const p of buildPlayers(matches)) {
    docs.push({
      type: "player",
      title: p.nameKo,
      subtitle: `${p.teamNameKo} · ${p.position}`,
      href: `/players/${p.slug}`,
    });
  }
  for (const m of matches) {
    docs.push({
      type: "match",
      title: `${m.home.nameKo} ${m.homeScore}:${m.awayScore} ${m.away.nameKo}`,
      subtitle: `${m.group} · ${m.date}`,
      href: `/world-cup/2002/matches/${m.slug}`,
    });
  }
  return docs;
}
