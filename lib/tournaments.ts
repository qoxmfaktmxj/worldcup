export type TournamentStatus = 'archive-complete' | 'live-snapshot';

export interface TournamentMeta {
  year: number;
  nameKo: string;
  host: string;
  status: TournamentStatus;
  featured?: boolean;
}

// Logos live at /logos/{year}_1.svg (small emblem) and /logos/{year}_2.webp (large).
export const TOURNAMENTS: TournamentMeta[] = [
  { year: 2002, nameKo: "한국 · 일본", host: "대한민국 / 일본", status: 'archive-complete' },
  { year: 2006, nameKo: "독일", host: "독일", status: 'archive-complete' },
  { year: 2010, nameKo: "남아공", host: "남아프리카공화국", status: 'archive-complete' },
  { year: 2014, nameKo: "브라질", host: "브라질", status: 'archive-complete' },
  { year: 2018, nameKo: "러시아", host: "러시아", status: 'archive-complete' },
  { year: 2022, nameKo: "카타르", host: "카타르", status: 'archive-complete' },
  { year: 2026, nameKo: "북중미", host: "미국 · 캐나다 · 멕시코", status: 'live-snapshot', featured: true },
];

export const emblemSmall = (year: number) => `/logos/${year}_1.svg`;
export const emblemLarge = (year: number) => `/logos/${year}_2.webp`;

// All tournaments have data — return every year, oldest → newest.
// Drives static params and the global player/search pages.
export const availableYears = (): number[] =>
  TOURNAMENTS.map((t) => t.year).sort((a, b) => a - b);
