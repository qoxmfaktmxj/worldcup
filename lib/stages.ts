export const STAGE_KO: Record<string, string> = {
  "group stage": "조별리그",
  "round of 16": "16강",
  "quarter-finals": "8강",
  "semi-finals": "준결승",
  "third-place match": "3·4위전",
  final: "결승",
};

export function stageKo(stage: string): string {
  return STAGE_KO[stage] ?? stage;
}

// Group-stage matches show the group (e.g. "Group D"); knockout matches have
// group_name = "not applicable" in Fjelstul, so show the Korean round instead.
export function roundLabel(group: string, stage: string): string {
  return group && group !== "not applicable" ? group : stageKo(stage);
}
