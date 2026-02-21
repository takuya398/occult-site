export type Category = "spots" | "stories" | "uma";
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

export type SpotEntry = BaseEntry & {
  category: "spots";
  pref?: string;
  type?: string;
  credibility?: "S" | "A" | "B" | "C" | "D";
  danger?: 1 | 2 | 3 | 4 | 5;
  source?: SourceItem[];
  caution?: string[];
};

export type StoryEntry = BaseEntry & {
  category: "stories";
  type?: string;
  credibility?: "S" | "A" | "B" | "C" | "D";
  danger?: 1 | 2 | 3 | 4 | 5;
  source?: SourceItem[];
  caution?: string[];
};

export type UmaEntry = BaseEntry & {
  category: "uma";
  type?: string;
  region: string;
  danger?: 1 | 2 | 3 | 4 | 5;
  existence_rank: "S" | "A" | "B" | "C" | "D";
  evidence_rank: "A" | "B" | "C" | "D" | "E";
  views: number;
  source?: SourceItem[];
  caution?: string[];
  createdAt?: string;
};
