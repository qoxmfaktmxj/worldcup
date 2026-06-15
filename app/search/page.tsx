import { getSearchIndex } from "@/lib/data";
import { SearchBox } from "@/components/kinetic/SearchBox";

export default async function SearchPage() {
  const docs = await getSearchIndex(2002);
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1
        className="font-display text-5xl text-korea"
        style={{ transform: "skewX(-6deg)" }}
      >
        검색
      </h1>
      <p className="text-muted mt-1">2002 월드컵 · 선수 · 국가 · 경기</p>
      <SearchBox docs={docs} />
    </main>
  );
}
