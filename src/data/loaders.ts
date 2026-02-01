import type { Spot, Story, Uma } from "@/data/types";
import spotsData from "@/data/json/spots.json";
import storiesData from "@/data/json/stories.json";
import umasData from "@/data/json/uma.json";
import { validateDataset } from "@/data/validate";

export const getSpots = () =>
	validateDataset("spots", spotsData as Spot[]);

export const getStories = () =>
	validateDataset("stories", storiesData as Story[]);

export const getUmas = () => validateDataset("uma", umasData as Uma[]);

export const spots = getSpots();
export const stories = getStories();
export const umas = getUmas();
