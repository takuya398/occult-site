import type { UmaEntry } from "@/types";
import type { CategoryKey } from "@/data/uma-tag-slugs";

// 主要タグの固定説明文（tagSlug → 説明文）
// 登録のないタグはカテゴリテンプレートで自動生成される
const TAG_DESCRIPTION_MAP: Record<string, string> = {
  mountain:
    "「山」タグのUMAは、山地・山間部・尾根付近で目撃・伝承されてきた未確認生物をまとめた分類です。視界が遮られる森林帯や霧の多い環境が目撃条件を特殊にしており、生息数の把握が困難なケースが多くあります。地域によって異なる呼称で語られることも多く、同一個体の目撃談が複数の伝承に分岐しているとみられる事例もあります。",
  lake:
    "「湖」タグのUMAは、湖・湖底・湖岸近辺での目撃・伝承が集まる分類です。閉鎖水域という特性上、大型個体が外部に発見されないまま生息し続ける環境として語られやすく、世界各地の湖にUMA伝承が残ります。水深・透明度・季節変化が目撃条件に大きく影響するとされています。",
  "deep-sea":
    "「深海」タグのUMAは、水深200m以上の深海域で目撃・発見報告があるか、深海起源説をもつ未確認生物の分類です。深海は地球表面の大部分を占めながら探索が限られた領域であり、未知の大型生物が潜伏している可能性が科学的にも完全には否定されていません。ダイオウイカなど実際に深海で発見された大型生物の存在が、この可能性を支持する根拠として引用されることもあります。",
  humanoid:
    "「人型」タグのUMAは、直立二足歩行や人に近い体格・顔立ちを持つとされる未確認生物の分類です。サスクワッチ・イエティをはじめとする「雪男」系の目撃談に代表されるように、人と野生動物の境界を揺さぶる存在として世界各地で伝承されてきました。目撃時の恐怖感が証言を誇張しやすいとも言われ、客観的な検証が特に重要な分野です。",
  "giant-creature":
    "「巨大生物」タグのUMAは、同種の既知最大サイズを大幅に超えるか、既存の分類に当てはまらない巨体が報告される未確認生物の分類です。目撃者の距離感や主観的な大きさの誇張が含まれやすく、実際の体長推定には慎重な検証が必要です。一方で、ダイオウイカやリュウグウノツカイのように「伝説上の巨大生物」が実在の新種として確認された事例もあります。",
  "urban-legend":
    "「都市伝説」タグのUMAは、口コミやインターネットを通じて急速に広まった都市伝説の文脈で語られる未確認生物の分類です。古代の自然伝承とは異なり、比較的近代に発生・拡散したケースが多く、目撃情報の出所や拡散過程を追跡しやすい特性があります。創作・フィクションとの境界が曖昧なものも含まれるため、情報源の精査が特に重要です。",
  "photo-evidence":
    "「写真あり」タグのUMAは、目撃者や調査者によって何らかの写真記録が残されているとされる未確認生物の分類です。写真証拠は視覚的に訴求力が高い一方、撮影条件・解像度・加工の有無によって信頼度が大きく左右されます。デジタル加工技術の普及以降はとくに慎重な検証が求められます。",
  "video-evidence":
    "「映像あり」タグのUMAは、動画・フィルム等の映像記録が存在するとされる未確認生物の分類です。映像は静止画より動きや立体感を捉えられる反面、遠距離・低解像度・逆光などの条件が重なりやすく、決定的証拠として認められたケースはほとんどありません。撮影状況や連続フレームの整合性を含めた総合的な分析が必要です。",
};

// カテゴリ別テンプレート（固定説明がない場合のフォールバック）
function getCategoryTemplate(tagName: string, categoryKey: CategoryKey | ""): string {
  switch (categoryKey) {
    case "environment":
      return `「${tagName}」タグのUMAは、主に${tagName}周辺で目撃・伝承される未確認生物をまとめた分類です。生息環境の特徴から、目撃条件や発見難易度が大きく変わります。似た環境に出現するUMA同士を横断的に比較することで、伝承の共通パターンも見えやすくなります。`;
    case "morphology":
      return `「${tagName}」タグのUMAは、外見や体格が${tagName}に分類される未確認生物の一覧です。形態が近いUMA同士は誤認のパターンも共通しやすく、検証の観点でも比較しやすいのが特徴です。既存動物との形態的な差異がどの程度あるかが、実在度評価の重要な指標となります。`;
    case "traits":
      return `「${tagName}」タグのUMAは、${tagName}とされる特徴（行動・性質・能力）が語られる未確認生物を集めた分類です。共通点を横断比較することで、誇張・誤認・伝承の混ざり方も読み解きやすくなります。特定の特徴が複数の地域・時代を超えて報告されている場合、信頼度が高まる傾向があります。`;
    case "origin_evidence":
      return `「${tagName}」タグは、目撃談の由来や証拠の種類に基づいてUMAを分類します。証拠の質と量を比較しやすく、信頼度の見立てに役立ちます。同じタグを持つUMAを並べることで、どのような状況下で証拠が生まれやすいかも把握できます。`;
    default:
      return `「${tagName}」タグに分類されるUMAの一覧です。目撃情報や伝承の傾向を比較しながらご覧ください。`;
  }
}

// ─── 統計 ──────────────────────────────────────────────────────────────────

export type TagStats = {
  totalCount: number;
  highExistCount: number;
  highEvidenceCount: number;
  highDangerCount: number;
};

export function getTagStats(umasInThisTag: UmaEntry[]): TagStats {
  return {
    totalCount: umasInThisTag.length,
    highExistCount: umasInThisTag.filter((u) =>
      (["S", "A"] as const).includes(u.existence_rank as "S" | "A")
    ).length,
    highEvidenceCount: umasInThisTag.filter((u) =>
      (["A", "B"] as const).includes(u.evidence_rank as "A" | "B")
    ).length,
    highDangerCount: umasInThisTag.filter((u) => (u.danger ?? 0) >= 4).length,
  };
}

export function getTagStatSentence(umasInThisTag: UmaEntry[]): string {
  const { totalCount, highExistCount, highEvidenceCount, highDangerCount } =
    getTagStats(umasInThisTag);
  return `現在このタグに該当するUMAは${totalCount}体で、実在度A以上は${highExistCount}体、証拠強度B以上は${highEvidenceCount}体、危険度4以上は${highDangerCount}体です。`;
}

// ─── 説明文生成 ────────────────────────────────────────────────────────────

export type TagDescription = {
  body: string;
  statSentence: string;
};

export function getTagDescription(
  tagSlug: string,
  tagName: string,
  categoryKey: CategoryKey | "",
  umasInThisTag: UmaEntry[]
): TagDescription {
  const body =
    TAG_DESCRIPTION_MAP[tagSlug] ?? getCategoryTemplate(tagName, categoryKey);
  const statSentence = getTagStatSentence(umasInThisTag);
  return { body, statSentence };
}
