import { teamPrimary } from "@/lib/teamColors";

// 국가명 앞(또는 뒤)에 대표 킷 컬러 바를 붙여 일관되게 표시.
// name = Fjelstul 영문명(색 조회용), nameKo = 표시 한글명.
export function TeamLabel({
  name,
  nameKo,
  barSide = "left",
  barClass = "h-3.5 w-1",
  className = "",
}: {
  name: string;
  nameKo: string;
  barSide?: "left" | "right";
  barClass?: string;
  className?: string;
}) {
  const bar = (
    <span
      className={`${barClass} shrink-0 rounded-sm`}
      style={{ background: teamPrimary(name) }}
      aria-hidden
    />
  );
  return (
    <span className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
      {barSide === "left" && bar}
      <span className="truncate">{nameKo}</span>
      {barSide === "right" && bar}
    </span>
  );
}
