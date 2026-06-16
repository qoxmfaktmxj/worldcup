export const STAGE_KO: Record<string, string> = {
  "group stage": "조별리그",
  "round of 16": "16강",
  "quarter-finals": "8강",
  "semi-finals": "4강",
  "third-place match": "3·4위전",
  final: "결승",
};

export function stageKo(stage: string): string {
  return STAGE_KO[stage] ?? stage;
}

// "Group D" → "D조" (Korean audience). Leaves anything else untouched.
export function groupKo(group: string): string {
  const m = /^Group\s+(.+)$/i.exec(group);
  return m ? `${m[1]}조` : group;
}

// Group-stage matches show the group (e.g. "D조"); knockout matches have
// group_name = "not applicable" in Fjelstul, so show the Korean round instead
// (16강 / 8강 / 4강 / 3·4위전 / 결승).
export function roundLabel(group: string, stage: string): string {
  return group && group !== "not applicable" ? groupKo(group) : stageKo(stage);
}
