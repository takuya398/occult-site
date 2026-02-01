import type { Spot, Story, Uma } from "@/data/types";
import spotsData from "@/data/json/spots.json";
import storiesData from "@/data/json/stories.json";
import umasData from "@/data/json/uma.json";

export const spots = spotsData as Spot[];
export const stories = storiesData as Story[];
export const umas = umasData as Uma[];
