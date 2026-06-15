# Player Catalog — Hover Preview + Detail Modal + Wikidata Enrichment (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hovering a player shows a preview popover; clicking (tapping) opens a modern catalog modal with photo, bilingual name, birthdate, height, birthplace, position, 2002 stats, club career, and a bio — backed by build-time Wikidata/Commons enrichment.

**Architecture:** A resilient enrichment script writes `players-meta.json` + mirrors photos to `public/players/` (committed). The UI is decoupled: `getPlayerCards` merges aggregate stats with optional meta, so hover/modal + fallback avatars work even if enrichment is partial/absent. A client `PlayerTrigger` wraps player references for hover popover + click modal. Contrast tokens are raised so text is readable on the dark theme.

**Tech Stack:** Next.js 16 (App Router, SSG) · TypeScript · Tailwind v4 · Wikidata/Commons APIs · next/image.

---

## File structure

```
lib/
  types.ts                       + PlayerImage, PlayerClub, PlayerMeta, PlayerCardData
  data.ts                        + getPlayersMeta, getPlayerCards
  pipeline/wikidata.ts           pure parsers (entity claims -> PlayerMeta) + tests
scripts/
  enrich-players.ts              Fjelstul wiki link -> Wikidata -> Commons -> players-meta.json + public/players/
data/generated/2002/
  players-meta.json              (committed; produced by enrich)
public/players/<id>.jpg          (committed photos; produced by enrich)
components/kinetic/
  PlayerAvatar.tsx               photo-or-fallback (server)
  PlayerModal.tsx                detail modal (client)
  PlayerTrigger.tsx              hover popover + click->modal (client)
app/globals.css                  raised contrast tokens
```

---

## Task 1: Types + card data layer (no network — UI works without enrichment)

**Files:** Modify `lib/types.ts`, `lib/data.ts`

- [ ] **Step 1: Append types to `lib/types.ts`**

```ts
export interface PlayerImage {
  url: string        // local mirrored path, e.g. /players/P-25724.jpg
  author: string
  license: string
  licenseUrl: string
  sourceUrl: string
}

export interface PlayerClub {
  name: string
  start?: string
  end?: string
}

export interface PlayerMeta {
  nameKo?: string
  nameEn?: string
  birthDate?: string
  height?: number
  birthPlace?: string
  position?: string
  clubs?: PlayerClub[]
  bio?: string
  wikiUrl?: string
  image?: PlayerImage
}

export interface PlayerCardData {
  id: string
  slug: string
  nameKo: string
  nameEn: string
  shirtNumber: number
  position: string
  teamNameKo: string
  stats: { matches: number; starts: number; subs: number; goals: number }
  meta: PlayerMeta | null
}
```

- [ ] **Step 2: Append loaders to `lib/data.ts`** (import `PlayerCardData`, `PlayerMeta`, `buildPlayers`)

```ts
export async function getPlayersMeta(year: number): Promise<Record<string, PlayerMeta>> {
  try {
    return JSON.parse(await readFile(path.join(dir(year), "players-meta.json"), "utf8")) as Record<string, PlayerMeta>;
  } catch {
    return {}; // enrichment optional — UI degrades gracefully
  }
}

export async function getPlayerCards(year: number): Promise<Record<string, PlayerCardData>> {
  const matches = await getMatches(year);
  const players = buildPlayers(matches);
  const meta = await getPlayersMeta(year);
  const out: Record<string, PlayerCardData> = {};
  for (const p of players) {
    const m = meta[p.id] ?? null;
    out[p.id] = {
      id: p.id,
      slug: p.slug,
      nameKo: m?.nameKo || p.nameKo,
      nameEn: m?.nameEn || p.nameEn,
      shirtNumber: p.shirtNumber,
      position: m?.position || p.position,
      teamNameKo: p.teamNameKo,
      stats: { matches: p.matches.length, starts: p.starts, subs: p.subs, goals: p.goals },
      meta: m,
    };
  }
  return out;
}
```
(`buildPlayers` is already imported in `data.ts` from `./aggregate`.)

- [ ] **Step 3: Commit** `git add lib/types.ts lib/data.ts && git commit -m "feat: player card data layer (stats + optional meta)"`

---

## Task 2: Contrast token fix (global readability)

**Files:** Modify `app/globals.css`

- [ ] **Step 1: Raise muted tokens in the `@theme` block**

Change:
```css
  --color-muted: #8a92a3;
  --color-muted-dim: #5a6070;
```
to:
```css
  --color-muted: #a8aebb;
  --color-muted-dim: #868d9c;
```

- [ ] **Step 2: Scan existing components for dark-on-dark / low-contrast text**

Run: `grep -rn "text-muted-dim\|#5a6070\|text-\[#5\|text-\[#6" app components`
For each hit that is body/label text (not a border/decoration), confirm it now reads on `#0e1016`. `text-muted-dim` is now `#868d9c` (~4.7:1) — acceptable. Leave borders as-is. No code change unless a literal dark hex is used for text.

- [ ] **Step 3: Commit** `git add app/globals.css && git commit -m "fix: raise muted text contrast on dark theme (WCAG AA)"`

---

## Task 3: Wikidata parsers (pure, TDD)

**Files:** Create `lib/pipeline/wikidata.ts`, `lib/pipeline/wikidata.test.ts`

These parse a Wikidata entity JSON (already fetched) into `PlayerMeta` fields — pure, testable without network.

- [ ] **Step 1: Write the failing test** `lib/pipeline/wikidata.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { parseTime, parseHeight, pickLabels } from "./wikidata";

describe("parseTime", () => {
  it("formats a Wikidata time value to YYYY.MM.DD", () => {
    expect(parseTime("+1981-02-25T00:00:00Z")).toBe("1981.02.25");
  });
  it("returns undefined for empty", () => {
    expect(parseTime(undefined)).toBeUndefined();
  });
});

describe("parseHeight", () => {
  it("reads metres and returns cm", () => {
    expect(parseHeight({ amount: "+1.78", unit: "http://www.wikidata.org/entity/Q11573" })).toBe(178);
  });
  it("reads centimetres directly", () => {
    expect(parseHeight({ amount: "+178", unit: "http://www.wikidata.org/entity/Q174728" })).toBe(178);
  });
});

describe("pickLabels", () => {
  it("prefers ko then en", () => {
    const labels = { ko: { value: "리오넬 메시" }, en: { value: "Lionel Messi" } };
    expect(pickLabels(labels)).toEqual({ ko: "리오넬 메시", en: "Lionel Messi" });
  });
});
```

- [ ] **Step 2: Run to verify fail** — `npm test` → FAIL (module missing).

- [ ] **Step 3: Implement `lib/pipeline/wikidata.ts`**

```ts
export function parseTime(t: string | undefined): string | undefined {
  if (!t) return undefined;
  const m = /^[+-](\d{4})-(\d{2})-(\d{2})/.exec(t);
  if (!m) return undefined;
  const [, y, mo, d] = m;
  return mo === "00" ? y : d === "00" ? `${y}.${mo}` : `${y}.${mo}.${d}`;
}

const Q_METRE = "Q11573";
const Q_CM = "Q174728";

export function parseHeight(v: { amount?: string; unit?: string } | undefined): number | undefined {
  if (!v?.amount) return undefined;
  const n = Number(v.amount);
  if (!Number.isFinite(n)) return undefined;
  if (v.unit?.includes(Q_METRE)) return Math.round(n * 100);
  if (v.unit?.includes(Q_CM)) return Math.round(n);
  return n < 3 ? Math.round(n * 100) : Math.round(n); // heuristic: <3 means metres
}

export function pickLabels(labels: Record<string, { value: string }> | undefined): { ko?: string; en?: string } {
  return { ko: labels?.ko?.value, en: labels?.en?.value };
}
```

- [ ] **Step 4: Run to verify pass** — `npm test` → PASS.
- [ ] **Step 5: Commit** `git add lib/pipeline/wikidata.ts lib/pipeline/wikidata.test.ts && git commit -m "feat: wikidata value parsers (time, height, labels) + tests"`

---

## Task 4: Enrichment script (network — resilient, best-effort)

**Files:** Create `scripts/enrich-players.ts`

Reliable matching: Fjelstul `players.csv` has `player_id` + `player_wikipedia_link` (an en.wikipedia URL). Resolve QID via the article title, not name search.

- [ ] **Step 1: Add `data:enrich` script to `package.json`** under scripts: `"data:enrich": "tsx scripts/enrich-players.ts"`.

- [ ] **Step 2: Implement `scripts/enrich-players.ts`**

```ts
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { parseTime, parseHeight, pickLabels } from "../lib/pipeline/wikidata";
import { fullName } from "../lib/pipeline/names";
import type { PlayerClub, PlayerMeta } from "../lib/types";

const UA = "WorldCupArchive/1.0 (+https://worldcup.minseok91.cloud)";
const CACHE = "data/raw/2002/wikidata-cache.json";

type Row = Record<string, string>;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url: string): Promise<any> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function loadCache(): Promise<Record<string, any>> {
  try { return JSON.parse(await readFile(CACHE, "utf8")); } catch { return {}; }
}

function titleFromWiki(link: string): string | undefined {
  const m = /\/wiki\/([^?#]+)/.exec(link || "");
  return m ? decodeURIComponent(m[1]) : undefined;
}

async function qidFromTitle(title: string): Promise<string | undefined> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&redirects=1&format=json&titles=${encodeURIComponent(title)}`;
  const j = await getJSON(url);
  const pages = j?.query?.pages ?? {};
  for (const k of Object.keys(pages)) {
    const q = pages[k]?.pageprops?.wikibase_item;
    if (q) return q;
  }
  return undefined;
}

async function entity(qid: string): Promise<any> {
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
  const j = await getJSON(url);
  return j?.entities?.[qid];
}

function claimValue(ent: any, prop: string): any {
  return ent?.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value;
}

async function labelsFor(qids: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (let i = 0; i < qids.length; i += 40) {
    const batch = qids.slice(i, i + 40);
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&props=labels&languages=ko|en&format=json&ids=${batch.join("|")}`;
    const j = await getJSON(url);
    for (const q of batch) {
      const l = j?.entities?.[q]?.labels;
      out[q] = l?.ko?.value || l?.en?.value || q;
    }
    await sleep(200);
  }
  return out;
}

async function commonsImage(file: string): Promise<PlayerMeta["image"]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1024&format=json&titles=${encodeURIComponent("File:" + file)}`;
  const j = await getJSON(url);
  const pages = j?.query?.pages ?? {};
  const info = pages[Object.keys(pages)[0]]?.imageinfo?.[0];
  if (!info) return undefined;
  const ext = info.extmetadata ?? {};
  const strip = (s?: string) => (s ? s.replace(/<[^>]+>/g, "").trim() : "");
  return {
    url: "", // set after mirroring
    author: strip(ext.Artist?.value) || "Wikimedia Commons",
    license: ext.LicenseShortName?.value || "",
    licenseUrl: ext.LicenseUrl?.value || "",
    sourceUrl: info.descriptionurl || "",
    _src: info.thumburl || info.url, // temp field for mirroring
  } as any;
}

async function mirror(srcUrl: string, id: string): Promise<string | undefined> {
  const res = await fetch(srcUrl, { headers: { "User-Agent": UA } });
  if (!res.ok) return undefined;
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir("public/players", { recursive: true });
  await writeFile(`public/players/${id}.jpg`, buf);
  return `/players/${id}.jpg`;
}

async function main() {
  const players = parse(await readFile("data/raw/2002/players.csv", "utf8"), { columns: true, skip_empty_lines: true, relax_column_count: true }) as Row[];
  // restrict to players who appear in our generated matches
  const apps = parse(await readFile("data/raw/2002/player_appearances.csv", "utf8"), { columns: true, skip_empty_lines: true, relax_column_count: true }) as Row[];
  const wanted = new Set(apps.map((a) => a.player_id));
  const cache = await loadCache();
  const meta: Record<string, PlayerMeta> = {};
  let done = 0;

  for (const p of players) {
    if (!wanted.has(p.player_id)) continue;
    const id = p.player_id;
    try {
      let ent = cache[id]?.entity;
      if (!ent) {
        const title = titleFromWiki(p.player_wikipedia_link);
        if (!title) continue; // graceful skip — no reliable match
        const qid = await qidFromTitle(title);
        if (!qid) continue;
        ent = await entity(qid);
        cache[id] = { qid, entity: ent };
        await sleep(220);
      }
      const labels = pickLabels(ent.labels);
      const m: PlayerMeta = {
        nameKo: labels.ko,
        nameEn: labels.en || fullName(p.given_name, p.family_name),
        birthDate: parseTime(claimValue(ent, "P569")?.time),
        height: parseHeight(claimValue(ent, "P2048")),
        wikiUrl: ent.sitelinks?.kowiki?.url || ent.sitelinks?.enwiki?.url,
      };
      const bp = claimValue(ent, "P19")?.id;
      const clubClaims = (ent.claims?.P54 ?? []).map((c: any) => ({
        qid: c.mainsnak?.datavalue?.value?.id,
        start: parseTime(c.qualifiers?.P580?.[0]?.datavalue?.value?.time),
        end: parseTime(c.qualifiers?.P582?.[0]?.datavalue?.value?.time),
      })).filter((c: any) => c.qid);
      const refQids = [bp, ...clubClaims.map((c: any) => c.qid)].filter(Boolean) as string[];
      const refLabels = refQids.length ? await labelsFor([...new Set(refQids)]) : {};
      if (bp) m.birthPlace = refLabels[bp];
      if (clubClaims.length) {
        m.clubs = clubClaims
          .map((c: any): PlayerClub => ({ name: refLabels[c.qid], start: c.start, end: c.end }))
          .sort((a: PlayerClub, b: PlayerClub) => (a.start || "").localeCompare(b.start || ""));
      }
      const file = claimValue(ent, "P18");
      if (file) {
        const img = await commonsImage(file);
        if (img && (img as any)._src) {
          const local = await mirror((img as any)._src, id);
          if (local) { delete (img as any)._src; img.url = local; m.image = img; }
        }
      }
      meta[id] = m;
      done++;
      if (done % 25 === 0) { await writeFile(CACHE, JSON.stringify(cache)); console.log(`enriched ${done}`); }
      await sleep(120);
    } catch (e) {
      console.warn(`skip ${id}: ${(e as Error).message}`);
    }
  }

  await mkdir("data/generated/2002", { recursive: true });
  await writeFile(CACHE, JSON.stringify(cache));
  await writeFile("data/generated/2002/players-meta.json", JSON.stringify(meta, null, 2));
  // merge ko names into players.ko.json
  const koPath = "data/mappings/players.ko.json";
  const ko = JSON.parse(await readFile(koPath, "utf8"));
  for (const [id, m] of Object.entries(meta)) if (m.nameKo && !ko.names[id]) ko.names[id] = m.nameKo;
  await writeFile(koPath, JSON.stringify(ko, null, 2));
  console.log(`enriched ${Object.keys(meta).length} players (with photos: ${Object.values(meta).filter((m) => m.image).length})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Fetch players.csv first, then run enrich (resilient — Ctrl-safe via cache)**

Run: `npm run data:fetch` (already includes `squads.csv`; ensure `players.csv` is added to the FILES list in `scripts/fetch-fjelstul.ts` — add `"players.csv"`). Then `npm run data:enrich`.
Expected: prints periodic `enriched N`, ends with a count. Partial results are fine — re-running resumes from cache.

- [ ] **Step 4: Regenerate (picks up merged ko names) + validate**

Run: `npm run data:generate && npm run data:validate` → `Validation OK`.

- [ ] **Step 5: Commit** `git add scripts/enrich-players.ts scripts/fetch-fjelstul.ts data/generated/2002/players-meta.json data/mappings/players.ko.json public/players && git commit -m "feat: Wikidata/Commons player enrichment (best-effort, cached)"`

NOTE: `public/players/*.jpg` are committed (build input). If the batch is partial, commit what landed; re-run later to fill more.

---

## Task 5: PlayerAvatar (server)

**Files:** Create `components/kinetic/PlayerAvatar.tsx`

```tsx
import Image from "next/image";
import type { PlayerCardData } from "@/lib/types";
import { FallbackAvatar } from "./FallbackAvatar";

export function PlayerAvatar({ card, size = 40 }: { card: PlayerCardData; size?: number }) {
  if (card.meta?.image?.url) {
    return (
      <Image
        src={card.meta.image.url}
        alt={card.nameKo}
        width={size}
        height={size}
        unoptimized
        className="rounded-md object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return <FallbackAvatar name={card.nameKo} shirt={card.shirtNumber} size={size} />;
}
```
- [ ] Commit: `feat: PlayerAvatar (photo or fallback)`

---

## Task 6: PlayerModal (client)

**Files:** Create `components/kinetic/PlayerModal.tsx`

Client modal, fixed overlay, ESC + backdrop close, body scroll lock, graceful fields. Uses the contrast-fixed palette. Attribution font is `text-[9px]`.

```tsx
"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PlayerCardData } from "@/lib/types";

export function PlayerModal({ card, onClose }: { card: PlayerCardData; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const m = card.meta;
  const stat = (n: number, label: string, accent?: boolean) => (
    <div className="stat rounded-[10px] border border-[#2b2f3a] bg-[#1b1f29] p-2 text-center transition-colors hover:border-korea">
      <div className={`font-display text-[22px] ${accent ? "text-[#ff4d6a]" : "text-white"}`}>{n}</div>
      <div className="text-[10px] text-muted">{label}</div>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={card.nameKo}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div onClick={(e) => e.stopPropagation()} className="kx-pop relative w-full max-w-[560px] overflow-hidden rounded-[18px] border border-[#2b2f3a] bg-ink">
        <button onClick={onClose} aria-label="닫기" className="absolute right-3 top-3 z-10 text-muted hover:text-white">
          <i className="ti ti-x text-xl" aria-hidden="true" />
        </button>
        <div className="grid grid-cols-[150px_1fr]">
          <div className="relative flex min-h-[210px] items-end justify-center" style={{ background: "linear-gradient(160deg,#e4002b,#5c0014)" }}>
            <div className="font-display absolute left-3 top-2 text-[40px] text-white/35">{card.shirtNumber}</div>
            {m?.image?.url
              ? <Image src={m.image.url} alt={card.nameKo} width={150} height={210} unoptimized className="h-[210px] w-[150px] object-cover" />
              : <i className="ti ti-user mb-2 text-[96px] text-white/90" aria-hidden="true" />}
          </div>
          <div className="p-[18px]">
            <span className="inline-block bg-korea px-2.5 py-0.5 text-[11px] tracking-wider text-white" style={{ transform: "skewX(-12deg)" }}>
              <span style={{ display: "inline-block", transform: "skewX(12deg)" }}>{card.teamNameKo} · {card.position}</span>
            </span>
            <div className="font-display mt-2 text-[28px] leading-tight text-white" style={{ transform: "skewX(-4deg)" }}>{card.nameKo}</div>
            <div className="mt-0.5 text-sm text-muted">{card.nameEn}{m?.nameKo ? ` · ${card.nameKo}` : ""}</div>
            <div className="mt-3 flex flex-wrap gap-4 text-[13px] text-[#e6e9ef]">
              {m?.birthDate && <div><div className="text-[11px] text-[#9aa1b0]">생년월일</div>{m.birthDate}</div>}
              {m?.height && <div><div className="text-[11px] text-[#9aa1b0]">키</div>{m.height}cm</div>}
              {m?.birthPlace && <div><div className="text-[11px] text-[#9aa1b0]">출생</div>{m.birthPlace}</div>}
            </div>
          </div>
        </div>
        <div className="p-[18px] pt-3">
          <div className="mb-1.5 text-[11px] tracking-wider text-[#9aa1b0]">2002 월드컵</div>
          <div className="grid grid-cols-4 gap-2">
            {stat(card.stats.matches, "출전")}{stat(card.stats.starts, "선발")}{stat(card.stats.subs, "교체")}{stat(card.stats.goals, "골", true)}
          </div>
          {m?.clubs?.length ? (
            <>
              <div className="mb-1.5 mt-3.5 text-[11px] tracking-wider text-[#9aa1b0]">소속팀 이력</div>
              <div className="flex flex-col gap-1.5 text-[13px] text-[#e6e9ef]">
                {m.clubs.map((c, i) => (
                  <div key={i} className="flex justify-between border-l-2 border-[#4a4f5c] pl-2.5 first:border-korea">
                    <span>{c.name}</span><span className="text-muted">{[c.start, c.end].filter(Boolean).join("–")}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
          {m?.bio && <p className="mt-3 border-t border-[#2b2f3a] pt-2.5 text-[12px] leading-relaxed text-[#c2c8d2]">{m.bio}</p>}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[9px] text-muted-dim">
              {m?.image ? `사진: ${m.image.author} · ${m.image.license}` : ""}
            </span>
            <Link href={`/players/${card.slug}`} onClick={onClose} className="font-display bg-korea px-3.5 py-1.5 text-[12px] text-white" style={{ transform: "skewX(-6deg)" }}>
              <span style={{ display: "inline-block", transform: "skewX(6deg)" }}>전체 페이지 ↗</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```
- [ ] Commit: `feat: PlayerModal detail catalog (graceful fields, AA contrast)`

---

## Task 7: PlayerTrigger (client) — hover popover + click modal

**Files:** Create `components/kinetic/PlayerTrigger.tsx`

```tsx
"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import type { PlayerCardData } from "@/lib/types";
import { PlayerModal } from "./PlayerModal";

export function PlayerTrigger({ card, children }: { card: PlayerCardData; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enter = () => { timer.current = setTimeout(() => setHover(true), 180); };
  const leave = () => { if (timer.current) clearTimeout(timer.current); setHover(false); };

  return (
    <>
      <span
        className="relative inline-flex cursor-pointer"
        onMouseEnter={enter}
        onMouseLeave={leave}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onClick={() => setOpen(true)}
        tabIndex={0}
        role="button"
        aria-haspopup="dialog"
      >
        {children}
        {hover && (
          <span className="kx-pop pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-44 -translate-x-1/2 rounded-lg border border-[#2b2f3a] bg-panel p-2 text-left shadow-xl">
            <span className="flex items-center gap-2">
              {card.meta?.image?.url
                ? <Image src={card.meta.image.url} alt="" width={34} height={34} unoptimized className="h-[34px] w-[34px] rounded object-cover" />
                : <span className="font-display flex h-[34px] w-[34px] items-center justify-center rounded text-white" style={{ background: "linear-gradient(135deg,#e4002b,#7a0018)" }}>{card.shirtNumber}</span>}
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-white">{card.nameKo}</span>
                <span className="block truncate text-[11px] text-muted">{card.position}</span>
              </span>
            </span>
            <span className="mt-1 block text-[11px] text-muted">2002: 출전 {card.stats.matches} · 골 {card.stats.goals}</span>
          </span>
        )}
      </span>
      {open && <PlayerModal card={card} onClose={() => setOpen(false)} />}
    </>
  );
}
```
- [ ] Commit: `feat: PlayerTrigger hover popover + click modal`

---

## Task 8: Wire into surfaces (match pitch, chips, team squad)

**Files:** Modify `components/kinetic/MatchPitch.tsx`, `components/kinetic/PlayerChip.tsx`, `app/world-cup/[year]/matches/[slug]/page.tsx`, `app/world-cup/[year]/teams/[slug]/page.tsx`

Pattern: pass a `cards: Record<string, PlayerCardData>` (or per-item `card`) and wrap the avatar+name in `<PlayerTrigger card={...}>`, swapping `FallbackAvatar` → `PlayerAvatar`.

- [ ] **MatchPitch**: change signature to `{ players, side, cards }: { players: Appearance[]; side: "home"|"away"; cards: Record<string, PlayerCardData> }`. Replace the per-player `<Link>` with `<PlayerTrigger card={cards[p.playerId]}>` wrapping `<PlayerAvatar card={cards[p.playerId]} size={36} />` + the name span. Remove the `next/link` + `playerSlug`/`fullName` imports (modal handles navigation). Guard: if `!cards[p.playerId]` fall back to plain avatar (shouldn't happen).
- [ ] **PlayerChip**: change to `{ card }: { card: PlayerCardData }`; render `<PlayerTrigger card={card}>` wrapping `<PlayerAvatar card={card} size={34} />` + nameKo + position.
- [ ] **Match page**: `const cards = await getPlayerCards(2002);` pass `cards` to both `MatchPitch`. For the substitute chips, map appearances to `cards[a.playerId]` and render `<PlayerChip card={...} />` (filter out any missing).
- [ ] **Team page**: `const cards = await getPlayerCards(2002);` wrap each squad entry's avatar+name in `<PlayerTrigger card={cards[entry.playerId]}>` (+ `PlayerAvatar`). Keep the link-to-page behavior available via the modal's "전체 페이지".
- [ ] **Step: build + verify** — `npm run build` (expect clean, 692+ pages). Start dev (`npm run dev`), open a match page: hover a player → popover; click → modal with photo (if enriched) or fallback + stats.
- [ ] **Commit** `git add -A && git commit -m "feat: wire PlayerTrigger/PlayerAvatar into pitch, chips, squad"`

Search results stay as links to the player page (the lightweight search index has no per-player card; modal needs the card). Out of scope for this plan.

---

## Self-Review

- **Spec coverage:** enrichment (T4) ✓, players-meta + graceful loader (T1) ✓, bilingual name `ko / en` (modal T6) ✓, birthdate/height/birthplace/position/clubs/bio/photo (T6, fields hidden when absent) ✓, 2002 stats (T1 stats + T6) ✓, hover popover + click modal + mobile tap (T7 — click works as tap) ✓, contrast tokens raised + scan (T2) ✓, attribution small font `text-[9px]` (T6) ✓, `/players/[slug]` kept (modal links out) ✓, ko-name merge into players.ko.json (T4) ✓.
- **Decoupling:** UI (T5-8) works without enrichment (T4) — `getPlayerCards` yields `meta: null`, avatars fall back, modal shows stats only. Enrichment can run/partial/re-run independently.
- **Placeholder scan:** none — complete code throughout. The `_src` temp field is explicitly deleted before write.
- **Type consistency:** `PlayerCardData`/`PlayerMeta`/`PlayerImage`/`PlayerClub` defined in T1, consumed identically in T5-8. `getPlayerCards` shape matches component props.
- **Risk:** T4 is network/throughput-bound on a loaded machine — cached, throttled, resumable, partial-OK. If it can't run here, T1-3 + T5-8 still ship a working hover/modal with fallback avatars + stats; photos/bio fill in on a later enrich run.

---

## Execution note

T1, T2, T3, T5, T6, T7 are reliable (no network). T4 is the network batch (run best-effort; resumable). T8 wires it together. Recommended order: T1→T2→T3→(T5,T6,T7 build the UI)→T8 wire+build+verify→T4 enrich run last (so the UI is verifiable immediately with fallbacks, then photos/bio enrich in).
