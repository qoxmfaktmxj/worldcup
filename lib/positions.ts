// Fjelstul position_name (English) -> Korean. position_code (GK/CB/...) is left
// untouched — the pitch banding relies on it.
const POS: Record<string, string> = {
  "goal keeper": "골키퍼",
  sweeper: "스위퍼",
  "center back": "센터백",
  "left back": "레프트백",
  "right back": "라이트백",
  "left wing back": "레프트 윙백",
  "right wing back": "라이트 윙백",
  defender: "수비수",
  "defensive midfielder": "수비형 미드필더",
  "center midfielder": "중앙 미드필더",
  "left midfielder": "왼쪽 미드필더",
  "right midfielder": "오른쪽 미드필더",
  "attacking midfielder": "공격형 미드필더",
  midfielder: "미드필더",
  "left winger": "왼쪽 윙어",
  "right winger": "오른쪽 윙어",
  "left forward": "왼쪽 공격수",
  "right forward": "오른쪽 공격수",
  "center forward": "센터 포워드",
  "second striker": "세컨드 스트라이커",
  forward: "공격수",
};

export function posKo(name: string): string {
  return POS[name] ?? name;
}

// Coarse role bucket for the Korean fine label. Used to generalize a player's
// headline position when their most-played fine position is tied (e.g. a game
// each at RF/LF/RW → 공격수). Keyed by the posKo() output.
const BROAD: Record<string, string> = {
  골키퍼: "골키퍼",
  스위퍼: "수비수",
  센터백: "수비수",
  레프트백: "수비수",
  라이트백: "수비수",
  "레프트 윙백": "수비수",
  "라이트 윙백": "수비수",
  수비수: "수비수",
  "수비형 미드필더": "미드필더",
  "중앙 미드필더": "미드필더",
  "왼쪽 미드필더": "미드필더",
  "오른쪽 미드필더": "미드필더",
  "공격형 미드필더": "미드필더",
  미드필더: "미드필더",
  "왼쪽 윙어": "공격수",
  "오른쪽 윙어": "공격수",
  "왼쪽 공격수": "공격수",
  "오른쪽 공격수": "공격수",
  "센터 포워드": "공격수",
  "세컨드 스트라이커": "공격수",
  공격수: "공격수",
};

export function broadRole(ko: string): string {
  return BROAD[ko] ?? ko;
}
