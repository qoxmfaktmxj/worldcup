import type {
  FinalRankRow,
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
import { roundLabel } from "./stages";

export function teamSlug(t: TeamRef): string {
  return slugify(t.name);
}

export function groupSlug(group: string): string {
  return slugify(group);
}

export function playerSlug(nameEn: string, id: string): string {
  return `${slugify(nameEn)}-${id.replace(/^P-/, "")}`;
}

export function buildPlayers(matches: Match[], year = 0): Player[] {
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
          year,
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
        stage: m.stage,
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

const FINISH: Record<number, string> = {
  7: "우승",
  6: "준우승",
  5: "3위",
  4: "4위",
  3: "8강",
  2: "16강",
  1: "조별리그",
};

export function buildFinalRanking(matches: Match[]): FinalRankRow[] {
  type Agg = { team: TeamRef; played: number; wins: number; draws: number; losses: number; gf: number; ga: number; points: number };
  const agg = new Map<string, Agg>();
  const get = (t: TeamRef): Agg => {
    let a = agg.get(t.id);
    if (!a) {
      a = { team: t, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0 };
      agg.set(t.id, a);
    }
    return a;
  };
  // Per-match aggregate. Penalty-decided knockout games count as draws (FIFA convention).
  for (const m of matches) {
    const h = get(m.home);
    const a = get(m.away);
    h.played++; a.played++;
    h.gf += m.homeScore; h.ga += m.awayScore;
    a.gf += m.awayScore; a.ga += m.homeScore;
    if (m.homeScore > m.awayScore) { h.wins++; a.losses++; h.points += 3; }
    else if (m.homeScore < m.awayScore) { a.wins++; h.losses++; a.points += 3; }
    else { h.draws++; a.draws++; h.points++; a.points++; }
  }

  // Tier by round reached. `result` captures the advancing side (incl. penalties).
  const winnerOf = (m: Match) => (m.result === "win" ? m.home : m.away);
  const loserOf = (m: Match) => (m.result === "win" ? m.away : m.home);
  const tier = new Map<string, number>();
  const finalM = matches.find((m) => m.stage === "final");
  const thirdM = matches.find((m) => m.stage === "third-place match");
  if (finalM) { tier.set(winnerOf(finalM).id, 7); tier.set(loserOf(finalM).id, 6); }
  if (thirdM) { tier.set(winnerOf(thirdM).id, 5); tier.set(loserOf(thirdM).id, 4); }

  const stageRank: Record<string, number> = {
    final: 5, "semi-finals": 4, "quarter-finals": 3, "round of 16": 2,
  };
  const koByTeam = new Map<string, Match[]>();
  for (const m of matches) {
    if (m.groupStage) continue;
    for (const t of [m.home, m.away]) {
      const arr = koByTeam.get(t.id) ?? [];
      arr.push(m);
      koByTeam.set(t.id, arr);
    }
  }
  for (const [id] of agg) {
    if (tier.has(id)) continue;
    const ko = koByTeam.get(id);
    if (!ko?.length) { tier.set(id, 1); continue; }
    const deepest = ko.reduce((d, m) => ((stageRank[m.stage] ?? 0) > (stageRank[d.stage] ?? 0) ? m : d), ko[0]);
    tier.set(id, deepest.stage === "quarter-finals" ? 3 : 2);
  }

  const rows = [...agg.values()].map((a) => ({
    position: 0,
    team: a.team,
    played: a.played,
    wins: a.wins,
    draws: a.draws,
    losses: a.losses,
    gf: a.gf,
    ga: a.ga,
    gd: a.gf - a.ga,
    points: a.points,
    finish: FINISH[tier.get(a.team.id) ?? 1],
    _tier: tier.get(a.team.id) ?? 1,
  }));
  rows.sort((x, y) => y._tier - x._tier || y.points - x.points || y.gd - x.gd || y.gf - x.gf || x.team.nameKo.localeCompare(y.team.nameKo));
  return rows.map(({ _tier, ...r }, i) => ({ ...r, position: i + 1 }));
}

export function buildSearchIndex(matches: Match[], year: number): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const t of teamSlugs(matches)) {
    const team = findTeam(matches, t);
    if (team) docs.push({ type: "team", title: team.nameKo, subtitle: `${year} 국가`, href: `/world-cup/${year}/teams/${t}` });
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
      subtitle: `${year} · ${roundLabel(m.group, m.stage)} · ${m.date}`,
      href: `/world-cup/${year}/matches/${m.slug}`,
    });
  }
  return docs;
}
