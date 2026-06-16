import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { parseTime, parseHeight, pickLabels } from "../lib/pipeline/wikidata";
import { fullName } from "../lib/pipeline/names";
import type { PlayerClub, PlayerMeta } from "../lib/types";

const UA = "WorldCupArchive/1.0 (+https://worldcup.minseok91.cloud)";
const YEAR = process.argv[2] ?? process.env.YEAR ?? "2002";
const CACHE = `data/raw/${YEAR}/wikidata-cache.json`;
const LIMIT = Number(process.env.ENRICH_LIMIT ?? "60"); // network passes; 0 = csv-only

type Row = Record<string, string>;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url: string): Promise<any> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function csv(name: string): Promise<Row[]> {
  return readFile(`data/raw/${YEAR}/${name}`, "utf8").then((t) =>
    parse(t, { columns: true, skip_empty_lines: true, relax_column_count: true }),
  );
}

async function loadCache(): Promise<Record<string, any>> {
  try { return JSON.parse(await readFile(CACHE, "utf8")); } catch { return {}; }
}

function csvBirth(d: string): string | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || "");
  return m ? `${m[1]}.${m[2]}.${m[3]}` : undefined;
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
  const j = await getJSON(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`);
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
    await sleep(150);
  }
  return out;
}

async function commonsImage(file: string): Promise<any> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1024&format=json&titles=${encodeURIComponent("File:" + file)}`;
  const j = await getJSON(url);
  const pages = j?.query?.pages ?? {};
  const info = pages[Object.keys(pages)[0]]?.imageinfo?.[0];
  if (!info) return undefined;
  const ext = info.extmetadata ?? {};
  const strip = (s?: string) => (s ? s.replace(/<[^>]+>/g, "").trim() : "");
  return {
    author: strip(ext.Artist?.value) || "Wikimedia Commons",
    license: ext.LicenseShortName?.value || "",
    licenseUrl: ext.LicenseUrl?.value || "",
    sourceUrl: info.descriptionurl || "",
    src: info.thumburl || info.url,
  };
}

async function mirror(srcUrl: string, id: string): Promise<string | undefined> {
  const res = await fetch(srcUrl, { headers: { "User-Agent": UA } });
  if (!res.ok) return undefined;
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir("public/players", { recursive: true });
  await writeFile(`public/players/${id}.jpg`, buf);
  return `/players/${id}.jpg`;
}

async function summary(title: string, lang: string): Promise<string | undefined> {
  try {
    const j = await getJSON(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    const e: string | undefined = j?.extract;
    if (!e) return undefined;
    return e.length <= 360 ? e : e.slice(0, 320).trimEnd() + "…";
  } catch {
    return undefined;
  }
}

async function main() {
  const playerRows = await csv("players.csv");
  const apps = await csv("player_appearances.csv");
  const squads = await csv("squads.csv");
  const wanted = new Set(apps.map((a) => a.player_id));
  // Prioritise the host/flagship squad (Korea) so a capped run enriches those pages first.
  const PRIORITY = new Set(
    squads.filter((s) => s.team_code === "KOR" || s.team_name === "South Korea").map((s) => s.player_id),
  );
  const cache = await loadCache();
  const meta: Record<string, PlayerMeta> = {};

  const rows = playerRows.filter((p) => wanted.has(p.player_id));
  // Tier 1 — every player gets a birthdate from the CSV (no network).
  for (const p of rows) {
    meta[p.player_id] = {
      nameEn: fullName(p.given_name, p.family_name),
      birthDate: csvBirth(p.birth_date),
    };
  }
  // Tier 2 — Wikidata/Commons enrichment, priority first, capped by LIMIT.
  rows.sort((a, b) => (PRIORITY.has(b.player_id) ? 1 : 0) - (PRIORITY.has(a.player_id) ? 1 : 0));

  let done = 0;
  for (const p of rows) {
    if (done >= LIMIT) break;
    const id = p.player_id;
    const title = titleFromWiki(p.player_wikipedia_link);
    if (!title) continue;
    done++;
    try {
      let ent = cache[id]?.entity;
      if (!ent) {
        const qid = await qidFromTitle(title);
        if (!qid) continue;
        ent = await entity(qid);
        cache[id] = { qid, entity: ent };
        await sleep(200);
      }
      const labels = pickLabels(ent.labels);
      const m = meta[id];
      if (labels.ko) m.nameKo = labels.ko;
      if (labels.en) m.nameEn = labels.en;
      m.height = parseHeight(claimValue(ent, "P2048")) ?? m.height;
      m.wikiUrl = ent.sitelinks?.kowiki?.url || ent.sitelinks?.enwiki?.url;

      const bp = claimValue(ent, "P19")?.id;
      const clubClaims = (ent.claims?.P54 ?? [])
        .map((c: any) => ({
          qid: c.mainsnak?.datavalue?.value?.id,
          start: parseTime(c.qualifiers?.P580?.[0]?.datavalue?.value?.time),
          end: parseTime(c.qualifiers?.P582?.[0]?.datavalue?.value?.time),
        }))
        .filter((c: any) => c.qid);
      const refQids = [bp, ...clubClaims.map((c: any) => c.qid)].filter(Boolean) as string[];
      const refLabels = refQids.length ? await labelsFor([...new Set(refQids)]) : {};
      if (bp) m.birthPlace = refLabels[bp];
      if (clubClaims.length) {
        m.clubs = clubClaims
          .map((c: any): PlayerClub => ({ name: refLabels[c.qid], start: c.start, end: c.end }))
          .sort((a: PlayerClub, b: PlayerClub) => (a.start || "").localeCompare(b.start || ""));
      }

      const koTitle = ent.sitelinks?.kowiki?.title;
      m.bio = (koTitle && (await summary(koTitle, "ko"))) || (await summary(title, "en"));

      const file = claimValue(ent, "P18");
      if (file) {
        const img = await commonsImage(file);
        if (img?.src) {
          const local = await mirror(img.src, id);
          if (local) {
            m.image = { url: local, author: img.author, license: img.license, licenseUrl: img.licenseUrl, sourceUrl: img.sourceUrl };
          }
        }
      }
      if (done % 10 === 0) {
        await writeFile(CACHE, JSON.stringify(cache));
        console.log(`enriched ${done}/${LIMIT}`);
      }
      await sleep(120);
    } catch (e) {
      console.warn(`skip ${id}: ${(e as Error).message}`);
    }
  }

  await mkdir(`data/generated/${YEAR}`, { recursive: true });
  await writeFile(CACHE, JSON.stringify(cache));
  await writeFile(`data/generated/${YEAR}/players-meta.json`, JSON.stringify(meta, null, 2));

  const koPath = "data/mappings/players.ko.json";
  const ko = JSON.parse(await readFile(koPath, "utf8"));
  for (const [id, m] of Object.entries(meta)) if (m.nameKo && !ko.names[id]) ko.names[id] = m.nameKo;
  await writeFile(koPath, JSON.stringify(ko, null, 2));

  const withPhoto = Object.values(meta).filter((m) => m.image).length;
  const withBirth = Object.values(meta).filter((m) => m.birthDate).length;
  console.log(`meta: ${Object.keys(meta).length} players | birthdate ${withBirth} | photo ${withPhoto} | network pass ${done}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
