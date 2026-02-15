import storiesData from "@/data/json/stories.json";
import umasData from "@/data/json/uma.json";
import type { StoryEntry, UmaEntry } from "@/types";

export const loadStories = () =>
  (storiesData as StoryEntry[]).filter((item) => item.status === "published");

export const loadUmas = () =>
  (umasData as UmaEntry[]).filter((item) => item.status === "published");

export const stories = loadStories();
export const umas = loadUmas();
