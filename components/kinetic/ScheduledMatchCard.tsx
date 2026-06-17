import type { GroupStanding, Match, WatchLink } from "@/lib/types";
import { roundLabel } from "@/lib/stages";
import { teamPrimary } from "@/lib/teamColors";
import { toKstLabel } from "@/lib/time";
import { GroupBoard } from "./GroupBoard";
import { StreakBg } from "./StreakBg";

export function ScheduledMatchCard({
  m,
  year,
  standings,
  watchLinks,
}: {
  m: Match;
  year: number;
  standings: GroupStanding[];
  watchLinks: WatchLink[];
}) {
  const homeColor = teamPrimary(m.home.name);
  const awayColor = teamPrimary(m.away.name);

  const groupStanding = standings.find((s) => s.group === m.group);

  const matchLinks = watchLinks.filter(
    (w) => (w.scope === "match" && w.matchId === m.id) || w.scope === "tournament"
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-ink p-6">
        <StreakBg />
        <div className="relative">
          <div
            className="kx-slide inline-block bg-korea px-3 py-1 text-xs font-medium tracking-wider"
            style={{ transform: "skewX(-12deg)" }}
          >
            <span style={{ display: "inline-block", transform: "skewX(12deg)" }}>
              {year} 월드컵 · {roundLabel(m.group, m.stage)} · {m.city}
            </span>
          </div>

          {/* "예정" badge + team names */}
          <div
            className="kx-slide mt-4 font-display"
            style={{ transform: "skewX(-6deg)" }}
          >
            <div className="flex items-center gap-4 flex-wrap">
              {/* Home team */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-5 w-1.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: homeColor }}
                />
                <span className="text-2xl">{m.home.nameKo}</span>
              </div>

              {/* 예정 badge */}
              <span className="text-4xl font-display text-korea px-3">예정</span>

              {/* Away team */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{m.away.nameKo}</span>
                <span
                  className="inline-block h-5 w-1.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: awayColor }}
                />
              </div>
            </div>
          </div>

          {/* Kickoff + venue */}
          <div
            className="kx-slide mt-2 text-sm text-muted"
            style={{ transform: "skewX(-6deg)", animationDelay: ".1s" }}
          >
            {m.kickoffUtc ? toKstLabel(m.kickoffUtc) : m.date} · {m.stadium}
            {m.city ? ` · ${m.city}` : ""}
            {m.country ? `, ${m.country}` : ""}
          </div>
        </div>
      </div>

      {/* 라인업 공개 전 notice */}
      <div className="rounded-lg border border-line bg-panel/40 p-4 text-sm text-muted">
        라인업 공개 전 — 경기 시작 전에 공개됩니다.
      </div>

      {/* 조별 순위 */}
      {groupStanding && m.groupStage && (
        <div>
          <h3
            className="font-display text-base mb-3 text-muted"
            style={{ transform: "skewX(-6deg)" }}
          >
            조별 순위 영향
          </h3>
          <GroupBoard g={groupStanding} year={year} />
        </div>
      )}

      {/* 중계 링크 */}
      {matchLinks.length > 0 && (
        <div>
          <h3
            className="font-display text-base mb-3 text-muted"
            style={{ transform: "skewX(-6deg)" }}
          >
            중계 링크
          </h3>
          <div className="flex flex-wrap gap-2">
            {matchLinks.map((w, i) => (
              <a
                key={i}
                href={w.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded border border-line bg-panel/60 px-3 py-1.5 text-sm hover:border-korea hover:text-korea transition-colors"
              >
                {w.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
