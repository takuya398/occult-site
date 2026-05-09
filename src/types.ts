export type Category = "spots" | "stories" | "uma" | "entities" | "mysteries" | "legends";
export type Status = "draft" | "published";

export type ImageMedia = {
  type: "image";
  src: string;
  alt: string;
  credit?: string;
  license?: string;
  width?: number;
  height?: number;
};

export type EmbedMedia =
  | { type: "youtube"; url: string; title?: string }
  | { type: "tiktok"; url: string; title?: string };

export type BaseEntry = {
  id: string;
  slug: string;
  title: string;
  ruby?: string;
  summary: string;
  body: string;
  content?: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  status: Status;
  category: Category;
  coverImage?: ImageMedia;
  images?: ImageMedia[];
  embeds?: EmbedMedia[];
  videoUrls?: string[];
};

export type SourceItem = {
  title: string;
  url?: string;
};

export type GeoInfo = {
  scope: "JP" | "INTL";
  prefectures?: string[];
  countries?: string[];
  area?: string;
};

export type SpotEntry = BaseEntry & {
  category: "spots";
  pref?: string;
  type?: string;
  credibility?: "S" | "A" | "B" | "C" | "D";
  danger?: 1 | 2 | 3 | 4 | 5;
  source?: SourceItem[];
  caution?: string[];
  mapQuery?: string;
  lat?: number;
  lng?: number;
};

export type StoryEntry = BaseEntry & {
  category: "stories";
  type?: string;
  credibility?: "S" | "A" | "B" | "C" | "D";
  danger?: 1 | 2 | 3 | 4 | 5;
  source?: SourceItem[];
  caution?: string[];
};

export type MysteryEntry = BaseEntry & {
  category: "mysteries";
  era?: string;
  location?: string;
  credibility?: "S" | "A" | "B" | "C" | "D";
  source?: SourceItem[];
  caution?: string[];
  contentMd?: string;
  createdAt?: string;
};

/**
 * EntityEntry — UmaEntry の上位互換。
 * category: "entities" が正式。
 * region は任意（将来 UFO/宇宙人など多様な存在を扱える）。
 */
export type EntityEntry = BaseEntry & {
  category: "entities";
  type?: string;
  region?: string;
  geo?: GeoInfo;
  danger?: 1 | 2 | 3 | 4 | 5;
  existence_rank: "S" | "A" | "B" | "C" | "D";
  evidence_rank: "A" | "B" | "C" | "D" | "E";
  views: number;
  source?: SourceItem[];
  caution?: string[];
  createdAt?: string;
  contentMd?: string;
};

export type LegendEntry = Omit<BaseEntry, "category" | "coverImage"> & {
  category: "legends";
  type: "kaidan" | "urban" | "imi-kowa";
  danger?: 1 | 2 | 3 | 4 | 5;
  credibility?: "A" | "B" | "C" | "D" | "E";
  excerpt?: string;
  views30d: number;
  viewsTotal?: number;
  editorPick?: boolean;
  stage?: string;
  motif?: string;
  tone?: string;
  coverImage?: string;
  sceneImages?: string[];
  sources?: string[];
  source?: SourceItem[];
  caution?: string[];
  images?: ImageMedia[];
  embeds?: EmbedMedia[];
  videoUrls?: string[];
};

export type UmaEntry = BaseEntry & {
  category: "uma";
  type?: string;
  region: string;
  geo?: GeoInfo;
  danger?: 1 | 2 | 3 | 4 | 5;
  existence_rank: "S" | "A" | "B" | "C" | "D";
  evidence_rank: "A" | "B" | "C" | "D" | "E";
  views: number;
  source?: SourceItem[];
  caution?: string[];
  createdAt?: string;
  contentMd?: string;
};
