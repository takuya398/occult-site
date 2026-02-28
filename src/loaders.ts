import storiesData from "@/data/json/stories.json";
import umasData from "@/data/json/uma.json";
import entitiesData from "@/data/json/entities.json";
import mysteriesData from "@/data/json/mysteries.json";
import type { StoryEntry, UmaEntry, EntityEntry, MysteryEntry } from "@/types";

export const loadStories = () =>
  (storiesData as StoryEntry[]).filter((item) => item.status === "published");

export const loadUmas = () =>
  (umasData as UmaEntry[]).filter((item) => item.status === "published");

export const loadEntities = () =>
  (entitiesData as EntityEntry[]).filter((item) => item.status === "published");

export const loadMysteries = () =>
  (mysteriesData as MysteryEntry[]).filter((item) => item.status === "published");

export const stories = loadStories();
export const umas = loadUmas();
export const entities = loadEntities();
export const mysteries = loadMysteries();
