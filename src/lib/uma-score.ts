import type { UmaEntry } from "@/types";

// 数値マッピング（厳守）
export const EXISTENCE_RANK_SCORE: Record<string, number> = {
  S: 5, A: 4, B: 3, C: 2, D: 1,
};

export const EVIDENCE_RANK_SCORE: Record<string, number> = {
  A: 5, B: 4, C: 3, D: 2, E: 1,
};

export const existenceRankScore = (rank?: string): number =>
  rank ? (EXISTENCE_RANK_SCORE[rank] ?? 0) : 0;

export const evidenceRankScore = (rank?: string): number =>
  rank ? (EVIDENCE_RANK_SCORE[rank] ?? 0) : 0;

export const getRecommendDetails = (uma: UmaEntry, today: Date) => {
  const existenceValue = existenceRankScore(uma.existence_rank);
  const evidenceValue = evidenceRankScore(uma.evidence_rank);
  const dangerLevel = uma.danger ?? 0;

  // 3-1: ベーススコア（研究価値）
  const baseScore =
    existenceValue * 0.35 + evidenceValue * 0.25 + dangerLevel * 0.20;

  // 3-2: 閲覧数補正（暴走防止のためlog使用）
  const viewScore = Math.log10((uma.views ?? 0) + 1) * 0.10;

  // 3-3: 新規性補正（公開30日以内のみ）
  let freshScore = 0;
  if (uma.createdAt) {
    const created = new Date(uma.createdAt);
    const days = Math.floor(
      (today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );
    freshScore = Math.max(0, 30 - days) / 30 * 0.10;
  }

  // 4: ボーナス（実在度と証拠強度が両方 >= 4 の場合）
  const bonus = existenceValue >= 4 && evidenceValue >= 4 ? 0.3 : 0;

  return {
    baseScore,
    viewScore,
    freshScore,
    bonus,
    finalScore: baseScore + viewScore + freshScore + bonus,
    hasBonus: bonus > 0,
    isFresh: freshScore > 0,
    isPopular: (uma.views ?? 0) >= 1000,
  };
};

export const calcRecommendScore = (uma: UmaEntry, today: Date): number =>
  getRecommendDetails(uma, today).finalScore;
