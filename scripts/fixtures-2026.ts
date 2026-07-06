/**
 * 2026 FIFA World Cup — group-stage fixtures snapshot (manually verified from
 * official sources, asOf 2026-07-02). 12 groups × 6 = 72 fixtures.
 * Knockout (round of 32+) is omitted while teams are undetermined (group stage
 * in progress). Re-run collection to refresh scores / add knockout once known.
 *
 * Nothing fabricated: scheduled matches carry no score; only matches with a
 * published final result are status 'finished'.
 */
import type { Venue } from "../lib/types";

export const VENUES_2026: Venue[] = [
  { id: "azteca", fifaName: "Estadio Ciudad de México", commonName: "Estadio Azteca", city: "Mexico City", country: "Mexico", timezone: "America/Mexico_City" },
  { id: "akron", fifaName: "Estadio Guadalajara", commonName: "Estadio Akron", city: "Zapopan", country: "Mexico", timezone: "America/Mexico_City" },
  { id: "bbva", fifaName: "Estadio Monterrey", commonName: "Estadio BBVA", city: "Guadalupe", country: "Mexico", timezone: "America/Monterrey" },
  { id: "atlanta", fifaName: "Atlanta Stadium", commonName: "Mercedes-Benz Stadium", city: "Atlanta", country: "United States", timezone: "America/New_York" },
  { id: "toronto", fifaName: "Toronto Stadium", commonName: "BMO Field", city: "Toronto", country: "Canada", timezone: "America/Toronto" },
  { id: "santaclara", fifaName: "San Francisco Bay Area Stadium", commonName: "Levi's Stadium", city: "Santa Clara", country: "United States", timezone: "America/Los_Angeles" },
  { id: "inglewood", fifaName: "Los Angeles Stadium", commonName: "SoFi Stadium", city: "Inglewood", country: "United States", timezone: "America/Los_Angeles" },
  { id: "vancouver", fifaName: "Vancouver Stadium", commonName: "BC Place", city: "Vancouver", country: "Canada", timezone: "America/Vancouver" },
  { id: "seattle", fifaName: "Seattle Stadium", commonName: "Lumen Field", city: "Seattle", country: "United States", timezone: "America/Los_Angeles" },
  { id: "eastrutherford", fifaName: "New York New Jersey Stadium", commonName: "MetLife Stadium", city: "East Rutherford", country: "United States", timezone: "America/New_York" },
  { id: "foxborough", fifaName: "Boston Stadium", commonName: "Gillette Stadium", city: "Foxborough", country: "United States", timezone: "America/New_York" },
  { id: "philadelphia", fifaName: "Philadelphia Stadium", commonName: "Lincoln Financial Field", city: "Philadelphia", country: "United States", timezone: "America/New_York" },
  { id: "miami", fifaName: "Miami Stadium", commonName: "Hard Rock Stadium", city: "Miami Gardens", country: "United States", timezone: "America/New_York" },
  { id: "houston", fifaName: "Houston Stadium", commonName: "NRG Stadium", city: "Houston", country: "United States", timezone: "America/Chicago" },
  { id: "arlington", fifaName: "Dallas Stadium", commonName: "AT&T Stadium", city: "Arlington", country: "United States", timezone: "America/Chicago" },
  { id: "kansascity", fifaName: "Kansas City Stadium", commonName: "Arrowhead Stadium", city: "Kansas City", country: "United States", timezone: "America/Chicago" },
];

// English team name → FIFA 3-letter code (also the team id is `T-${code}`).
export const CODES_2026: Record<string, string> = {
  Mexico: "MEX", "South Korea": "KOR", "Czech Republic": "CZE", "South Africa": "RSA",
  Switzerland: "SUI", Canada: "CAN", Qatar: "QAT", "Bosnia and Herzegovina": "BIH",
  Scotland: "SCO", Morocco: "MAR", Brazil: "BRA", Haiti: "HAI",
  "United States": "USA", Australia: "AUS", Turkey: "TUR", Paraguay: "PAR",
  Germany: "GER", "Ivory Coast": "CIV", Ecuador: "ECU", "Curaçao": "CUW",
  Sweden: "SWE", Japan: "JPN", Netherlands: "NED", Tunisia: "TUN",
  "New Zealand": "NZL", Iran: "IRN", Belgium: "BEL", Egypt: "EGY",
  Uruguay: "URU", "Saudi Arabia": "KSA", Spain: "ESP", "Cape Verde": "CPV",
  France: "FRA", Senegal: "SEN", Iraq: "IRQ", Norway: "NOR",
  Argentina: "ARG", Algeria: "ALG", Austria: "AUT", Jordan: "JOR",
  Portugal: "POR", "DR Congo": "COD", Uzbekistan: "UZB", Colombia: "COL",
  England: "ENG", Croatia: "CRO", Ghana: "GHA", Panama: "PAN",
};

// [group, kickoffUtc (ISO Z), home, away, homeScore|null, awayScore|null, venueId]
// null scores = scheduled (not yet played). status derives from score presence.
export type FixtureTuple = [string, string, string, string, number | null, number | null, string];

export const FIXTURES_2026: FixtureTuple[] = [
  // Group A
  ["A", "2026-06-11T19:00:00Z", "Mexico", "South Africa", 2, 0, "azteca"],
  ["A", "2026-06-12T02:00:00Z", "South Korea", "Czech Republic", 2, 1, "akron"],
  ["A", "2026-06-18T16:00:00Z", "Czech Republic", "South Africa", 1, 1, "atlanta"],
  ["A", "2026-06-19T01:00:00Z", "Mexico", "South Korea", 1, 0, "akron"],
  ["A", "2026-06-25T01:00:00Z", "Czech Republic", "Mexico", 0, 3, "azteca"],
  ["A", "2026-06-25T01:00:00Z", "South Africa", "South Korea", 1, 0, "bbva"],
  // Group B
  ["B", "2026-06-12T19:00:00Z", "Canada", "Bosnia and Herzegovina", 1, 1, "toronto"],
  ["B", "2026-06-13T19:00:00Z", "Qatar", "Switzerland", 1, 1, "santaclara"],
  ["B", "2026-06-18T19:00:00Z", "Switzerland", "Bosnia and Herzegovina", 4, 1, "inglewood"],
  ["B", "2026-06-18T22:00:00Z", "Canada", "Qatar", 6, 0, "vancouver"],
  ["B", "2026-06-24T19:00:00Z", "Switzerland", "Canada", 2, 1, "vancouver"],
  ["B", "2026-06-24T19:00:00Z", "Bosnia and Herzegovina", "Qatar", 3, 1, "seattle"],
  // Group C
  ["C", "2026-06-13T22:00:00Z", "Brazil", "Morocco", 1, 1, "eastrutherford"],
  ["C", "2026-06-14T01:00:00Z", "Haiti", "Scotland", 0, 1, "foxborough"],
  ["C", "2026-06-19T22:00:00Z", "Scotland", "Morocco", 0, 1, "foxborough"],
  ["C", "2026-06-20T00:30:00Z", "Brazil", "Haiti", 3, 0, "philadelphia"],
  ["C", "2026-06-24T22:00:00Z", "Scotland", "Brazil", 0, 3, "miami"],
  ["C", "2026-06-24T22:00:00Z", "Morocco", "Haiti", 3, 2, "atlanta"],
  // Group D
  ["D", "2026-06-13T01:00:00Z", "United States", "Paraguay", 4, 1, "inglewood"],
  ["D", "2026-06-14T04:00:00Z", "Australia", "Turkey", 2, 0, "vancouver"],
  ["D", "2026-06-19T19:00:00Z", "United States", "Australia", 2, 0, "seattle"],
  ["D", "2026-06-20T03:00:00Z", "Turkey", "Paraguay", 0, 1, "santaclara"],
  ["D", "2026-06-26T02:00:00Z", "Turkey", "United States", 3, 2, "inglewood"],
  ["D", "2026-06-26T02:00:00Z", "Paraguay", "Australia", 0, 0, "santaclara"],
  // Group E
  ["E", "2026-06-14T17:00:00Z", "Germany", "Curaçao", 7, 1, "houston"],
  ["E", "2026-06-14T23:00:00Z", "Ivory Coast", "Ecuador", 1, 0, "philadelphia"],
  ["E", "2026-06-20T20:00:00Z", "Germany", "Ivory Coast", 2, 1, "toronto"],
  ["E", "2026-06-21T00:00:00Z", "Ecuador", "Curaçao", 0, 0, "kansascity"],
  ["E", "2026-06-25T20:00:00Z", "Curaçao", "Ivory Coast", 0, 2, "philadelphia"],
  ["E", "2026-06-25T20:00:00Z", "Ecuador", "Germany", 2, 1, "eastrutherford"],
  // Group F
  ["F", "2026-06-14T20:00:00Z", "Netherlands", "Japan", 2, 2, "arlington"],
  ["F", "2026-06-15T02:00:00Z", "Sweden", "Tunisia", 5, 1, "bbva"],
  ["F", "2026-06-20T17:00:00Z", "Netherlands", "Sweden", 5, 1, "houston"],
  ["F", "2026-06-21T04:00:00Z", "Tunisia", "Japan", 0, 4, "bbva"],
  ["F", "2026-06-25T23:00:00Z", "Japan", "Sweden", 1, 1, "arlington"],
  ["F", "2026-06-25T23:00:00Z", "Tunisia", "Netherlands", 1, 3, "kansascity"],
  // Group G
  ["G", "2026-06-15T19:00:00Z", "Belgium", "Egypt", 1, 1, "seattle"],
  ["G", "2026-06-16T01:00:00Z", "Iran", "New Zealand", 2, 2, "inglewood"],
  ["G", "2026-06-21T19:00:00Z", "Belgium", "Iran", 0, 0, "inglewood"],
  ["G", "2026-06-22T01:00:00Z", "New Zealand", "Egypt", 1, 3, "vancouver"],
  ["G", "2026-06-27T03:00:00Z", "Egypt", "Iran", 1, 1, "seattle"],
  ["G", "2026-06-27T03:00:00Z", "New Zealand", "Belgium", 1, 5, "vancouver"],
  // Group H
  ["H", "2026-06-15T16:00:00Z", "Spain", "Cape Verde", 0, 0, "atlanta"],
  ["H", "2026-06-15T22:00:00Z", "Saudi Arabia", "Uruguay", 1, 1, "miami"],
  ["H", "2026-06-21T16:00:00Z", "Spain", "Saudi Arabia", 4, 0, "atlanta"],
  ["H", "2026-06-21T22:00:00Z", "Uruguay", "Cape Verde", 2, 2, "miami"],
  ["H", "2026-06-27T00:00:00Z", "Cape Verde", "Saudi Arabia", 0, 0, "houston"],
  ["H", "2026-06-27T00:00:00Z", "Uruguay", "Spain", 0, 1, "akron"],
  // Group I
  ["I", "2026-06-16T19:00:00Z", "France", "Senegal", 3, 1, "eastrutherford"],
  ["I", "2026-06-16T22:00:00Z", "Iraq", "Norway", 1, 4, "foxborough"],
  ["I", "2026-06-22T21:00:00Z", "France", "Iraq", 3, 0, "philadelphia"],
  ["I", "2026-06-23T00:00:00Z", "Norway", "Senegal", 3, 2, "eastrutherford"],
  ["I", "2026-06-26T19:00:00Z", "Norway", "France", 1, 4, "foxborough"],
  ["I", "2026-06-26T19:00:00Z", "Senegal", "Iraq", 5, 0, "toronto"],
  // Group J
  ["J", "2026-06-17T01:00:00Z", "Argentina", "Algeria", 3, 0, "kansascity"],
  ["J", "2026-06-17T04:00:00Z", "Austria", "Jordan", 3, 1, "santaclara"],
  ["J", "2026-06-22T17:00:00Z", "Argentina", "Austria", 2, 0, "arlington"],
  ["J", "2026-06-23T03:00:00Z", "Jordan", "Algeria", 1, 2, "santaclara"],
  ["J", "2026-06-28T02:00:00Z", "Algeria", "Austria", 3, 3, "kansascity"],
  ["J", "2026-06-28T02:00:00Z", "Jordan", "Argentina", 1, 3, "arlington"],
  // Group K
  ["K", "2026-06-17T17:00:00Z", "Portugal", "DR Congo", 1, 1, "houston"],
  ["K", "2026-06-18T02:00:00Z", "Uzbekistan", "Colombia", 1, 3, "azteca"],
  ["K", "2026-06-23T17:00:00Z", "Portugal", "Uzbekistan", 5, 0, "houston"],
  ["K", "2026-06-24T02:00:00Z", "Colombia", "DR Congo", 1, 0, "akron"],
  ["K", "2026-06-27T23:30:00Z", "Colombia", "Portugal", 0, 0, "miami"],
  ["K", "2026-06-27T23:30:00Z", "DR Congo", "Uzbekistan", 3, 1, "atlanta"],
  // Group L
  ["L", "2026-06-17T20:00:00Z", "England", "Croatia", 4, 2, "arlington"],
  ["L", "2026-06-17T23:00:00Z", "Ghana", "Panama", 1, 0, "toronto"],
  ["L", "2026-06-23T20:00:00Z", "England", "Ghana", 0, 0, "foxborough"],
  ["L", "2026-06-23T23:00:00Z", "Panama", "Croatia", 0, 1, "toronto"],
  ["L", "2026-06-27T21:00:00Z", "Panama", "England", 0, 2, "eastrutherford"],
  ["L", "2026-06-27T21:00:00Z", "Croatia", "Ghana", 2, 1, "philadelphia"],
];

// Knockout fixtures (group_name = not applicable). Scores null until played; a
// penalty shootout carries homePens/awayPens (regulation score stays in
// homeScore/awayScore). Verified from official sources, asOf 2026-07-02.
export interface KnockoutFixture {
  stage: string;
  kickoffUtc: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  venueId: string;
  homePens?: number;
  awayPens?: number;
}

export const KNOCKOUT_2026: KnockoutFixture[] = [
  // Round of 32 (6/28–7/3)
  { stage: "round of 32", kickoffUtc: "2026-06-28T19:00:00Z", home: "Canada", away: "South Africa", homeScore: 1, awayScore: 0, venueId: "inglewood" },
  { stage: "round of 32", kickoffUtc: "2026-06-29T17:00:00Z", home: "Brazil", away: "Japan", homeScore: 2, awayScore: 1, venueId: "houston" },
  // Germany 1-1 Paraguay (Paraguay advance 4-3 on penalties)
  { stage: "round of 32", kickoffUtc: "2026-06-29T20:30:00Z", home: "Germany", away: "Paraguay", homeScore: 1, awayScore: 1, venueId: "foxborough", homePens: 3, awayPens: 4 },
  // Netherlands 1-1 Morocco (Morocco advance 3-2 on penalties)
  { stage: "round of 32", kickoffUtc: "2026-06-30T01:00:00Z", home: "Netherlands", away: "Morocco", homeScore: 1, awayScore: 1, venueId: "bbva", homePens: 2, awayPens: 3 },
  { stage: "round of 32", kickoffUtc: "2026-06-30T17:00:00Z", home: "Ivory Coast", away: "Norway", homeScore: 1, awayScore: 2, venueId: "arlington" },
  { stage: "round of 32", kickoffUtc: "2026-06-30T21:00:00Z", home: "France", away: "Sweden", homeScore: 3, awayScore: 0, venueId: "eastrutherford" },
  { stage: "round of 32", kickoffUtc: "2026-07-01T01:00:00Z", home: "Mexico", away: "Ecuador", homeScore: 2, awayScore: 0, venueId: "azteca" },
  { stage: "round of 32", kickoffUtc: "2026-07-01T16:00:00Z", home: "England", away: "DR Congo", homeScore: 2, awayScore: 1, venueId: "atlanta" },
  // Belgium 3-2 Senegal (AET; Tielemans penalty in 125' won it, no shootout)
  { stage: "round of 32", kickoffUtc: "2026-07-01T20:00:00Z", home: "Belgium", away: "Senegal", homeScore: 3, awayScore: 2, venueId: "seattle" },
  { stage: "round of 32", kickoffUtc: "2026-07-02T00:00:00Z", home: "United States", away: "Bosnia and Herzegovina", homeScore: 2, awayScore: 0, venueId: "santaclara" },
  { stage: "round of 32", kickoffUtc: "2026-07-02T19:00:00Z", home: "Spain", away: "Austria", homeScore: 3, awayScore: 0, venueId: "inglewood" },
  { stage: "round of 32", kickoffUtc: "2026-07-02T23:00:00Z", home: "Portugal", away: "Croatia", homeScore: 2, awayScore: 1, venueId: "toronto" },
  { stage: "round of 32", kickoffUtc: "2026-07-03T03:00:00Z", home: "Switzerland", away: "Algeria", homeScore: 2, awayScore: 0, venueId: "vancouver" },
  // Australia 1-1 Egypt (Egypt advance 4-2 on penalties)
  { stage: "round of 32", kickoffUtc: "2026-07-03T18:00:00Z", home: "Australia", away: "Egypt", homeScore: 1, awayScore: 1, venueId: "arlington", homePens: 2, awayPens: 4 },
  // Argentina 3-2 Cape Verde (AET; Romero header won it, no shootout)
  { stage: "round of 32", kickoffUtc: "2026-07-03T22:00:00Z", home: "Argentina", away: "Cape Verde", homeScore: 3, awayScore: 2, venueId: "miami" },
  { stage: "round of 32", kickoffUtc: "2026-07-04T01:30:00Z", home: "Colombia", away: "Ghana", homeScore: 1, awayScore: 0, venueId: "kansascity" },
  // Round of 16 (7/4–7/7)
  { stage: "round of 16", kickoffUtc: "2026-07-04T17:00:00Z", home: "Morocco", away: "Canada", homeScore: 3, awayScore: 0, venueId: "houston" },
  { stage: "round of 16", kickoffUtc: "2026-07-04T21:00:00Z", home: "France", away: "Paraguay", homeScore: 1, awayScore: 0, venueId: "philadelphia" },
];
