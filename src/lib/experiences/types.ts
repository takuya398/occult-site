export type ExperienceStatus = "pending" | "published" | "rejected" | "hidden" | "deleted";
export type CommentStatus = "pending" | "published" | "hidden" | "deleted";
export type ReportStatus = "open" | "reviewing" | "resolved" | "rejected";

export const GENRES = [
  "幽霊目撃",
  "金縛り",
  "怪音・怪現象",
  "ポルターガイスト",
  "心霊写真・心霊動画",
  "不思議な体験",
  "その他",
] as const;
export type Genre = (typeof GENRES)[number];

export const REPORT_REASONS = [
  "個人情報が含まれている",
  "誹謗中傷",
  "スパム・宣伝",
  "著作権侵害",
  "危険行為・不法侵入を助長している",
  "性的・暴力的な内容",
  "その他",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export type Experience = {
  id: string;
  story_no: number;
  slug: string;
  title: string;
  body: string;
  display_name: string;
  prefecture: string;
  place_name: string | null;
  genre: string;
  scare_level: number;
  related_spot_slug: string | null;
  status: ExperienceStatus;
  like_count: number;
  comment_count: number;
  report_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type ExperienceComment = {
  id: string;
  experience_id: string;
  comment_no: number;
  parent_comment_id: string | null;
  body: string;
  display_name: string;
  status: CommentStatus;
  like_count: number;
  report_count: number;
  created_at: string;
  updated_at: string;
};

export type ExperienceReport = {
  id: string;
  target_type: "experience" | "comment";
  target_id: string;
  reason: string;
  detail: string | null;
  status: ReportStatus;
  created_at: string;
  resolved_at: string | null;
};
