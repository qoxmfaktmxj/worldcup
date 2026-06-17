import Link from "next/link";

const LINKS = [
  { label: "2026", href: "/world-cup/2026" },
  { label: "일정", href: "/world-cup/2026/schedule" },
  { label: "대한민국", href: "/world-cup/2026/korea" },
  { label: "중계", href: "/world-cup/2026/watch" },
  { label: "아카이브", href: "/archive" },
  { label: "검색", href: "/search" },
  { label: "출처", href: "/sources" },
] as const;

interface Props {
  active?: string;
  extra?: { label: string; href: string }[];
}

export function Nav({ active, extra }: Props) {
  const allLinks = extra ? [...LINKS, ...extra] : LINKS;

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
