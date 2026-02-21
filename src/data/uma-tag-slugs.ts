import type { UmaEntry } from "@/types";
import { UMA_TAG_CATEGORIES } from "./uma-tags";

// 日本語タグ → 英語slug（永続・変更禁止）
export const TAG_SLUG_MAP: Record<string, string> = {
  // 生息環境
  "山": "mountain",
  "森林": "forest",
  "湖": "lake",
  "川": "river",
  "海": "sea",
  "深海": "deep-sea",
  "湿地": "wetland",
  "洞窟": "cave",
  "砂漠": "desert",
  "雪原": "snowfield",
  "都市": "urban",
  "農村": "rural",
  "地下": "underground",
  "離島": "remote-island",
  "密林": "jungle",
  "高山": "alpine",
  // 形態
  "人型": "humanoid",
  "巨人型": "giant",
  "小型生物": "small-creature",
  "哺乳類型": "mammal-type",
  "爬虫類型": "reptile-type",
  "魚類型": "fish-type",
  "両生類型": "amphibian-type",
  "昆虫型": "insect-type",
  "鳥類型": "bird-type",
  "飛行型": "flying-type",
  "多足型": "multi-legged",
  "未分類型": "unclassified",
  // 特徴
  "巨大生物": "giant-creature",
  "発光": "bioluminescent",
  "高速移動": "high-speed",
  "血液吸引": "blood-sucking",
  "毒性あり": "venomous",
  "擬態": "camouflage",
  "再生能力": "regenerative",
  "超音波": "ultrasonic",
  "悪臭": "foul-odor",
  "長寿伝承": "long-lived",
  "集団出現": "swarm",
  "夜行性": "nocturnal",
  "水陸両生": "amphibious",
  "凶暴性高": "aggressive",
  // 由来・証拠
  "古代伝承": "ancient-legend",
  "民間伝承": "folklore",
  "都市伝説": "urban-legend",
  "軍事関連": "military-related",
  "実験体説": "experiment-theory",
  "宇宙起源説": "alien-origin",
  "観光資源化": "tourism",
  "写真あり": "photo-evidence",
  "映像あり": "video-evidence",
  "DNA報告あり": "dna-report",
  "複数証言": "multiple-witnesses",
  "単独証言": "single-witness",
};

// 逆引き: slug → tagName
export const TAG_SLUG_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(TAG_SLUG_MAP).map(([k, v]) => [v, k])
);

// tagName → { key: categoryKey, label: categoryLabel }
export type CategoryKey = keyof typeof UMA_TAG_CATEGORIES;

export const TAG_CATEGORY_MAP: Record<
  string,
  { key: CategoryKey; label: string }
> = Object.fromEntries(
  (
    Object.entries(UMA_TAG_CATEGORIES) as [
      CategoryKey,
      { label: string; tags: readonly string[] },
    ][]
  ).flatMap(([key, { label, tags }]) =>
    tags.map((tag) => [tag, { key, label }])
  )
);

// ─── 関連タグ ───────────────────────────────────────────────────────────────

export type RelatedTag = {
  tagName: string;
  tagSlug: string;
  categoryKey: CategoryKey | "";
  categoryLabel: string;
  count: number;
};

/**
 * 現在のタグ詳細ページに表示されているUMAから、関連タグを抽出して返す。
 * - currentTagName を除外
 * - count >= minCount のみ採用（デフォルト 2）
 * - TAG_SLUG_MAP に存在しないタグは除外
 * - count 降順、同点時は tagName 昇順
 */
export function getRelatedTags(
  umasInThisTag: UmaEntry[],
  currentTagName: string,
  options: { maxCount?: number; minCount?: number } = {}
): RelatedTag[] {
  const { maxCount = 10, minCount = 2 } = options;

  const counts: Record<string, number> = {};
  for (const uma of umasInThisTag) {
    for (const tag of uma.tags) {
      if (tag === currentTagName) continue;
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }

  const result: RelatedTag[] = [];
  for (const [tagName, count] of Object.entries(counts)) {
    if (count < minCount) continue;
    const tagSlug = TAG_SLUG_MAP[tagName];
    if (!tagSlug) continue;
    const categoryInfo = TAG_CATEGORY_MAP[tagName];
    result.push({
      tagName,
      tagSlug,
      categoryKey: categoryInfo?.key ?? "",
      categoryLabel: categoryInfo?.label ?? "",
      count,
    });
  }

  result.sort((a, b) => b.count - a.count || a.tagName.localeCompare(b.tagName));
  return result.slice(0, maxCount);
}
