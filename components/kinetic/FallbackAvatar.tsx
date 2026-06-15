function isLight(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  // perceived luminance
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

export function FallbackAvatar({
  name,
  shirt,
  size = 40,
  color = "#e4002b",
}: {
  name: string;
  shirt?: number;
  size?: number;
  color?: string;
}) {
  const textColor = isLight(color) ? "#15171c" : "#ffffff";
  const initials = name
    .replace(/[^\p{L}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <div
      className="flex items-center justify-center font-display"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        color: textColor,
        background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 58%, #000))`,
        clipPath: "polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)",
      }}
      aria-label={name}
    >
      {shirt ?? initials ?? "?"}
    </div>
  );
}
