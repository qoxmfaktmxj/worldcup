# 선수 카탈로그 (호버 프리뷰 + 상세 모달) — 설계 문서

- 작성일: 2026-06-15
- 상태: 검토 대기 (user review)
- 한 줄 요약: 선수 요소에 호버하면 프리뷰 팝오버, 클릭(모바일 탭)하면 큰 사진·이력·스탯이 담긴 모던 카탈로그 모달. Wikidata/Commons로 선수 메타데이터를 빌드타임 1회 수집해 JSON에 굽는다.

---

## 1. 목표
- 선수 탐색을 "한 화면에서 쫙" 보이게: 호버 프리뷰 → 클릭 모달.
- 표시 정보: 큰 프로필 사진, 이름 `한글이름 / English`(예: `박지성 / Ji-sung Park`, `리오넬 메시 / Lionel Messi`), 생년월일, 키, 출생지, 포지션, 2002 대회 스탯(우리 데이터), 소속팀 커리어, 짧은 소개, 출처.
- 디자인 1순위: 키네틱 톤 + **시인성(대비) 확보**.

## 2. 데이터 수집 (빌드타임 1회, 결과 커밋)

`scripts/enrich-players.ts`:
1. Fjelstul `players.csv`에서 우리 2002 출전 선수 `player_id` + **`player_wikipedia_link`** 추출. (위키 링크 = 정확 매칭 키. 이름검색 동명이인 회피.)
2. 위키 문서 title → Wikidata QID (Wikipedia API `prop=pageprops&ppprop=wikibase_item`, 또는 Wikidata `wbgetentities&sites=enwiki&titles=`).
3. QID → `wbgetentities`: 라벨 en/ko, sitelinks(kowiki=ko명·ko링크), **P569**(생년월일), **P2048**(키 cm), **P19**(출생지 QID), **P413**(포지션), **P18**(사진 파일), **P54**(소속팀 QID + start/end qualifier).
4. 참조 QID(P19 출생지, P54 클럽) → 라벨 배치 조회(ko 우선, 없으면 en).
5. P18 파일 → Commons `imageinfo`(url 320·1024폭, extmetadata: Artist/License/LicenseUrl/descriptionurl).
6. (옵션) Wikipedia REST 요약 한 문단(ko 우선, 없으면 en).
7. 사진을 `public/players/<player_id>.jpg`로 미러(1024폭).
- 캐시 `data/raw/2002/wikidata-cache.json`(QID·entity), 재실행 저렴.
- throttle(≤5 req/s), User-Agent `WorldCupArchive/1.0 (+https://worldcup.minseok91.cloud)`.
- **산출** `data/generated/2002/players-meta.json`: `{ [playerId]: { nameKo, nameEn, birthDate?, height?, birthPlace?, position?, clubs?:[{name,start?,end?}], bio?, wikiUrl?, image?: { url, author, license, licenseUrl, sourceUrl } } }`.
- **graceful**: 위키링크 없거나 필드 없으면 해당 항목 생략. 사진 없으면 fallback 아바타.
- **현실 주의**: ~700명 네트워크 배치 + 머신 부하 → 느리고 일부 실패 가능. 부분 성공해도 사이트는 정상(있는 것만 표시). 실패분은 캐시로 재시도.

### 한글명 일반화
- 이 배치가 채운 ko 라벨을 `players.ko.json`에도 병합 → 사이트 전역 한글명 개선(앞서 보류했던 트랙 흡수).
- 표시 규칙: ko 라벨 있으면 `ko / en`, 없으면 `en`만.

## 3. 컴포넌트 & 상호작용

- `PlayerAvatar` (server): `players-meta`에 사진 있으면 `next/image`로 사진, 없으면 기존 `FallbackAvatar`. 피치/칩/스쿼드/검색에 교체 투입.
- `PlayerTrigger` (client): 선수 참조(아바타+이름)를 감싼다.
  - **호버**(데스크탑): 200ms 지연 후 프리뷰 팝오버(사진 썸네일 + `ko / en` + 포지션 + "2002: 출전 N · 골 G"). 애니 fade+scale. 포커스에도 반응(키보드 접근).
  - **클릭/탭**: 모달 오픈.
  - 모바일(호버 없음): 탭 = 모달.
- `PlayerModal` (client, 풀스크린 오버레이 — `position:fixed` 실제 앱이라 허용): 좌측 큰 사진 패널(국가 레드 그라데이션 + 등번호 워터마크) + 우측 상세(이름 `ko / en`, 생년월일·키·출생지·포지션, 2002 스탯 타일 4개, 소속팀 커리어 타임라인, 소개 문단, 출처 한 줄(**작은 폰트 ~9-10px, 최소 강조**), "전체 페이지 ↗" 링크 → `/players/[slug]`). 키네틱(모션 스트릭·skew). ESC·배경클릭 닫기, 포커스 트랩, body 스크롤 잠금.
- 데이터 전달: 서버 컴포넌트가 `players-meta` 조회 + 우리 집계 스탯을 props로 `PlayerTrigger`에 전달(클라이언트 fetch 없음, 정적).
- `/players/[slug]` 페이지 유지(딥링크·SEO). 모달의 "전체 페이지"가 이리 연결.

## 4. 시인성 (대비) — 전역 + 신규

문제: `--color-muted-dim` #5a6070이 #0e1016 배경에서 대비 ~2.6:1 (WCAG AA 4.5:1 실패) → 안 보임.

수정:
- `--color-muted` #8a92a3 → **#a8aebb** (가독 보조 텍스트, ~7:1)
- `--color-muted-dim` #5a6070 → **#868d9c** (덜 강조, ~4.7:1, 그래도 가독)
- 규칙: **본문/라벨에 #5a6070급 이하 금지.** muted-dim은 최소 강조에만, 여전히 가독선 위.
- 전역 스캔: 기존 컴포넌트에서 다크-온-다크/저대비 텍스트 교정(특히 group board 미진출 행, 날짜·소계 텍스트). 콘텐츠 텍스트 최소 AA(4.5:1).
- 신규 컴포넌트(팝오버/모달)도 동일 기준.

## 5. 컴포넌트 배치(교체 지점)
- `MatchPitch`, `PlayerChip`, 팀 스쿼드 그리드, 검색 결과의 선수 항목 → `PlayerAvatar` + `PlayerTrigger`로 감싸기.

## 6. 리스크 & 결정
- **R1 위키링크 누락 선수**: 이름검색 폴백 OR 스킵(코어만). 기본=스킵(graceful), 동명이인 위험 회피.
- **R2 P54 파싱**(클럽+기간 qualifier 들쭉): 기간 없으면 클럽명만. 정렬은 start 있으면 그 순.
- **R3 네트워크 배치 부하**: 캐시 + throttle + 재시도. 부분 성공 허용.
- **R4 사진 라이선스**: Commons 자유 라이선스만, 저작자·라이선스 표기(모달 하단). Getty/AP 금지.
- **결정**: 위키링크 키 매칭 / players-meta.json 빌드 산출 / 호버+모달 / `/players` 페이지 유지 / 대비 토큰 상향.

## 7. 수용 기준
- `players-meta.json` 생성, 사진 `public/players/` 미러(가능분).
- 선수 호버 시 프리뷰 팝오버, 클릭 시 모달(사진·이름 ko/en·생년월일·키·포지션·2002스탯·소속팀·소개·출처). 없는 필드 숨김.
- 모바일 탭=모달. ESC/배경 닫기. 키보드 접근.
- 전역 텍스트 대비 AA 충족(다크-온-다크 제거).
- 빌드 통과, 기존 페이지 회귀 없음.
