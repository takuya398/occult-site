export type GlowVariant = "spot" | "story" | "uma";

export function glowClass(variant: GlowVariant) {
  const base =
    "transition-all duration-200 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "md:hover:-translate-y-[1px]";

  const spotBlue =
    "md:hover:ring-2 md:hover:ring-sky-400/60 " +
    "md:hover:shadow-[0_0_0_1px_rgba(56,189,248,0.22),0_0_28px_rgba(59,130,246,0.22)] " +
    "focus-visible:ring-sky-400/70";

  const storyRed =
    "md:hover:ring-2 md:hover:ring-rose-400/60 " +
    "md:hover:shadow-[0_0_0_1px_rgba(244,63,94,0.22),0_0_28px_rgba(168,85,247,0.20)] " +
    "focus-visible:ring-rose-400/70";

  const umaGreen =
    "md:hover:ring-2 md:hover:ring-emerald-400/60 " +
    "md:hover:shadow-[0_0_0_1px_rgba(16,185,129,0.22),0_0_28px_rgba(34,197,94,0.20)] " +
    "focus-visible:ring-emerald-400/70";

  const map: Record<GlowVariant, string> = {
    spot: spotBlue,
    story: storyRed,
    uma: umaGreen,
  };

  return `${base} ${map[variant]}`;
}
