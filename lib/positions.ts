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
