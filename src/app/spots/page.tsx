import SpotsClient from "./SpotsClient";
import { getSpotEntriesFromArticles } from "@/lib/spot-articles";

export default async function SpotsPage() {
  const spots = await getSpotEntriesFromArticles();

  return (
    <SpotsClient initialSpots={spots} />
  );
}
