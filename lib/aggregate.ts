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
import { broadRole } from "./positions";
import { toKstLabel } from "./time";

export function teamSlug(t: TeamRef): string {
  return slugify(t.name);
}

export function groupSlug(group: string): string {
  return slugify(group);
}

export function playerSlug(nameEn: string, id: string): string {
  return `${slugify(nameEn)}-${id.replace(/^P-/, "")}`;
}

// Fjelstul records a position per match; players vary game to game (e.g. Park
// Ji-sung was right forward 6 of 10 WC games, center mid twice). The headline
// is the single most-played fine position. When that's a tie (e.g. one game
// each at RF/LF/RW), generalize to the most-played broad role (공격수 등) so
// the label stays meaningful instead of an arbitrary pick.
export function modePosition(matches: { position: string }[]): string {
  if (!matches.length) return "";
  const count = new Map<string, number>();
  for (const m of matches) count.set(m.position, (count.get(m.position) ?? 0) + 1);
  const maxN = Math.max(...count.values());
  const top = [...count].filter(([, n]) => n === maxN).map(([p]) => p);
  if (top.length === 1) return top[0];

  const broad = new Map<string, number>();
  for (const m of matches) {
    const b = broadRole(m.position);
    broad.set(b, (broad.get(b) ?? 0) + 1);
  }
  let best = broadRole(matches[0].position);
  let bestN = 0;
  for (const [b, n] of broad) {
    if (n > bestN) {
      best = b;
      bestN = n;
    }
  }
  return best;
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
          opponentName: opponent.name,
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
  for (const p of map.values()) p.position = modePosition(p.matches);
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
    .map((m): TeamMatchLine => {
      const home = m.home.id === team.id;
      const base = {
        slug: m.slug,
        date: m.date,
        group: m.group,
        stage: m.stage,
        opponentName: (home ? m.away : m.home).name,
        opponentNameKo: (home ? m.away : m.home).nameKo,
        status: m.status,
      };
      // Scheduled matches carry placeholder 0:0 — never treat that as a result.
      if (m.status === "scheduled") {
        return { ...base, gf: null, ga: null, result: null };
      }
      const gf = home ? m.homeScore : m.awayScore;
      const ga = home ? m.awayScore : m.homeScore;
      const result: Result = gf > ga ? "win" : gf < ga ? "loss" : "draw";
      return { ...base, gf, ga, result };
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

// Non-contiguous tiers leave room for both 64-team (2002~2022) and 48-team
// (2026, knockout from a round of 32) formats. "4강" only appears while a
// third-place match is missing (mid-tournament) — complete archives resolve
// SF losers to 3위/4위 via the third-place match.
const FINISH: Record<number, string> = {
  10: "우승",
  9: "준우승",
  8: "3위",
  7: "4위",
  6: "4강",
  5: "8강",
  4: "16강",
  3: "32강",
  1: "조별리그",
};

// Deepest knockout stage reached → tier (for teams not resolved by the final
// or third-place match).
const STAGE_TIER: Record<string, number> = {
  "semi-finals": 6,
  "quarter-finals": 5,
  "round of 16": 4,
  "round of 32": 3,
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
  // Scheduled matches carry placeholder 0:0 — never count them.
  for (const m of matches) {
    if (m.status !== "finished") continue;
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
  if (finalM) { tier.set(winnerOf(finalM).id, 10); tier.set(loserOf(finalM).id, 9); }
  if (thirdM) { tier.set(winnerOf(thirdM).id, 8); tier.set(loserOf(thirdM).id, 7); }

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
    const deepest = ko.reduce((d, m) => ((STAGE_TIER[m.stage] ?? 0) > (STAGE_TIER[d.stage] ?? 0) ? m : d), ko[0]);
    tier.set(id, STAGE_TIER[deepest.stage] ?? 1);
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
    const title =
      m.status === "finished"
        ? `${m.home.nameKo} ${m.homeScore}:${m.awayScore} ${m.away.nameKo}`
        : `${m.home.nameKo} vs ${m.away.nameKo}`;
    const when = m.status === "scheduled" && m.kickoffUtc ? toKstLabel(m.kickoffUtc) : m.date;
    const tag = m.status === "scheduled" ? " · 예정" : "";
    docs.push({
      type: "match",
      title,
      subtitle: `${year} · ${roundLabel(m.group, m.stage)}${tag} · ${when}`,
      href: `/world-cup/${year}/matches/${m.slug}`,
    });
  }
  return docs;
}
