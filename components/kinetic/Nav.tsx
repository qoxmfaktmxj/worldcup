import Link from "next/link";

const HUB_LINKS = [
  { label: "2026", href: "/world-cup/2026" },
  { label: "일정", href: "/world-cup/2026/schedule" },
  { label: "대한민국", href: "/world-cup/2026/korea" },
  { label: "중계", href: "/world-cup/2026/watch" },
] as const;

const GLOBAL_LINKS = [
  { label: "아카이브", href: "/archive" },
  { label: "검색", href: "/search" },
  { label: "출처", href: "/sources" },
] as const;

interface Props {
  active?: string;
  extra?: { label: string; href: string }[];
  /** 현재 보고 있는 대회 연도. 2026 허브 전용 탭(일정/대한민국/중계) 노출 여부를 결정. */
  year?: number;
}

export function Nav({ active, extra, year }: Props) {
  const isArchiveYear = year !== undefined && year !== 2026;
  const base = isArchiveYear
    ? [{ label: String(year), href: `/world-cup/${year}` }, ...GLOBAL_LINKS]
    : [...HUB_LINKS, ...GLOBAL_LINKS];
  const allLinks = extra ? [...base, ...extra] : base;

  return (
    <nav>
      <div className="flex flex-wrap gap-1.5 pb-1">
        {allLinks.map((link) => {
          const isActive = link.label === active;
          return (
            <Link
              key={link.label}
              href={link.href}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors whitespace-nowrap",
                isActive
                  ? "bg-korea/15 border-korea text-korea"
                  : "bg-panel border-line hover:border-korea text-muted hover:text-white",
              ].join(" ")}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
