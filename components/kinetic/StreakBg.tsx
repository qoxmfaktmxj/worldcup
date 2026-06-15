export function StreakBg() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="kx-streak absolute -top-[20%] left-[10%] h-[140%] w-[50px] bg-gradient-to-r from-transparent via-korea/40 to-transparent" />
      <div
        className="kx-streak absolute -top-[20%] left-[55%] h-[140%] w-[50px] bg-gradient-to-r from-transparent via-korea/30 to-transparent"
        style={{ animationDelay: "1.4s" }}
      />
    </div>
  );
}
