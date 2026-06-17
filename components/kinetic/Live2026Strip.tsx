import Link from "next/link";
import type { Match } from "@/lib/types";
import { kstDateKey, toKstLabel } from "@/lib/time";
import { TeamLabel } from "./TeamLabel";

interface Props {
  matches: Match[];
  asOf?: string;
}

function todayKst(): string {
  return kstDateKey(new Date().toISOString());
}

function tomorrowKst(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  // Shift by +9h to approximate KST date boundary
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function Live2026Strip({ matches, asOf }: Props) {
  const today = todayKst();
  const tomorrow = tomorrowKst();

  // 오늘·내일 경기 (KST 기준)
  const todayTomorrow = matches.filter((m) => {
    if (!m.kickoffUtc) return false;
    const dk = kstDateKey(m.kickoffUtc);
    return dk === today || dk === tomorrow;
  });

  // 없으면 예정된 경기 중 가장 이른 4개
  const upcoming = matches
    .filter((m) => m.status === "scheduled" && m.kickoffUtc)
    .sort((a, b) => (a.kickoffUtc! > b.kickoffUtc! ? 1 : -1));

  const displayMatches = todayTomorrow.length > 0 ? todayTomorrow : upcoming.slice(0, 4);

  // 대한민국 다음 예정 경기
  const koreaNext = upcoming.find(
    (m) => m.home.code === "KOR" || m.away.code === "KOR",
  );

  // 대한민국 최근 종료 경기
  const koreaFinished = matches
    .filter(
      (m) =>
        m.status === "finished" &&
        (m.home.code === "KOR" || m.away.code === "KOR"),
    )
    .sort((a, b) => (a.kickoffUtc! < b.kickoffUtc! ? 1 : -1))[0];

  return (
    <section className="rounded-xl border border-line bg-panel p-6">
      {/* 헤더 */}
      <div className="mb-5 flex flex-wrap items-end gap-x-4 gap-y-1">
        <h2
          className="font-display text-4xl text-korea"
          style={{ transform: "skewX(-6deg)" }}
        >
          2026 FIFA 월드컵
        </h2>
        <p className="text-sm text-muted">
          북중미 · 진행 중
          {asOf ? <span className="text-korea"> ({asOf} 기준)</span> : ""}
        </p>
      </div>

      {/* 오늘·내일 경기 */}
      <div className="mb-6">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
          {todayTomorrow.length > 0 ? "오늘·내일 경기" : "다음 예정 경기"}
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayMatches.length === 0 ? (
            <p className="text-sm text-muted">예정 경기가 없습니다.</p>
          ) : (
            displayMatches.map((m) => (
              <Link
                key={m.id}
                href={`/world-cup/2026/matches/${m.slug}`}
                className="min-w-[180px] flex-shrink-0 rounded-lg border border-line bg-ink p-3 hover:border-korea transition-colors"
              >
                <div className="mb-1.5 text-[11px] text-muted">
                  {m.kickoffUtc ? toKstLabel(m.kickoffUtc) : m.date}
                </div>
                <div className="flex flex-wrap items-center gap-x-1.5 font-display text-sm leading-snug">
                  <TeamLabel name={m.home.name} nameKo={m.home.nameKo} />
                  {m.status === "finished" ? (
                    <span className="text-korea">
                      {m.homeScore}:{m.awayScore}
                    </span>
                  ) : (
                    <span className="text-muted-dim">vs</span>
                  )}
                  <TeamLabel name={m.away.name} nameKo={m.away.nameKo} barSide="right" />
                </div>
                <div className="mt-1 text-[11px] text-muted truncate">
                  {m.stadium}
                </div>
                {m.status === "scheduled" && (
                  <div className="mt-1 text-[10px] text-muted-dim">예정</div>
                )}
              </Link>
            ))
          )}
        </div>
      </div>

      {/* 대한민국 카드 */}
      <div className="mb-6 rounded-lg border border-korea/30 bg-korea/5 p-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-korea">
          대한민국
        </div>
        {koreaNext ? (
          <div className="mb-3">
            <div className="text-[11px] text-muted mb-1">다음 경기</div>
            <Link
              href={`/world-cup/2026/matches/${koreaNext.slug}`}
              className="group block"
            >
              <div className="flex items-center gap-1.5 font-display text-base leading-snug group-hover:text-korea transition-colors">
                vs{" "}
                <TeamLabel
                  name={(koreaNext.home.code === "KOR" ? koreaNext.away : koreaNext.home).name}
                  nameKo={(koreaNext.home.code === "KOR" ? koreaNext.away : koreaNext.home).nameKo}
                />
              </div>
              <div className="mt-0.5 text-[11px] text-muted">
                {koreaNext.kickoffUtc
                  ? toKstLabel(koreaNext.kickoffUtc)
                  : koreaNext.date}{" "}
                · {koreaNext.stadium}
              </div>
            </Link>
          </div>
        ) : (
          <div className="mb-3 text-sm text-muted">예정 경기 없음</div>
        )}

        {koreaFinished && (
          <div>
            <div className="text-[11px] text-muted mb-1">최근 결과</div>
            <Link
              href={`/world-cup/2026/matches/${koreaFinished.slug}`}
              className="group block"
            >
              <div className="flex flex-wrap items-center gap-x-1.5 font-display text-sm group-hover:text-korea transition-colors">
                <TeamLabel name={koreaFinished.home.name} nameKo={koreaFinished.home.nameKo} />
                <span className="text-korea">
                  {koreaFinished.homeScore}:{koreaFinished.awayScore}
                </span>
                <TeamLabel name={koreaFinished.away.name} nameKo={koreaFinished.away.nameKo} barSide="right" />
              </div>
            </Link>
          </div>
        )}

        <div className="mt-3">
          <Link
            href="/world-cup/2026/korea"
            className="text-xs font-medium text-korea hover:underline"
          >
            대한민국 전체 일정 →
          </Link>
        </div>
      </div>

      {/* CTA 버튼 */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/world-cup/2026/schedule"
          className="rounded-lg border border-line bg-panel px-4 py-2 text-sm hover:border-korea transition-colors"
        >
          전체 일정 →
        </Link>
        <Link
          href="/world-cup/2026/korea"
          className="rounded-lg border border-korea bg-korea/10 px-4 py-2 text-sm text-korea hover:bg-korea/20 transition-colors"
        >
          대한민국 →
        </Link>
        <Link
          href="/archive"
          className="rounded-lg border border-line bg-panel px-4 py-2 text-sm hover:border-korea transition-colors"
        >
          역대 아카이브 →
        </Link>
      </div>
    </section>
  );
}
