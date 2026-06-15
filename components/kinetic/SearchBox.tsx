"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { SearchDoc } from "@/lib/types";

interface SearchBoxProps {
  docs: SearchDoc[];
}

const TYPE_LABELS: Record<SearchDoc["type"], string> = {
  player: "선수",
  team: "국가",
  match: "경기",
};

const TYPE_STYLES: Record<SearchDoc["type"], string> = {
  player: "bg-korea text-white",
  team: "border border-line text-muted",
  match: "bg-panel text-muted-dim border border-line",
};

export function SearchBox({ docs }: SearchBoxProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const lower = trimmed.toLowerCase();
    return docs
      .filter((doc) =>
        (doc.title + " " + doc.subtitle).toLowerCase().includes(lower)
      )
      .slice(0, 40);
  }, [query, docs]);

  const trimmed = query.trim();

  return (
    <div className="mt-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="선수, 국가, 경기 검색…"
        className="w-full bg-panel border border-line rounded-lg px-4 py-3 text-white placeholder:text-muted focus:border-korea outline-none transition-colors"
      />

      {trimmed === "" ? (
        <p className="text-muted text-xs mt-3">검색어를 입력하세요</p>
      ) : (
        <p className="text-muted text-xs mt-3">{results.length}건</p>
      )}

      {results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map((doc, i) => (
            <li key={i}>
              <Link
                href={doc.href}
                className="bg-panel rounded p-3 flex items-center justify-between border border-transparent hover:border-korea transition-colors"
              >
                <span>
                  <span className="font-medium text-white">{doc.title}</span>
                  <span className="text-muted text-xs block">{doc.subtitle}</span>
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded shrink-0 ml-3 ${TYPE_STYLES[doc.type]}`}
                >
                  {TYPE_LABELS[doc.type]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
