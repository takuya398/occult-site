export const parseYouTubeId = (url: string) => {
  const match = url.match(
    /(?:v=|youtu\.be\/|shorts\/|live\/)([\w-]{6,})/i
  );
  return match?.[1] ?? null;
};

export const toYouTubeEmbedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;

export const isTikTokUrl = (url: string) => /tiktok\.com\/.+\/video\//i.test(url);

export const normalizeMedia = (url: string) => {
  const trimmed = url.trim();
  const youtubeId = parseYouTubeId(trimmed);
  if (youtubeId) {
    return {
      kind: "youtube" as const,
      embedUrl: toYouTubeEmbedUrl(youtubeId),
      externalUrl: trimmed,
    };
  }
  if (isTikTokUrl(trimmed)) {
    return {
      kind: "tiktok" as const,
      externalUrl: trimmed,
    };
  }
  return { kind: "other" as const, externalUrl: trimmed };
};
