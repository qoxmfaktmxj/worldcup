import Link from "next/link";

export default function SourcesPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1
        className="font-display text-5xl text-korea"
        style={{ transform: "skewX(-6deg)" }}
      >
        출처 · 라이선스
      </h1>
      <p className="text-muted mt-1">
        본 아카이브가 사용한 데이터와 라이선스입니다.
      </p>

      <div className="mt-6 space-y-4">
        {/* Card 1 */}
        <div className="bg-panel border border-line rounded-lg p-4">
          <p className="font-medium">
            경기 데이터 — Fjelstul World Cup Database{" "}
            <span className="text-muted text-sm font-normal">CC BY-SA 4.0</span>
          </p>
          <p className="text-sm text-muted leading-relaxed mt-2">
            © 2023 Joshua C. Fjelstul, Ph.D. 데이터를 각 대회 기준으로
            정제·한글화·재구성했습니다. 본 사이트의 가공 데이터셋 또한 CC
            BY-SA 4.0으로 제공됩니다.
          </p>
          <p className="text-sm mt-2">
            <a
              href="https://github.com/jfjelstul/worldcup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-korea hover:underline"
            >
              저장소
            </a>{" "}
            ·{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-korea hover:underline"
            >
              라이선스 전문
            </a>
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-panel border border-line rounded-lg p-4">
          <p className="font-medium">
            교차검증 — OpenFootball{" "}
            <span className="text-muted text-sm font-normal">
              CC0 (퍼블릭 도메인)
            </span>
          </p>
          <p className="text-sm text-muted leading-relaxed mt-2">
            스코어·순위·득점 교차검증에 사용했습니다.
          </p>
          <p className="text-sm mt-2">
            <a
              href="https://github.com/openfootball/worldcup.more"
              target="_blank"
              rel="noopener noreferrer"
              className="text-korea hover:underline"
            >
              openfootball/worldcup.more
            </a>
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-panel border border-line rounded-lg p-4">
          <p className="font-medium">
            보강 — Wikipedia{" "}
            <span className="text-muted text-sm font-normal">
              사실 자료 · 문서는 CC BY-SA 4.0
            </span>
          </p>
          <p className="text-sm text-muted leading-relaxed mt-2">
            포메이션·미출전 명단·한글 표기 보강에 참고했습니다. 사실(스코어·라인업
            등)은 저작권 대상이 아닙니다.
          </p>
          <p className="text-sm mt-2">
            <a
              href="https://en.wikipedia.org/wiki/2002_FIFA_World_Cup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-korea hover:underline"
            >
              2002 FIFA World Cup
            </a>{" "}
            ·{" "}
            <a
              href="https://en.wikipedia.org/wiki/2006_FIFA_World_Cup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-korea hover:underline"
            >
              2006 FIFA World Cup
            </a>
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-panel border border-line rounded-lg p-4">
          <p className="font-medium">
            선수 사진 — Wikimedia Commons{" "}
            <span className="text-muted text-sm font-normal">
              이미지별 라이선스
            </span>
          </p>
          <p className="text-sm text-muted leading-relaxed mt-2">
            선수 사진은 Wikimedia Commons의 자유 라이선스(CC BY / CC BY-SA / CC0
            / PD) 이미지만 사용하며, 저작자·라이선스는 각 선수 카드에
            표기합니다. 사진이 없는 선수는 대체 아바타로 표시합니다.
          </p>
          <p className="text-sm mt-2">
            <a
              href="https://commons.wikimedia.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-korea hover:underline"
            >
              Wikimedia Commons
            </a>
          </p>
        </div>

        {/* Card 5 */}
        <div className="bg-panel border border-line rounded-lg p-4">
          <p className="font-medium">
            대회 엠블럼{" "}
            <span className="text-muted text-sm font-normal">© FIFA · 상표</span>
          </p>
          <p className="text-sm text-muted leading-relaxed mt-2">
            각 월드컵 엠블럼·로고의 모든 권리는 FIFA에 있습니다. 본 아카이브는
            비영리·식별 목적으로만 표시합니다.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="text-muted hover:text-korea transition-colors text-sm"
        >
          ← 홈
        </Link>
      </div>
    </main>
  );
}
