export function koName(
  playerId: string,
  family: string,
  given: string,
  map: Record<string, string>,
): string {
  return map[playerId] ?? `${given} ${family}`.trim()
}

export function koTeam(
  teamId: string,
  englishName: string,
  map: Record<string, string>,
): string {
  return map[teamId] ?? englishName
}
