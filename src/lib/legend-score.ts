import type { LegendEntry } from "@/types";

const CRED_BONUS: Record<string, number> = {
  A: 6,
  B: 4,
  C: 2,
  D: 1,
  E: 0,
};

const CRED_ORDER: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
};

const daysSince = (iso: string, today: Date): number => {
  const ms = today.getTime() - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

const freshness = (publishedAt: string, today: Date): number => {
  const d = daysSince(publishedAt, today);
  if (d <= 7) return 25;
  if (d <= 30) return 15;
  if (d <= 90) return 8;
  return 0;
};

export const calcLegendScore = (entry: LegendEntry, today: Date): number => {
  const pop = Math.min(60, 10 * Math.log10((entry.views30d ?? 0) + 1));
  const fresh = freshness(entry.publishedAt, today);
  const editor = entry.editorPick ? 20 : 0;
  const credBonus = CRED_BONUS[entry.credibility ?? ""] ?? 0;
  const dangerBonus = entry.danger ?? 0;
  return pop + fresh + editor + credBonus + dangerBonus;
};

export const credOrder = (cred?: string): number =>
  CRED_ORDER[cred ?? ""] ?? 0;
