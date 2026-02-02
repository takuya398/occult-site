export type Category = "spots" | "stories" | "uma";
export type Status = "draft" | "published";

export type MediaImage = {
  type: "image";
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  credit?: string;
};

export type MediaVideo = {
  type: "video";
  provider: "youtube" | "vimeo" | "mp4";
  url: string;
  title?: string;
};

export type Media = MediaImage | MediaVideo;

export type BaseEntry = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  status: Status;
  category: Category;
  cover?: MediaImage;
  media?: Media[];
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
  credibility?: "S" | "A" | "B" | "C" | "D";
  danger?: 1 | 2 | 3 | 4 | 5;
  source?: SourceItem[];
  caution?: string[];
};
