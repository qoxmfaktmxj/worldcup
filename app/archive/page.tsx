import Link from "next/link";
import { Nav } from "@/components/kinetic/Nav";
import { TOURNAMENTS, emblemSmall } from "@/lib/tournaments";

export const metadata = {
  title: "월드컵 아카이브",
  description: "역대 FIFA 월드컵을 경기·선수·기록으로 탐험하세요.",
};

export default function ArchivePage() {
  return (
    <main className="mx-auto max-w-5xl p-6 sm:p-8">
      <Nav active="아카이브" />
      <header className="mb-8 mt-6">
        <h1
          className="font-display text-5xl text-korea"
          style={{ transform: "skewX(-6deg)" }}
        >
          월드컵 아카이브
        </h1>
        <p className="text-muted mt-2">
          역대 FIFA 월드컵을 경기 · 선수 · 기록으로 탐험하세요.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {TOURNAMENTS.map((t, i) => (
          <Link key={t.year} href={`/world-cup/${t.year}`} className="block">
            <div
              className="kx-pop flex h-full flex-col items-center gap-3 rounded-xl border bg-panel p-5 text-center transition-all border-line hover:-translate-y-1 hover:border-korea"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <img
                src={emblemSmall(t.year)}
                alt={`${t.year} 월드컵 엠블럼`}
                className="h-20 w-20 object-contain"
              />
              <div>
                <div className="font-display text-2xl">{t.year}</div>
                <div className="mt-0.5 text-xs text-muted">{t.nameKo}</div>
              </div>
              {t.status === "live-snapshot" ? (
                <span className="rounded border border-korea/50 bg-korea/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-korea">
                  LIVE 스냅샷
                </span>
              ) : (
                <span className="text-xs font-medium text-korea">탐험 →</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
