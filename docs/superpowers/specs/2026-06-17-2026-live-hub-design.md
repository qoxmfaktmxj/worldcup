# 2026 현황 허브 + 아카이브 통합 — 설계 스펙

작성일: 2026-06-17
상태: 승인됨 (브레인스토밍 완료)

## 제품 컨셉

"2026 월드컵을 **정직한 현황**으로 보고, 끝나면 그대로 역사 아카이브가 되는 한국어 월드컵 데이터 사이트."

핵심 원칙(기존 유지): 디자인·상호작용 1순위, 데이터 정확성 2순위(**추측 금지**), 정적 SSG·런타임 DB 없음.

라이브 데이터 피드가 없으므로(2026 데이터 = 수동 웹 스냅샷) "라이브 방송 대시보드"는 만들지 않는다. 대신 **"N월N일 기준 현황 + 일정 + 한국 분석"** 으로 정직하게 제시한다.

## 비범위 (YAGNI — 명시적 제외)

- 실시간 스코어/경기중 타임라인/LIVE 배지/자동 갱신 (피드 없음)
- 실시간 채팅, 응원 리액션 누적 (무DB·정적 정체성 유지)
- 치지직 Live/Chat API 자동 탐색·중계
- cron GitHub Action 자동 데이터 커밋
- 백엔드/DB(Supabase/Upstash/Socket.IO)

중계는 **외부 공식 링크 허브**(임베드 X)로만. 영상 권리 이슈 회피.

## 정보 구조 (라우트)

```
/                          2026 featured 상단 + 역대 7개 대회 그리드 하단
/archive                   역대 대회 그리드 (현재 / 의 그리드를 이전)
/world-cup/2026            2026 메인(조 순위 + 한국 요약 + 일정 요약 + 중계)
/world-cup/2026/schedule   전체 일정 (KST, 매치데이/날짜 탭)
/world-cup/2026/korea      대한민국 트래커 + 진출 시나리오
/world-cup/2026/third-place 3위 와일드카드 경쟁표
/world-cup/2026/venues     경기장/도시 (시차 표기)
/world-cup/2026/watch      중계 링크 허브
기존 유지: /world-cup/[year], /bracket, /groups/[group], /matches/[slug],
          /teams/[slug], /players/[slug], /search, /sources
```

아카이브를 묻지 않는다: 메인 하단에 7개 대회 그리드를 그대로 두고, 상단에 2026 현황을 얹는다.

## 데이터 모델

`lib/types.ts`:
- `TournamentStatus = "archive-complete" | "live-snapshot"`. `TournamentMeta.available: boolean`을 `status`로 대체. `availableYears()`는 status가 설정된 대회(현재 7개 전부)를 반환. 2002–2022 = archive-complete, 2026 = live-snapshot.
- `Match`에 추가: `status: "scheduled" | "finished"`, `kickoffUtc?: string`, `venueId?: string`. 기존 `stadium/city`에 더해 `country?` 추가.
  - `scheduled`: homeScore/awayScore 미사용(예정), lineups 빈 배열.
  - `finished`: 현행과 동일(스코어/라인업).
  - live/halftime/postponed 등은 만들지 않음.
- `Venue { id; fifaName; commonName?; city; country; timezone }`.
- `WatchLink { matchId?; scope: "tournament"|"match"; provider; label; url; verifiedAt; note? }`.

데이터 파일(`data/generated/2026/`):
- `matches.json` — 전체 104경기. 진행=finished(스코어), 미진행=scheduled. 각 경기 kickoffUtc·venueId·group.
- `standings.json` — 12개 조 현황(기존).
- `venues.json` — 16개 경기장.
- `watch-links.json` — 큐레이션 중계 링크(수동).
- `tournament.json` — asOf 유지.

기존 2002–2022 데이터/타입과 호환 유지(상태 필드는 옵셔널, 과거 경기는 finished로 간주).

## 데이터 수집 (subagent + 검증)

> 구현 결과: 조별리그 진행 중이라 녹아웃 32강 대진이 미확정 → 추측 금지 원칙에 따라 **조별 72경기만 수집**(녹아웃은 팀 확정 후 추가). 아래 "104"는 대회 전체 규모이며, 현재 스냅샷은 72.

전체 104 픽스처(현재 가능한 조별 72)를 Sonnet 서브에이전트 병렬로 수집:
- 소스: Wikipedia "2026 FIFA World Cup" + 조별 페이지(A–L) + 매치데이 스케줄 + 경기장 목록. (FIFA/ESPN 보조)
- 수집 항목: 경기별 팀(코드)·조·kickoffUtc·venueId·status·(진행 시)스코어. 경기장: fifaName/commonName/city/country/timezone.

검증 pass(Opus 또는 교차 에이전트, adversarial):
- 총 104경기 · 각 팀 조별 정확히 3경기 · 경기장 16개 집합 내 · kickoffUtc 파싱 가능 · 조별리그 6/11–27 범위 · 진행경기에만 스코어.
- **추측 금지**: 불확실 필드는 비움. 진행 결과는 2+ 소스 일치 시에만 finished.

## 페이지 / 컴포넌트

- `Live2026Strip`(홈 featured): 오늘/내일 경기(KST, 새벽경기 자연스럽게), 한국 다음 경기 카드, 조 요약, [역대 아카이브 보기] 버튼.
- `KoreaTracker`(/korea): 현재 순위·남은 경기·다음 경기 카운트다운·**진출 시나리오 계산(순수함수, vitest)**·중계 링크.
- `ScheduleView`(/schedule): 매치데이(1/2/3·32강·…) + 날짜 탭, KST 라벨. `toKstLabel(kickoffUtc)` 유틸.
- `ThirdPlaceTable`(/third-place): 12개 조 3위 정렬(순수계산, 상위 8 진출권/탈락권 구분).
- `VenueCard`(/venues): fifaName·commonName·city·country·timezone·한국 시차·해당 경기.
- `WatchHub`(/watch): 네이버스포츠/치지직/JTBC·KBS/FIFA 링크.
- 매치 페이지 분기: `scheduled` → 예정 카드(킥오프 KST·경기장·중계 링크·"라인업 공개 전"·조 영향) / `finished` → 현행 아카이브 뷰(피치·득점·교체).
- 네비 갱신: `2026 | 일정 | 대한민국 | 아카이브 | 검색 | 출처`.

순수 계산 함수(테스트 대상): `toKstLabel`, 진출 시나리오, 3위 랭킹.

## 디자인 방향

기존 다크+키네틱 유지. 2026 섹션은 약간 더 "현황 대시보드" 밀도(큰 스코어/얇은 정보), 한국 카드 강조(레드/블루), 경기장 카드 도시색. 라이브 점멸 배지는 쓰지 않음(정직성).

## 실행 워크플로

`writing-plans`(Opus)로 단계별 계획 작성 → `subagent-driven-development`(Sonnet 서브에이전트 병렬: 데이터 수집 + 컴포넌트/페이지) → **Opus 검토**(verification-before-completion). 각 단계 커밋·빌드·테스트 게이트.

- **P0**: 타입(status)·홈 분리(/archive)·2026 fixture 풀데이터+검증·매치 분기·KST 일정·한국 트래커.
- **P1**: 3위표·경기장·중계 허브·네비 갱신·GitHub Actions CI(build/test/validate).

## 성공 기준

- 메인 상단 2026 현황(오늘/한국/순위) + 하단 아카이브 그리드, 둘 다 동작.
- 2026 전체 104경기 일정 KST 표시, 진행/예정 구분, 추측 데이터 0.
- 한국 트래커·진출 시나리오·3위표 정확(순수함수 테스트 통과).
- 매치 페이지 예정/완료 분기, 빈 라인업에서 "라인업 공개 전".
- 기존 2002–2022 아카이브 무손상, 빌드 green, tsc·테스트 통과, CI 추가.
- 라이브/채팅/백엔드 미도입(정적 유지).

## 커밋 시퀀스(예상)

`feat: split archive index from live homepage` → `feat: tournament/match status model` → `feat: add 2026 full fixtures (KST) + venues` → `feat: scheduled vs finished match page` → `feat: Korea tracker + qualification scenarios` → `feat: schedule view (KST matchdays)` → `feat: third-place race + venues + watch hub` → `ci: build/test/validate workflow`.
