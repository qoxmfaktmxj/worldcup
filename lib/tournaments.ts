export interface TournamentMeta {
  year: number;
  nameKo: string;
  host: string;
  available: boolean;
}

// Logos live at /logos/{year}_1.svg (small emblem) and /logos/{year}_2.webp (large).
export const TOURNAMENTS: TournamentMeta[] = [
  { year: 2002, nameKo: "한국 · 일본", host: "대한민국 / 일본", available: true },
  { year: 2006, nameKo: "독일", host: "독일", available: true },
  { year: 2010, nameKo: "남아공", host: "남아프리카공화국", available: false },
  { year: 2014, nameKo: "브라질", host: "브라질", available: false },
  { year: 2018, nameKo: "러시아", host: "러시아", available: false },
  { year: 2022, nameKo: "카타르", host: "카타르", available: false },
  { year: 2026, nameKo: "북중미", host: "미국 · 캐나다 · 멕시코", available: false },
];

export const emblemSmall = (year: number) => `/logos/${year}_1.svg`;
export const emblemLarge = (year: number) => `/logos/${year}_2.webp`;

// Years with generated data, oldest → newest. Drives static params and the global player/search pages.
export const availableYears = (): number[] =>
  TOURNAMENTS.filter((t) => t.available)
    .map((t) => t.year)
    .sort((a, b) => a - b);
