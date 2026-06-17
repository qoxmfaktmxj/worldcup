export interface ScenarioRow {
  code: string
  points: number
  played: number
}

export interface ScenarioOutcome {
  points: number
  note: string
}

export interface QualifyScenarios {
  win: ScenarioOutcome
  draw: ScenarioOutcome
  loss: ScenarioOutcome
}

function makeNote(points: number): string {
  if (points >= 6) return `승점 ${points} — 32강 진출 매우 유력`
  if (points === 4) return `승점 ${points} — 다음 경기 결과 중요`
  return `승점 ${points} — 최종전 결과 필요`
}

/**
 * Given a group standing snapshot and a team code,
 * returns projected points and a Korean guidance note
 * for each of win / draw / loss outcomes in the next match.
 */
export function qualifyScenarios(
  rows: ScenarioRow[],
  code: string
): QualifyScenarios {
  const target = rows.find((r) => r.code === code)
  const current = target?.points ?? 0

  const winPoints = current + 3
  const drawPoints = current + 1
  const lossPoints = current

  return {
    win: { points: winPoints, note: makeNote(winPoints) },
    draw: { points: drawPoints, note: makeNote(drawPoints) },
    loss: { points: lossPoints, note: makeNote(lossPoints) },
  }
}
