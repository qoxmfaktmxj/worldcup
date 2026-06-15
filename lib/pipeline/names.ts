const NA = /^not applicable$/i;

function clean(part: string | undefined): string {
  const v = (part ?? "").trim();
  return NA.test(v) ? "" : v;
}

// Fjelstul fills missing mononym name parts with "not applicable" (e.g. Ronaldo,
// Rivaldo). Strip those so display names and slugs read correctly.
export function fullName(given: string | undefined, family: string | undefined): string {
  return `${clean(given)} ${clean(family)}`.trim();
}
