import { fullName } from "./names"

export function koName(
  playerId: string,
  family: string,
  given: string,
  map: Record<string, string>,
): string {
  return map[playerId] ?? fullName(given, family)
}

export function koTeam(
  teamId: string,
  englishName: string,
  map: Record<string, string>,
): string {
  return map[teamId] ?? englishName
}
