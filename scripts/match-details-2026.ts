/**
 * 2026 FIFA World Cup — per-match verified detail (lineups, goals, subs, cards).
 *
 * Keyed by match slug (slugify("Home vs Away")). build-2026.ts merges any entry
 * found here into the corresponding fixture; matches with no entry keep empty
 * detail (status still 'finished' — score-only snapshot).
 *
 * Nothing fabricated: only XI / events confirmed from official sources
 * (FIFA Match Centre, FA/federation match reports). Korean player names are used
 * only where a verified transliteration exists; otherwise the English name is
 * kept (koName falls back to English — no guessing).
 *
 * playerId scheme: P-2026-<CODE>-<shirt>  (CODE = FIFA 3-letter, from CODES_2026)
 * teamId scheme:   T-<CODE>               (matches teamRef in build-2026)
 */
import type { Appearance, Booking, Goal, Substitution } from "../lib/types";

export interface MatchDetail {
  lineups: { home: Appearance[]; away: Appearance[] };
  goals: Goal[];
  bookings: Booking[];
  subs: Substitution[];
}

// Helper builders to keep entries terse and consistent.
export function pid(code: string, shirt: number): string {
  return `P-2026-${code}-${shirt}`;
}

/**
 * Compact appearance builder.
 * a(code, shirt, "Given", "Family", "POS", "POSCODE", { ko?, starter?, sub? })
 */
export function a(
  code: string,
  shirt: number,
  given: string,
  family: string,
  position: string,
  positionCode: string,
  opts: { ko?: string; starter?: boolean; sub?: boolean } = {},
): Appearance {
  const en = [given, family].filter(Boolean).join(" ");
  return {
    playerId: pid(code, shirt),
    familyName: family,
    givenName: given,
    nameKo: opts.ko ?? en, // English fallback when no verified Korean name
    shirtNumber: shirt,
    position,
    positionCode,
    starter: opts.starter ?? true,
    substitute: opts.sub ?? false,
  };
}

export function goal(
  code: string,
  shirt: number,
  nameKo: string,
  minute: number,
  opts: { ownGoal?: boolean; penalty?: boolean } = {},
): Goal {
  return {
    minute,
    playerId: pid(code, shirt),
    nameKo,
    teamId: `T-${code}`,
    ownGoal: opts.ownGoal ?? false,
    penalty: opts.penalty ?? false,
  };
}

export function booking(
  code: string,
  shirt: number,
  nameKo: string,
  minute: number,
  card: Booking["card"] = "yellow",
): Booking {
  return { minute, playerId: pid(code, shirt), nameKo, teamId: `T-${code}`, card };
}

export function sub(
  code: string,
  onShirt: number,
  offShirt: number,
  minute: number,
): Substitution {
  return { minute, onId: pid(code, onShirt), offId: pid(code, offShirt), teamId: `T-${code}` };
}

// slug → detail. Add entries as matches are verified from official sources.
export const DETAILS_2026: Record<string, MatchDetail> = {
  // Group A · 2026-06-12 · Estadio Akron — KOR 2-1 CZE
  // Source: FIFA Match Centre + ESPN lineups (gameId 760414). Formations 3-4-2-1.
  "south-korea-vs-czech-republic": {
    lineups: {
      home: [
        a("KOR", 1, "Seung-gyu", "Kim", "goalkeeper", "GK", { ko: "김승규" }),
        a("KOR", 2, "Han-beom", "Lee", "right center back", "RCB", { ko: "이한범" }),
        a("KOR", 3, "Gi-hyuk", "Lee", "center back", "CB", { ko: "이기혁" }),
        a("KOR", 4, "Min-jae", "Kim", "left center back", "LCB", { ko: "김민재" }),
        a("KOR", 22, "Young-woo", "Seol", "right wing back", "RWB", { ko: "설영우" }),
        a("KOR", 6, "In-beom", "Hwang", "right central midfield", "RCM", { ko: "황인범" }),
        a("KOR", 8, "Seung-ho", "Paik", "left central midfield", "LCM", { ko: "백승호" }),
        a("KOR", 13, "Tae-seok", "Lee", "left wing back", "LWB", { ko: "이태석" }),
        a("KOR", 19, "Kang-in", "Lee", "right forward", "RF", { ko: "이강인" }),
        a("KOR", 10, "Jae-sung", "Lee", "second striker", "SS", { ko: "이재성" }),
        a("KOR", 7, "Heung-min", "Son", "striker", "ST", { ko: "손흥민" }),
        a("KOR", 11, "Hee-chan", "Hwang", "forward", "ST", { ko: "황희찬", starter: false, sub: true }),
        a("KOR", 18, "Hyeon-gyu", "Oh", "striker", "ST", { ko: "오현규", starter: false, sub: true }),
        a("KOR", 25, "Ji-sung", "Eom", "midfield", "CM", { ko: "엄지성", starter: false, sub: true }),
        a("KOR", 24, "Jin-gyu", "Kim", "midfield", "CM", { ko: "김진규", starter: false, sub: true }),
        a("KOR", 16, "Jin-seop", "Park", "defender", "CB", { ko: "박진섭", starter: false, sub: true }),
      ],
      away: [
        a("CZE", 1, "Matej", "Kovář", "goalkeeper", "GK"),
        a("CZE", 6, "Stepan", "Chaloupek", "right center back", "RCB"),
        a("CZE", 4, "Robin", "Hranáč", "center back", "CB"),
        a("CZE", 7, "Ladislav", "Krejčí", "left center back", "LCB"),
        a("CZE", 5, "Vladimir", "Coufal", "right wing back", "RWB"),
        a("CZE", 22, "Tomáš", "Souček", "right central midfield", "RCM"),
        a("CZE", 24, "Alexandr", "Sojka", "left central midfield", "LCM"),
        a("CZE", 20, "Jaroslav", "Zelený", "left wing back", "LWB"),
        a("CZE", 15, "Pavel", "Šulc", "right forward", "RF"),
        a("CZE", 17, "Lukáš", "Provod", "second striker", "SS"),
        a("CZE", 10, "Patrik", "Schick", "striker", "ST"),
        a("CZE", 19, "Tomáš", "Chorý", "striker", "ST", { starter: false, sub: true }),
        a("CZE", 9, "Adam", "Hložek", "forward", "ST", { starter: false, sub: true }),
        a("CZE", 18, "Michal", "Sadílek", "midfield", "CM", { starter: false, sub: true }),
        a("CZE", 13, "Mojmír", "Chytil", "forward", "ST", { starter: false, sub: true }),
      ],
    },
    goals: [
      goal("CZE", 7, "Ladislav Krejčí", 59),
      goal("KOR", 6, "황인범", 67),
      goal("KOR", 18, "오현규", 80),
    ],
    bookings: [booking("KOR", 3, "이기혁", 90)],
    subs: [
      sub("KOR", 11, 10, 62),
      sub("KOR", 18, 7, 69),
      sub("KOR", 25, 13, 69),
      sub("KOR", 24, 6, 84),
      sub("KOR", 16, 8, 84),
      sub("CZE", 19, 10, 64),
      sub("CZE", 9, 15, 64),
      sub("CZE", 18, 17, 64),
      sub("CZE", 13, 24, 84),
    ],
  },
};
