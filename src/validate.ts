import spotsData from "./data/json/spots.json";
import storiesData from "./data/json/stories.json";
import umasData from "./data/json/uma.json";
import { TAGS } from "./data/tags";
import type { BaseEntry, Media, MediaImage, MediaVideo } from "./types";

const tagSet = new Set<string>(TAGS as readonly string[]);
const slugSet = new Set<string>();
const errors: string[] = [];

const isString = (value: unknown): value is string => typeof value === "string";
const isNonEmptyString = (value: unknown): value is string =>
  isString(value) && value.trim().length > 0;

const isValidDate = (value: unknown) => {
  if (!isNonEmptyString(value)) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(Date.parse(value));
};

const isImage = (value: unknown): value is MediaImage => {
  if (!value || typeof value !== "object") return false;
  const image = value as MediaImage;
  return image.type === "image" && isNonEmptyString(image.src);
};

const isVideo = (value: unknown): value is MediaVideo => {
  if (!value || typeof value !== "object") return false;
  const video = value as MediaVideo;
  const providers = new Set(["youtube", "vimeo", "mp4"]);
  return (
    video.type === "video" &&
    providers.has(video.provider) &&
    isNonEmptyString(video.url)
  );
};

const validateMedia = (media: unknown, context: string) => {
  if (media === undefined) return;
  if (!Array.isArray(media)) {
    errors.push(`${context} media は配列である必要があります`);
    return;
  }
  media.forEach((item, index) => {
    if (!isImage(item) && !isVideo(item)) {
      errors.push(`${context} media[${index}] の形式が不正です`);
    }
  });
};

const validateCover = (cover: unknown, context: string) => {
  if (cover === undefined) return;
  if (!isImage(cover)) {
    errors.push(`${context} cover の形式が不正です`);
  }
};

const validateEntry = (entry: BaseEntry, context: string) => {
  if (!isNonEmptyString(entry.id)) {
    errors.push(`${context} id が不正です`);
  }
  if (!isNonEmptyString(entry.slug)) {
    errors.push(`${context} slug が不正です`);
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
  if (!isNonEmptyString(entry.body)) {
    errors.push(`${context} body が不正です`);
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

  validateCover(entry.cover, context);
  validateMedia(entry.media, context);
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
  });
};

validateDataset(spotsData as BaseEntry[], "spots", "spots");
validateDataset(storiesData as BaseEntry[], "stories", "stories");
validateDataset(umasData as BaseEntry[], "uma", "uma");

if (errors.length > 0) {
  console.error("\nデータ検証エラー:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("データ検証OK");
