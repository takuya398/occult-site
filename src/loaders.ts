import storiesData from "@/data/json/stories.json";
import umasData from "@/data/json/uma.json";
import mysteriesData from "@/data/json/mysteries.json";
import type { StoryEntry, UmaEntry, MysteryEntry } from "@/types";

export const loadStories = () =>
  (storiesData as StoryEntry[]).filter((item) => item.status === "published");

export const loadUmas = () =>
  (umasData as UmaEntry[]).filter((item) => item.status === "published");

export const loadMysteries = () =>
  (mysteriesData as MysteryEntry[]).filter((item) => item.status === "published");

export const stories = loadStories();
export const umas = loadUmas();
export const mysteries = loadMysteries();
