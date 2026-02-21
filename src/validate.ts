import storiesData from "./data/json/stories.json";
import umasData from "./data/json/uma.json";
import { TAGS } from "./data/tags";
import { normalizeMedia } from "./lib/media";
import { getSpotEntriesFromArticles } from "./lib/spot-articles";
import type { BaseEntry, EmbedMedia, ImageMedia } from "./types";

const tagSet = new Set<string>(TAGS as readonly string[]);
const slugSet = new Set<string>();
const errors: string[] = [];

const isString = (value: unknown): value is string => typeof value === "string";
const isNonEmptyString = (value: unknown): value is string =>
  isString(value) && value.trim().length > 0;

const isValidDate = (value: unknown) => {
  if (!isNonEmptyString(value)) return false;
  const isSimple = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const isIso = /^\d{4}-\d{2}-\d{2}T/.test(value);
  if (!isSimple && !isIso) return false;
  return !Number.isNaN(Date.parse(value));
};

const isImage = (value: unknown): value is ImageMedia => {
  if (!value || typeof value !== "object") return false;
  const image = value as ImageMedia;
  return (
    image.type === "image" &&
    isNonEmptyString(image.src) &&
    isNonEmptyString(image.alt)
  );
};

const validateImages = (images: unknown, context: string) => {
  if (images === undefined) return;
  if (!Array.isArray(images)) {
    errors.push(`${context} images は配列である必要があります`);
    return;
  }
  images.forEach((item, index) => {
    if (!isImage(item)) {
      errors.push(`${context} images[${index}] の形式が不正です`);
      return;
    }
    if (!/^https?:\/\//.test(item.src) && !item.src.startsWith("/")) {
      errors.push(`${context} images[${index}].src が不正です`);
    }
  });
};

const validateCover = (cover: unknown, context: string) => {
  if (cover === undefined) return;
  if (!isImage(cover)) {
    errors.push(`${context} coverImage の形式が不正です`);
    return;
  }
  if (!/^https?:\/\//.test(cover.src) && !cover.src.startsWith("/")) {
    errors.push(`${context} coverImage.src が不正です`);
  }
};

const validateEmbeds = (embeds: unknown, context: string) => {
  if (embeds === undefined) return;
  if (!Array.isArray(embeds)) {
    errors.push(`${context} embeds は配列である必要があります`);
    return;
  }
  embeds.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      errors.push(`${context} embeds[${index}] の形式が不正です`);
      return;
    }
    const embed = item as EmbedMedia;
    if (!isNonEmptyString(embed.url)) {
      errors.push(`${context} embeds[${index}].url が不正です`);
      return;
    }
    if (embed.type === "youtube") {
      if (!/youtube\.com|youtu\.be/.test(embed.url)) {
        errors.push(`${context} embeds[${index}] のURLがYouTubeではありません`);
      }
      return;
    }
    if (embed.type === "tiktok") {
      if (!/tiktok\.com/.test(embed.url)) {
        errors.push(`${context} embeds[${index}] のURLがTikTokではありません`);
      }
      return;
    }
    errors.push(`${context} embeds[${index}] のtypeが不正です`);
  });
};

const validateVideoUrls = (videoUrls: unknown, context: string) => {
  if (videoUrls === undefined) return;
  if (!Array.isArray(videoUrls)) {
    errors.push(`${context} videoUrls は配列である必要があります`);
    return;
  }
  videoUrls.forEach((url, index) => {
    if (!isNonEmptyString(url)) {
      errors.push(`${context} videoUrls[${index}] が不正です`);
      return;
    }
    const normalized = normalizeMedia(url.trim());
    if (normalized.kind === "other") {
      errors.push(`${context} videoUrls[${index}] が不正です`);
    }
  });
};

const validateEntry = (entry: BaseEntry, context: string) => {
  if (!isNonEmptyString(entry.id)) {
    errors.push(`${context} id が不正です`);
  }
  if (!isNonEmptyString(entry.slug)) {
    errors.push(`${context} slug が不正です`);
  } else if (!/^[a-z0-9-]+$/.test(entry.slug)) {
    errors.push(`${context} slug 形式が不正です`);
  } else if (slugSet.has(entry.slug)) {
    errors.push(`${context} slug が重複しています: ${entry.slug}`);
  } else {
    slugSet.add(entry.slug);
  }

  if (!isNonEmptyString(entry.title)) {
    errors.push(`${context} title が不正です`);
  }
  if (!isNonEmptyString(entry.summary)) {
    errors.push(`${context} summary が不正です`);
  }
  const hasBody = isNonEmptyString(entry.body);
  const hasContent = isNonEmptyString(entry.content);
  if (!hasBody && !hasContent) {
    errors.push(`${context} body も content も不正です`);
  }
  if (!Array.isArray(entry.tags) || entry.tags.length === 0) {
    errors.push(`${context} tags が不正です`);
  } else {
    entry.tags.forEach((tag) => {
      if (!tagSet.has(tag)) {
        errors.push(`${context} tags に未登録タグがあります: ${tag}`);
      }
    });
  }
  if (!isValidDate(entry.publishedAt)) {
    errors.push(`${context} publishedAt が不正です`);
  }
  if (entry.updatedAt !== undefined && !isValidDate(entry.updatedAt)) {
    errors.push(`${context} updatedAt が不正です`);
  }
  if (!isNonEmptyString(entry.status) || !["draft", "published"].includes(entry.status)) {
    errors.push(`${context} status が不正です`);
  }
  if (!isNonEmptyString(entry.category) || !["spots", "stories", "uma"].includes(entry.category)) {
    errors.push(`${context} category が不正です`);
  }

  validateCover(entry.coverImage, context);
  validateImages(entry.images, context);
  validateEmbeds(entry.embeds, context);
  validateVideoUrls(entry.videoUrls, context);
};

const EXISTENCE_RANKS = new Set(["S", "A", "B", "C", "D"]);
const EVIDENCE_RANKS = new Set(["A", "B", "C", "D", "E"]);

const validateUmaEntry = (entry: Record<string, unknown>, context: string) => {
  if (!isNonEmptyString(entry.region)) {
    errors.push(`${context} region が不正です`);
  }
  if (!isNonEmptyString(entry.existence_rank) || !EXISTENCE_RANKS.has(entry.existence_rank as string)) {
    errors.push(`${context} existence_rank が不正です（S/A/B/C/D）`);
  }
  if (!isNonEmptyString(entry.evidence_rank) || !EVIDENCE_RANKS.has(entry.evidence_rank as string)) {
    errors.push(`${context} evidence_rank が不正です（A/B/C/D/E）`);
  }
};

const validateDataset = (entries: BaseEntry[], name: string, category: string) => {
  if (!Array.isArray(entries)) {
    errors.push(`[data:${name}] データ形式が不正です`);
    return;
  }

  entries.forEach((entry, index) => {
    const context = `[data:${name} index=${index} slug=${(entry as BaseEntry).slug ?? ""}]`;
    if ((entry as BaseEntry).category !== category) {
      errors.push(`${context} category が ${category} ではありません`);
    }
    validateEntry(entry as BaseEntry, context);
    if (category === "uma") {
      validateUmaEntry(entry as Record<string, unknown>, context);
    }
  });
};

const run = async () => {
  const spotsData = await getSpotEntriesFromArticles();

  validateDataset(spotsData as BaseEntry[], "spots", "spots");
  validateDataset(storiesData as BaseEntry[], "stories", "stories");
  validateDataset(umasData as BaseEntry[], "uma", "uma");

  if (errors.length > 0) {
    console.error("\nデータ検証エラー:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log("データ検証OK");
};

run().catch((error) => {
  console.error("\nデータ検証エラー:");
  console.error(`- ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
