import Link from "next/link";
import { TOURNAMENTS, emblemSmall } from "@/lib/tournaments";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-6 sm:p-8">
      <header className="mb-8">
        <h1 className="font-display text-5xl text-korea" style={{ transform: "skewX(-6deg)" }}>
          월드컵 아카이브
        </h1>
        <p className="text-muted mt-2">역대 FIFA 월드컵을 경기 · 선수 · 기록으로 탐험하세요.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {TOURNAMENTS.map((t, i) => {
          const inner = (
            <div
              className={`kx-pop flex h-full flex-col items-center gap-3 rounded-xl border bg-panel p-5 text-center transition-all border-line hover:-translate-y-1 hover:border-korea`}
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
              {/* TODO(task6): distinguish archive-complete vs live-snapshot visually */}
              <span className="text-xs font-medium text-korea">탐험 →</span>
            </div>
          );
          return (
            <Link key={t.year} href={`/world-cup/${t.year}`} className="block">
              {inner}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
