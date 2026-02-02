import spotsData from "@/data/json/spots.json";
import storiesData from "@/data/json/stories.json";
import umasData from "@/data/json/uma.json";
import type { BaseEntry, SpotEntry, StoryEntry, UmaEntry } from "@/types";

const toTime = (date?: string) => {
  if (!date) return 0;
  const time = Date.parse(date);
  return Number.isNaN(time) ? 0 : time;
};

export const loadSpots = () =>
  (spotsData as SpotEntry[]).filter((item) => item.status === "published");

export const loadStories = () =>
  (storiesData as StoryEntry[]).filter((item) => item.status === "published");

export const loadUmas = () =>
  (umasData as UmaEntry[]).filter((item) => item.status === "published");

export const getAllLatest = (limit = 6) => {
  const merged: BaseEntry[] = [
    ...loadSpots(),
    ...loadStories(),
    ...loadUmas(),
  ];

  return merged
    .sort((a, b) => toTime(b.publishedAt) - toTime(a.publishedAt))
    .slice(0, limit);
};

export const spots = loadSpots();
export const stories = loadStories();
export const umas = loadUmas();
