import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="font-display text-4xl" style={{ transform: "skewX(-6deg)" }}>
        월드컵 아카이브
      </h1>
      <Link href="/world-cup/2002" className="mt-6 inline-block bg-korea px-5 py-2 font-display">
        2002 →
      </Link>
    </main>
  );
}
