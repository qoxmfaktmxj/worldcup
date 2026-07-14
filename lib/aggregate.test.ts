import { describe, it, expect } from "vitest";
import { teamSlug, groupSlug, playerSlug, buildPlayers, buildTeamView, buildSearchIndex, buildFinalRanking } from "./aggregate";
import type { Match } from "./types";

const team = (id: string, name: string, code: string) => ({ id, name, nameKo: name, code });
const appe = (pid: string, given: string, family: string, starter: boolean) => ({
  playerId: pid,
  familyName: family,
  givenName: given,
  nameKo: `${given} ${family}`,
  shirtNumber: 10,
  position: "center forward",
  positionCode: "CF",
  starter,
  substitute: !starter,
});

const m: Match = {
  id: "M-1",
  slug: "a-vs-b",
  status: "finished",
  date: "2002-06-04",
  time: "20:30",
  stadium: "X",
  city: "Y",
  group: "Group D",
  stage: "group stage",
  groupStage: true,
  home: team("T-71", "South Korea", "KOR"),
  away: team("T-57", "Poland", "POL"),
  homeScore: 2,
  awayScore: 0,
  penaltyShootout: false,
  homePenalties: 0,
  awayPenalties: 0,
  result: "win",
  lineups: {
    home: [appe("P-1", "Ji-sung", "Park", true)],
    away: [appe("P-2", "Jerzy", "Dudek", true)],
  },
  goals: [{ minute: 26, playerId: "P-1", nameKo: "Ji-sung Park", teamId: "T-71", ownGoal: false, penalty: false }],
  bookings: [],
  subs: [],
  shootout: [],
};

describe("slugs", () => {
  it("team slug", () => expect(teamSlug(m.home)).toBe("south-korea"));
  it("group slug", () => expect(groupSlug("Group D")).toBe("group-d"));
  it("player slug includes id tail", () => expect(playerSlug("Ji-sung Park", "P-1")).toBe("ji-sung-park-1"));
});

describe("buildPlayers", () => {
  const players = buildPlayers([m]);
  it("aggregates a player with a goal and a start", () => {
    const park = players.find((p) => p.id === "P-1")!;
    expect(park.starts).toBe(1);
    expect(park.goals).toBe(1);
    expect(park.teamSlug).toBe("south-korea");
    expect(park.matches[0].opponentNameKo).toBe("Poland");
  });
});

// A 2026-style scheduled match: stored with placeholder 0:0 / "draw" that must
// NOT surface as a real result anywhere.
const scheduled: Match = {
  ...m,
  id: "M-2",
  slug: "south-korea-vs-mexico",
  status: "scheduled",
  date: "2026-06-12",
  away: team("T-99", "Mexico", "MEX"),
  homeScore: 0,
  awayScore: 0,
  result: "draw",
  goals: [],
  lineups: { home: [], away: [] },
  kickoffUtc: "2026-06-11T19:00:00Z",
};

describe("buildTeamView — scheduled match", () => {
  const view = buildTeamView([scheduled], [], "south-korea")!;
  const line = view.matches[0];
  it("does not compute a result for a scheduled match", () => {
    expect(line.status).toBe("scheduled");
    expect(line.result).toBeNull();
    expect(line.gf).toBeNull();
    expect(line.ga).toBeNull();
  });
});

describe("buildTeamView — finished match", () => {
  const view = buildTeamView([m], [], "south-korea")!;
  const line = view.matches[0];
  it("keeps real score and result", () => {
    expect(line.status).toBe("finished");
    expect(line.result).toBe("win");
    expect(line.gf).toBe(2);
    expect(line.ga).toBe(0);
  });
});

describe("buildSearchIndex — scheduled match", () => {
  const docs = buildSearchIndex([scheduled], 2026);
  const matchDoc = docs.find((d) => d.type === "match")!;
  it("uses 'vs' not a 0:0 scoreline", () => {
    expect(matchDoc.title).toBe("South Korea vs Mexico");
    expect(matchDoc.title).not.toContain("0:0");
  });
  it("tags the subtitle as 예정", () => {
    expect(matchDoc.subtitle).toContain("예정");
  });
});

describe("buildSearchIndex — finished match", () => {
  const docs = buildSearchIndex([m], 2002);
  const matchDoc = docs.find((d) => d.type === "match")!;
  it("keeps the scoreline", () => {
    expect(matchDoc.title).toBe("South Korea 2:0 Poland");
  });
});

// 48-team (2026) format: knockout starts at a round of 32, so the final-ranking
// tiers must label a round-of-32 exit as "32강" — not fall back to "16강".
const T = (c: string) => team(`T-${c}`, c, c);
function ko(stage: string, home: string, away: string, hs: number, as: number, opts: Partial<Match> = {}): Match {
  return {
    ...m,
    id: `M-${stage}-${home}-${away}`,
    slug: `${home}-vs-${away}-${stage}`.toLowerCase(),
    stage,
    group: "not applicable",
    groupStage: stage === "group stage",
    home: T(home),
    away: T(away),
    homeScore: hs,
    awayScore: as,
    result: hs > as ? "win" : hs < as ? "loss" : "draw",
    lineups: { home: [], away: [] },
    goals: [],
    ...opts,
  };
}

describe("buildFinalRanking — 48-team knockout tiers", () => {
  const matches: Match[] = [
    ko("group stage", "H", "G", 0, 1, { group: "Group A", groupStage: true }),
    ko("round of 32", "G", "F", 0, 1),
    ko("round of 16", "F", "E", 0, 1),
    ko("quarter-finals", "E", "A", 0, 1),
    ko("semi-finals", "A", "C", 1, 0),
    ko("semi-finals", "B", "D", 1, 0),
    ko("third-place match", "C", "D", 1, 0),
    ko("final", "A", "B", 1, 0),
  ];
  const rows = buildFinalRanking(matches);
  const finish = (code: string) => rows.find((r) => r.team.code === code)?.finish;

  it("labels every exit round distinctly", () => {
    expect(finish("A")).toBe("우승");
    expect(finish("B")).toBe("준우승");
    expect(finish("C")).toBe("3위");
    expect(finish("D")).toBe("4위");
    expect(finish("E")).toBe("8강");
    expect(finish("F")).toBe("16강");
    expect(finish("G")).toBe("32강");
    expect(finish("H")).toBe("조별리그");
  });

  it("ranks a round-of-32 exit below a round-of-16 exit", () => {
    const pos = (code: string) => rows.find((r) => r.team.code === code)!.position;
    expect(pos("G")).toBeGreaterThan(pos("F"));
  });
});

describe("buildFinalRanking — scheduled matches excluded", () => {
  const matches: Match[] = [
    ko("group stage", "A", "B", 2, 0, { group: "Group A", groupStage: true }),
    // placeholder 0:0 draw that has not been played — must not count
    ko("group stage", "A", "B", 0, 0, { group: "Group A", groupStage: true, status: "scheduled" }),
  ];
  const rows = buildFinalRanking(matches);
  it("ignores scheduled placeholder draws", () => {
    const a = rows.find((r) => r.team.code === "A")!;
    expect(a.played).toBe(1);
    expect(a.draws).toBe(0);
  });
});

describe("buildFinalRanking — semi-final loser without third-place data", () => {
  // Mid-tournament: SF played but the third-place match not yet — both SF
  // losers should read 4강, not fall to 16강.
  const matches: Match[] = [
    ko("semi-finals", "A", "C", 1, 0),
    ko("semi-finals", "B", "D", 1, 0),
    ko("final", "A", "B", 1, 0),
  ];
  const rows = buildFinalRanking(matches);
  const finish = (code: string) => rows.find((r) => r.team.code === code)?.finish;
  it("labels SF losers 4강 when no third-place match exists", () => {
    expect(finish("C")).toBe("4강");
    expect(finish("D")).toBe("4강");
  });
});
