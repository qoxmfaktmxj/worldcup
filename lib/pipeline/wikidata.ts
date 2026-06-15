export function parseTime(t: string | undefined): string | undefined {
  if (!t) return undefined;
  const m = /^[+-](\d{4})-(\d{2})-(\d{2})/.exec(t);
  if (!m) return undefined;
  const [, y, mo, d] = m;
  return mo === "00" ? y : d === "00" ? `${y}.${mo}` : `${y}.${mo}.${d}`;
}

const Q_METRE = "Q11573";
const Q_CM = "Q174728";

export function parseHeight(v: { amount?: string; unit?: string } | undefined): number | undefined {
  if (!v?.amount) return undefined;
  const n = Number(v.amount);
  if (!Number.isFinite(n)) return undefined;
  if (v.unit?.includes(Q_METRE)) return Math.round(n * 100);
  if (v.unit?.includes(Q_CM)) return Math.round(n);
  return n < 3 ? Math.round(n * 100) : Math.round(n);
}

export function pickLabels(
  labels: Record<string, { value: string }> | undefined,
): { ko?: string; en?: string } {
  return { ko: labels?.ko?.value, en: labels?.en?.value };
}
