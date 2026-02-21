export type SourceItem = {
  title: string;
  url?: string;
};

export type Spot = {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  pref?: string;
  type?: string;
  credibility?: "S" | "A" | "B" | "C" | "D";
  danger?: 1 | 2 | 3 | 4 | 5;
  body?: string;
  source?: SourceItem[];
  caution?: string[];
  updatedAt?: string;
  createdAt?: string;
};

export type Story = {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  type?: string;
  credibility?: "S" | "A" | "B" | "C" | "D";
  danger?: 1 | 2 | 3 | 4 | 5;
  body?: string;
  source?: SourceItem[];
  caution?: string[];
  updatedAt?: string;
  createdAt?: string;
};

export type Uma = {
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  type?: string;
  region: string;
  danger?: 1 | 2 | 3 | 4 | 5;
  existence_rank: "S" | "A" | "B" | "C" | "D";
  evidence_rank: "A" | "B" | "C" | "D" | "E";
  views: number;
  body?: string;
  source?: SourceItem[];
  caution?: string[];
  updatedAt?: string;
  createdAt?: string;
};
