// Per-nation kit colors keyed by Fjelstul English team name.
// Each: primary [hex, family] + secondary [hex, family]. Family drives clash detection.
type ColorFamily = "red" | "blue" | "green" | "gold" | "white" | "dark" | "gray";
type Swatch = [string, ColorFamily];

const TEAM_COLORS: Record<string, { primary: Swatch; secondary: Swatch }> = {
  France: { primary: ["#002654", "blue"], secondary: ["#ffffff", "white"] },
  Senegal: { primary: ["#00853F", "green"], secondary: ["#ffffff", "white"] },
  Uruguay: { primary: ["#4C9DD1", "blue"], secondary: ["#ffffff", "white"] },
  Denmark: { primary: ["#C60C30", "red"], secondary: ["#ffffff", "white"] },
  Spain: { primary: ["#C60B1E", "red"], secondary: ["#1A2A6C", "blue"] },
  Paraguay: { primary: ["#D52B1E", "red"], secondary: ["#ffffff", "white"] },
  "South Africa": { primary: ["#FCB904", "gold"], secondary: ["#007749", "green"] },
  Slovenia: { primary: ["#F4F4F4", "white"], secondary: ["#00853F", "green"] },
  Brazil: { primary: ["#FFDF00", "gold"], secondary: ["#002776", "blue"] },
  Turkey: { primary: ["#E30A17", "red"], secondary: ["#ffffff", "white"] },
  China: { primary: ["#DE2910", "red"], secondary: ["#FFDE00", "gold"] },
  "Costa Rica": { primary: ["#D80027", "red"], secondary: ["#002B7F", "blue"] },
  "South Korea": { primary: ["#CD2E3A", "red"], secondary: ["#13386B", "blue"] },
  "United States": { primary: ["#0A3161", "blue"], secondary: ["#ffffff", "white"] },
  Portugal: { primary: ["#C8102E", "red"], secondary: ["#006600", "green"] },
  Poland: { primary: ["#F4F4F4", "white"], secondary: ["#DC143C", "red"] },
  Germany: { primary: ["#F2F2F2", "white"], secondary: ["#1A1A1A", "dark"] },
  "Republic of Ireland": { primary: ["#169B62", "green"], secondary: ["#ffffff", "white"] },
  Cameroon: { primary: ["#007A33", "green"], secondary: ["#CE1126", "red"] },
  "Saudi Arabia": { primary: ["#006C35", "green"], secondary: ["#ffffff", "white"] },
  Argentina: { primary: ["#6CACE4", "blue"], secondary: ["#ffffff", "white"] },
  England: { primary: ["#FFFFFF", "white"], secondary: ["#001E5C", "blue"] },
  Sweden: { primary: ["#FECC02", "gold"], secondary: ["#006AA7", "blue"] },
  Nigeria: { primary: ["#008751", "green"], secondary: ["#ffffff", "white"] },
  Italy: { primary: ["#0066B3", "blue"], secondary: ["#ffffff", "white"] },
  Mexico: { primary: ["#006847", "green"], secondary: ["#ffffff", "white"] },
  Croatia: { primary: ["#E1001F", "red"], secondary: ["#ffffff", "white"] },
  Ecuador: { primary: ["#FFD100", "gold"], secondary: ["#034EA2", "blue"] },
  Japan: { primary: ["#0033A0", "blue"], secondary: ["#ffffff", "white"] },
  Belgium: { primary: ["#E30613", "red"], secondary: ["#FDDA24", "gold"] },
  Russia: { primary: ["#DA291C", "red"], secondary: ["#ffffff", "white"] },
  Tunisia: { primary: ["#E70013", "red"], secondary: ["#ffffff", "white"] },
};

const DEFAULT = { primary: ["#e4002b", "red"] as Swatch, secondary: ["#888888", "gray"] as Swatch };
const CONTRAST: Record<ColorFamily, string> = {
  red: "#2f6bff",
  blue: "#f0b323",
  green: "#f0b323",
  gold: "#2f6bff",
  white: "#2f6bff",
  dark: "#2f6bff",
  gray: "#2f6bff",
};

function colorOf(name: string) {
  return TEAM_COLORS[name] ?? DEFAULT;
}

// Pick a color for `team` that avoids `avoid` family; prefer real kit colors, fall back to contrast.
function pickAvoiding(team: { primary: Swatch; secondary: Swatch }, avoid: ColorFamily): string {
  if (team.primary[1] !== avoid) return team.primary[0];
  if (team.secondary[1] !== avoid) return team.secondary[0];
  return CONTRAST[avoid];
}

export function resolveMatchColors(homeName: string, awayName: string): { home: string; away: string } {
  const h = colorOf(homeName);
  const a = colorOf(awayName);
  return { home: h.primary[0], away: pickAvoiding(a, h.primary[1]) };
}

export function teamPrimary(name: string): string {
  return colorOf(name).primary[0];
}
