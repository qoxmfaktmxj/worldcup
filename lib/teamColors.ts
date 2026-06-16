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
  // 2006 newcomers (not present in 2002).
  Switzerland: { primary: ["#D52B1E", "red"], secondary: ["#ffffff", "white"] },
  Netherlands: { primary: ["#EC7700", "gold"], secondary: ["#ffffff", "white"] },
  Ukraine: { primary: ["#FFD500", "gold"], secondary: ["#005BBB", "blue"] },
  "Czech Republic": { primary: ["#D7141A", "red"], secondary: ["#ffffff", "white"] },
  "Ivory Coast": { primary: ["#FF8200", "gold"], secondary: ["#009E60", "green"] },
  Ghana: { primary: ["#F4F4F4", "white"], secondary: ["#006B3F", "green"] },
  Iran: { primary: ["#F4F4F4", "white"], secondary: ["#239F40", "green"] },
  Angola: { primary: ["#CC092F", "red"], secondary: ["#1A1A1A", "dark"] },
  Togo: { primary: ["#006A4E", "green"], secondary: ["#FFCE00", "gold"] },
  Australia: { primary: ["#FFB81C", "gold"], secondary: ["#00843D", "green"] },
  "Serbia and Montenegro": { primary: ["#C6363C", "red"], secondary: ["#0C4076", "blue"] },
  "Trinidad and Tobago": { primary: ["#DA1A35", "red"], secondary: ["#ffffff", "white"] },
  // 2010–2022 newcomers.
  Algeria: { primary: ["#006233", "green"], secondary: ["#ffffff", "white"] },
  Chile: { primary: ["#D52B1E", "red"], secondary: ["#0039A6", "blue"] },
  Greece: { primary: ["#0D5EAF", "blue"], secondary: ["#ffffff", "white"] },
  Honduras: { primary: ["#0073CF", "blue"], secondary: ["#ffffff", "white"] },
  "New Zealand": { primary: ["#F4F4F4", "white"], secondary: ["#1A1A1A", "dark"] },
  "North Korea": { primary: ["#D7141A", "red"], secondary: ["#ffffff", "white"] },
  Serbia: { primary: ["#C6363C", "red"], secondary: ["#0C4076", "blue"] },
  Slovakia: { primary: ["#0B4EA2", "blue"], secondary: ["#ffffff", "white"] },
  "Bosnia and Herzegovina": { primary: ["#002395", "blue"], secondary: ["#FECB00", "gold"] },
  Colombia: { primary: ["#FCD116", "gold"], secondary: ["#003893", "blue"] },
  Egypt: { primary: ["#CE1126", "red"], secondary: ["#ffffff", "white"] },
  Iceland: { primary: ["#02529C", "blue"], secondary: ["#ffffff", "white"] },
  Morocco: { primary: ["#C1272D", "red"], secondary: ["#006233", "green"] },
  Panama: { primary: ["#D21034", "red"], secondary: ["#005293", "blue"] },
  Peru: { primary: ["#D91023", "red"], secondary: ["#ffffff", "white"] },
  Canada: { primary: ["#D80621", "red"], secondary: ["#ffffff", "white"] },
  Qatar: { primary: ["#8A1538", "red"], secondary: ["#ffffff", "white"] },
  Wales: { primary: ["#C8102E", "red"], secondary: ["#00B140", "green"] },
  // 2026 newcomers.
  Scotland: { primary: ["#003478", "blue"], secondary: ["#ffffff", "white"] },
  Haiti: { primary: ["#00209F", "blue"], secondary: ["#D21034", "red"] },
  "Curaçao": { primary: ["#002B7F", "blue"], secondary: ["#F9D616", "gold"] },
  "Cape Verde": { primary: ["#003893", "blue"], secondary: ["#ffffff", "white"] },
  Iraq: { primary: ["#007A3D", "green"], secondary: ["#ffffff", "white"] },
  Norway: { primary: ["#BA0C2F", "red"], secondary: ["#00205B", "blue"] },
  Austria: { primary: ["#ED2939", "red"], secondary: ["#ffffff", "white"] },
  Jordan: { primary: ["#CE1126", "red"], secondary: ["#ffffff", "white"] },
  "DR Congo": { primary: ["#0085CA", "blue"], secondary: ["#F7D618", "gold"] },
  Uzbekistan: { primary: ["#0099B5", "blue"], secondary: ["#ffffff", "white"] },
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

const KO: Record<string, string> = {
  France: "프랑스",
  Senegal: "세네갈",
  Uruguay: "우루과이",
  Denmark: "덴마크",
  Spain: "스페인",
  Paraguay: "파라과이",
  "South Africa": "남아프리카공화국",
  Slovenia: "슬로베니아",
  Brazil: "브라질",
  Turkey: "터키",
  China: "중국",
  "Costa Rica": "코스타리카",
  "South Korea": "대한민국",
  "United States": "미국",
  Portugal: "포르투갈",
  Poland: "폴란드",
  Germany: "독일",
  "Republic of Ireland": "아일랜드",
  Cameroon: "카메룬",
  "Saudi Arabia": "사우디아라비아",
  Argentina: "아르헨티나",
  England: "잉글랜드",
  Sweden: "스웨덴",
  Nigeria: "나이지리아",
  Italy: "이탈리아",
  Mexico: "멕시코",
  Croatia: "크로아티아",
  Ecuador: "에콰도르",
  Japan: "일본",
  Belgium: "벨기에",
  Russia: "러시아",
  Tunisia: "튀니지",
  Switzerland: "스위스",
  Netherlands: "네덜란드",
  Ukraine: "우크라이나",
  "Czech Republic": "체코",
  "Ivory Coast": "코트디부아르",
  Ghana: "가나",
  Iran: "이란",
  Angola: "앙골라",
  Togo: "토고",
  Australia: "호주",
  "Serbia and Montenegro": "세르비아 몬테네그로",
  "Trinidad and Tobago": "트리니다드 토바고",
  Algeria: "알제리",
  Chile: "칠레",
  Greece: "그리스",
  Honduras: "온두라스",
  "New Zealand": "뉴질랜드",
  "North Korea": "북한",
  Serbia: "세르비아",
  Slovakia: "슬로바키아",
  "Bosnia and Herzegovina": "보스니아 헤르체고비나",
  Colombia: "콜롬비아",
  Egypt: "이집트",
  Iceland: "아이슬란드",
  Morocco: "모로코",
  Panama: "파나마",
  Peru: "페루",
  Canada: "캐나다",
  Qatar: "카타르",
  Wales: "웨일스",
  Scotland: "스코틀랜드",
  Haiti: "아이티",
  "Curaçao": "퀴라소",
  "Cape Verde": "카보베르데",
  Iraq: "이라크",
  Norway: "노르웨이",
  Austria: "오스트리아",
  Jordan: "요르단",
  "DR Congo": "콩고민주공화국",
  Uzbekistan: "우즈베키스탄",
};

export function teamKo(name: string): string | undefined {
  return KO[name];
}
