# 월드컵 아카이브 — 설계 문서 (Design Spec)

- 작성일: 2026-06-15
- 상태: office-hours 검토 완료 (builder 모드). MVP = 2002 전체, 병렬 에이전트 활용.
- 한 줄 요약: 2002~2022 FIFA 월드컵을 전 경기 선발/교체 라인업까지 한국어로 탐색하는 인터랙티브 아카이브. 이후 2026 라이브 허브 확장.

---

## 1. 목표 & 성격

- **본질은 데이터 정제형 아카이브.** Next.js는 표현 층이고, 승부는 데이터 파이프라인 + 출처/라이선스 관리 + 검증에서 난다.
- 핵심 사용자 경험: "2002 대한민국 vs 폴란드"를 누르면 선발 11명, 교체 투입, 득점, 카드, 감독, 조별 순위, 선수 사진까지 한 화면에서 보는 **디지털 경기 기록관**.
- HARD 요구: **전 경기(조별+토너먼트) 선발 XI + 교체 데이터 완성** (2002~2022, 6개 대회 × 64경기 = 384경기).

## 2. 범위 & 단계

| 단계 | 내용 | 산출 |
|---|---|---|
| **Phase 0** | 2002 데이터 import + 검증 | 2002 D조 그라운드트루스 통과, 경기당 선발 22명 추출 |
| **Phase 1 (MVP)** | 2002 대회 완성 | 64경기/32팀/선수/디자인 확정. 첫 화면 = 한국 팀페이지 + 한국vs폴란드 경기페이지 |
| **Phase 2** | 2006~2022 확장 | 통합 검색, 대회별 포인트컬러, 국가별 히스토리 |
| **Phase 3** | 2026 라이브 허브 | 일정/스코어/딥링크 + 자체 채팅 |

- **MVP = Phase 0 + Phase 1 (2002 전체 — 64경기/32팀).** 품질 기준을 2002로 확정한 뒤 같은 파이프라인을 5개 대회로 복제.
- **구현 메모 (office-hours)**: Phase 1 데이터 정제·검증·페이지 생성은 **병렬 sub-agent로 분할 처리**(대회/조/팀/경기 단위)해 속도 확보. "한 팀 wedge(A안)" 대신 전체 2002(B안)를 택한 이유 = 병렬화로 광범위 스코프의 속도 단점 상쇄.

## 3. 데이터 아키텍처 (프로젝트의 80%)

### 3.1 출처 (검증 완료, 2026-06-15)

| 출처 | 역할 | 라이선스 | 비고 |
|---|---|---|---|
| **Fjelstul World Cup DB** (`github.com/jfjelstul/worldcup`) | **메인 스파인** | **CC-BY-SA 4.0 (카피레프트)** | 2002~2022 전 64경기 선발/교체 완비(실측: WC2022 선발 1408=64×22, 빈칸 0). 포지션 라벨·등번호 포함. **특정 commit SHA 고정** 필수 |
| **OpenFootball `worldcup.more`** | 교차검증 | **CC0** | 라인업은 `.more` 레포의 `.txt` DSL에만. 메인/json 레포엔 없음. 스코어/스탠딩/득점 대조용 |
| **Wikipedia** (경기별 페이지) | 보강원 | CC-BY-SA (사실은 자유) | Fjelstul 약점 보강: ①포메이션/전술배치 ②경기별 미출전 벤치 ③한글 선수명 |
| **StatsBomb Open Data** | **내부 QA만** | 독점 (재배포·상업 금지) | 2018/2022 라인업 검증용. **절대 배포 금지** — 공개 게시 = 약관 위반 |
| **나무위키** | 비공식 대조만 | CC-BY-NC-SA 2.0 KR (비영리) | 본문/표 복붙 금지. 단서 얻고 Wikipedia/Fjelstul로 검증. 한글명 대조 보조 |
| **Wikimedia Commons + Wikidata** | 선수 사진 | 혼합 (CC-BY/-SA/CC0/PD) | 사진 파이프라인. 아래 3.3 |

### 3.2 Fjelstul 처리 주의 (검증된 함정)

- **CC-BY-SA = 카피레프트.** 우리가 가공·배포하는 데이터셋도 CC-BY-SA 4.0 의무 + 출처표기. → 코드는 별도 라이선스로 분리, 데이터는 CC-BY-SA로 공개. `/sources`에 의무 표기 블록(저자 Joshua C. Fjelstul Ph.D., © 2023, 라이선스 링크, repo 링크, 수정 고지).
- **미출전 벤치는 `player_appearances`에 없음** (피치 밟은 선수만). 명단 전체는 `squads`(대회 단위). → 경기별 미출전 벤치는 Wikipedia로 보강.
- **포메이션/좌표 없음.** position_name은 역할 라벨. → 피치 포메이션은 Wikipedia football box로 보강, 없으면 GK/DF/MF/FW 자동 배치.
- DESCRIPTION 메타 stale(2018이라 표기) — 데이터 파일을 신뢰. master 변동 대비 **commit SHA 고정**.

### 3.3 사진 파이프라인 (빌드타임 배치)

1. 자체 명단(Fjelstul/Wikipedia) → 선수명 → Wikidata QID (**P1344 쓰지 말 것** — 모델링 갭. `wbsearchentities`/sitelink로 해석)
2. Wikidata `P18` → Commons 파일명
3. Commons `imageinfo` + `iiprop=url|extmetadata` → 이미지 URL + 저작자(Artist) + 라이선스(LicenseShortName/LicenseUrl)
4. **자체 서버/CDN에 미러** (런타임 핫링크 금지), 라이선스 JSON 저장
5. 표시 가능한(라이선스 명확) 이미지만 노출. **fallback 아바타** = 국기색 + 이니셜/등번호 (없으면 기본)

- **커버리지 현실**: 2002 ~68% → 2006 85% → 2010 92% → 2014 96% → 2018 97%. 2002 벤치/무명 선수는 사진 자주 없음 → fallback 필수.
- **User-Agent 필수**: `WorldCupArchive/1.0 (+https://worldcup.minseok91.cloud; <email>)`. throttle. 익명 IP는 ~10 req/min로 떨어짐.
- 표시 의무: CC-BY/CC-BY-SA = 저작자 + 라이선스명(딥링크) + Commons 파일페이지 링크. CC0/PD = 법적 의무 없으나 출처 표기.
- **Getty/AP/Reuters/FIFA 방송 캡처 = 사용 금지** (저작권 침해).

### 3.4 한글화

- 국가명·유명선수 = 수동 매핑 JSON. Wikidata ko 라벨 보조. 나머지 원문 우선 + 한글 선택 입력.
- 이름 정규화 패스(전사 오류 대비).

### 3.5 검증 (회귀 테스트)

- 경기당: 양 팀 각 선발 11명(합 22), 교체 수 규정 내, `player_appearances` vs `substitutions` 무모순.
- 조별: 팀 승/무/패·득실 합계 = `group_standings` 일치.
- 사진: 노출 이미지에 라이선스/저작자/출처 존재.
- **그라운드트루스(2002 D조)**: KOR 7점 1위(폴란드 2-0, 미국 1-1, 포르투갈 0-1), 최종 KOR 7 / USA 4 / POR 3 / POL 3. import 결과가 이와 불일치하면 빌드 실패 처리.

### 3.6 산출물

- `data/generated/*.json` (대회/팀/경기/선수/사진메타) → 빌드 인풋. **런타임 DB 없음.**

## 4. 사이트 구조 (라우트)

```
/                                      랜딩 (대회 타임라인 2002→2022)
/world-cup/[year]                      대회 메인: 조별순위 + 토너먼트 브래킷
/world-cup/[year]/groups/[group]       조 상세
/world-cup/[year]/teams/[teamSlug]     국가: 명단, 경기별 선발/교체, 주전 집계
/world-cup/[year]/matches/[matchSlug]  경기: 스코어/선발XI 피치/교체·카드 타임라인
/players/[playerSlug]                  선수: 출전기록, 사진+라이선스
/search                                통합검색 (정적 인덱스)
/sources                               출처·라이선스 (의무 표기)
```

## 5. 기술 스택 & 배포

- **Next.js App Router + TypeScript** — 정적 SSG (역사 데이터 불변). 런타임 DB 없음.
- **Tailwind CSS + shadcn/ui + Framer Motion**.
- 검색: 정적 인덱스 (Pagefind 또는 prebuilt JSON + Fuse.js).
- 이미지: `next/image` + 자체 미러 + fallback 아바타 컴포넌트.
- 데이터: 빌드타임 import/검증 스크립트(`scripts/`) → `data/generated/`.
- 배포: **개인서버** `worldcup.minseok91.cloud`. Docker(Next standalone) + Caddy(자동 HTTPS). Phase 3 라이브/채팅 ws 서비스를 같은 박스에 추가.

## 6. 디자인 시스템 — "키네틱 스포츠" (시안 6 베이스)

### 6.1 방향
- 다크 차콜 배경(`#0e1016`) + **코리아 레드 `#e4002b`** 에너지. 콘덴스드 헤비 디스플레이(Black Han Sans / Anton), 대각 skew, 모션 스트릭, 역동.
- 국가별 포인트컬러로 변주.

### 6.2 규율 (중요 — 비판 반영)
- **키네틱 = 브랜드/히어로/전환/포인트 언어로 한정.** 히어로, 대회/경기 인트로, 네비, 강조 숫자에 사용.
- **데이터 레이어(표·명단·통계)는 차분·고가독.** skew/스트릭 최소화, 정렬·여백 우선. 384경기 밀도 견디게.
- **모션 접근성**: `prefers-reduced-motion: reduce` 시 스트릭/슬라이드/스큐 애니 비활성, 정적 폴백.
- 대비/명도 WCAG AA. 레드 위 텍스트는 흰색/충분 대비.

### 6.3 핵심 컴포넌트
`TournamentTimeline` / `GroupBoard` / `MatchRoom`(피치 라인업+타임라인) / `PlayerCard`(사진+라이선스) / `SourceDrawer` / `KineticHero` / `FallbackAvatar`.

## 7. 2026 라이브 허브 (Phase 3, 참고)

- 데이터: `openfootball/worldcup.json` (CC0) = 일정/결과/득점. 라이브 라인업 필요 시 API-Football(무료 100req/일 — 경기일엔 부족, 캐시 필수) 또는 유료.
- **영상 임베드 불가** (JTBC 독점/디지털=치지직 단독, 임베드 API 없음). → 공식 시청처 **딥링크 버튼만**.
- **v1 핵심 (office-hours P5 반박 반영)**: **라이브 기록카드** — 실시간 라인업/스코어를 아카이브 톤(키네틱)으로 보여줌 + 공식 딥링크. 이게 허브의 진짜 가치.
- 채팅: **후순위/컷 가능.** 영상 없고 자체 채팅 비면 유령도시 리스크. 트래픽 확인 후 자체 채팅(우리 ws 서버) 도입. 치지직 채팅 릴레이는 공식 API 불가(본인 채널만), 비공식 경로는 ToS 위반·차단 위험 → 미채택.
- 치지직 공식 API = 라이브 목록/상태 조회 + 딥링크에만 사용.

## 8. 리스크 & 결정 기록

- **R1 라이선스**: Fjelstul CC-BY-SA 카피레프트 수용 → 데이터셋 CC-BY-SA 공개, 코드 분리. StatsBomb 배포 금지(QA만).
- **R2 사진 갭**: 2002 ~30% 누락 → fallback 아바타 필수, 빌드타임 미러.
- **R3 포메이션/벤치 갭**: Fjelstul에 없음 → Wikipedia 보강, 없으면 포지션 자동배치.
- **R4 키네틱 가독성**: 데이터 레이어 분리 + reduced-motion으로 완화.
- **결정**: 정적 SSG(DB 없음) / 개인서버 배포 / 2002 전체 MVP(병렬 에이전트) / 디자인 시안 6.
- **office-hours 결과 (2026-06-15, builder 모드)**:
  - P5 반박 수용 → 2026 허브 v1 = 라이브 기록카드 + 딥링크. 채팅 후순위/컷 가능.
  - fallback 아바타는 키네틱 톤으로 **확실히 이쁘게** (2002 사진 갭 ~30% → 안 그러면 빈자리 티남).
  - MVP wedge: A안(한국 7경기) 검토했으나 사용자가 B안(2002 전체) + 병렬 에이전트 선택.

## 9. MVP 수용 기준 (Phase 1 완료 정의)

- `/world-cup/2002` 에서 A~H 조별 순위 + 브래킷 표시. 수치가 그라운드트루스와 일치.
- `/world-cup/2002/teams/korea-republic` 에서 명단·경기별 선발/교체·주전 집계 표시.
- `/world-cup/2002/matches/...` (한국vs폴란드 포함) 에서 선발 22명·교체·득점·카드·피치 라인업 표시.
- 선수 사진 있으면 표시(+라이선스), 없으면 fallback 아바타.
- `/sources` 에 Fjelstul 등 의무 표기.
- 검증 스크립트 전부 통과 (그라운드트루스 포함).
- 시안 6 디자인 언어 적용 + reduced-motion 폴백 동작.
