import { describe, it, expect } from "vitest";
import { teamSlug, groupSlug, playerSlug, buildPlayers } from "./aggregate";
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
