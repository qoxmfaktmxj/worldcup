/**
 * 2026 FIFA World Cup — group-stage fixtures snapshot (manually verified from
 * official sources, asOf 2026-06-26). 12 groups × 6 = 72 fixtures.
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
  ["G", "2026-06-27T03:00:00Z", "Egypt", "Iran", null, null, "seattle"],
  ["G", "2026-06-27T03:00:00Z", "New Zealand", "Belgium", null, null, "vancouver"],
  // Group H
  ["H", "2026-06-15T16:00:00Z", "Spain", "Cape Verde", 0, 0, "atlanta"],
  ["H", "2026-06-15T22:00:00Z", "Saudi Arabia", "Uruguay", 1, 1, "miami"],
  ["H", "2026-06-21T16:00:00Z", "Spain", "Saudi Arabia", 4, 0, "atlanta"],
  ["H", "2026-06-21T22:00:00Z", "Uruguay", "Cape Verde", 2, 2, "miami"],
  ["H", "2026-06-27T00:00:00Z", "Cape Verde", "Saudi Arabia", null, null, "houston"],
  ["H", "2026-06-27T00:00:00Z", "Uruguay", "Spain", null, null, "akron"],
  // Group I
  ["I", "2026-06-16T19:00:00Z", "France", "Senegal", 3, 1, "eastrutherford"],
  ["I", "2026-06-16T22:00:00Z", "Iraq", "Norway", 1, 4, "foxborough"],
  ["I", "2026-06-22T21:00:00Z", "France", "Iraq", 3, 0, "philadelphia"],
  ["I", "2026-06-23T00:00:00Z", "Norway", "Senegal", 3, 2, "eastrutherford"],
  ["I", "2026-06-26T19:00:00Z", "Norway", "France", null, null, "foxborough"],
  ["I", "2026-06-26T19:00:00Z", "Senegal", "Iraq", null, null, "toronto"],
  // Group J
  ["J", "2026-06-17T01:00:00Z", "Argentina", "Algeria", 3, 0, "kansascity"],
  ["J", "2026-06-17T04:00:00Z", "Austria", "Jordan", 3, 1, "santaclara"],
  ["J", "2026-06-22T17:00:00Z", "Argentina", "Austria", 2, 0, "arlington"],
  ["J", "2026-06-23T03:00:00Z", "Jordan", "Algeria", 1, 2, "santaclara"],
  ["J", "2026-06-28T02:00:00Z", "Algeria", "Austria", null, null, "kansascity"],
  ["J", "2026-06-28T02:00:00Z", "Jordan", "Argentina", null, null, "arlington"],
  // Group K
  ["K", "2026-06-17T17:00:00Z", "Portugal", "DR Congo", 1, 1, "houston"],
  ["K", "2026-06-18T02:00:00Z", "Uzbekistan", "Colombia", 1, 3, "azteca"],
  ["K", "2026-06-23T17:00:00Z", "Portugal", "Uzbekistan", 5, 0, "houston"],
  ["K", "2026-06-24T02:00:00Z", "Colombia", "DR Congo", 1, 0, "akron"],
  ["K", "2026-06-27T23:30:00Z", "Colombia", "Portugal", null, null, "miami"],
  ["K", "2026-06-27T23:30:00Z", "DR Congo", "Uzbekistan", null, null, "atlanta"],
  // Group L
  ["L", "2026-06-17T20:00:00Z", "England", "Croatia", 4, 2, "arlington"],
  ["L", "2026-06-17T23:00:00Z", "Ghana", "Panama", 1, 0, "toronto"],
  ["L", "2026-06-23T20:00:00Z", "England", "Ghana", 0, 0, "foxborough"],
  ["L", "2026-06-23T23:00:00Z", "Panama", "Croatia", 0, 1, "toronto"],
  ["L", "2026-06-27T21:00:00Z", "Panama", "England", null, null, "eastrutherford"],
  ["L", "2026-06-27T21:00:00Z", "Croatia", "Ghana", null, null, "philadelphia"],
];
