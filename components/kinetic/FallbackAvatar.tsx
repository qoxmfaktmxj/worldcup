const ACCENTS = {
  red: ["#e4002b", "#7a0018"],
  blue: ["#2f6bff", "#10307a"],
} as const;

export function FallbackAvatar({
  name,
  shirt,
  size = 40,
  accent = "red",
}: {
  name: string;
  shirt?: number;
  size?: number;
  accent?: "red" | "blue";
}) {
  const [a, b] = ACCENTS[accent];
  const initials = name
    .replace(/[^\p{L}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <div
      className="flex items-center justify-center font-display text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)`,
        clipPath: "polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)",
      }}
      aria-label={name}
    >
      {shirt ?? initials ?? "?"}
    </div>
  );
}
