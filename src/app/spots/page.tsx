import { Suspense } from "react";
import SpotsClient from "./SpotsClient";
import { getSpotEntriesFromArticles } from "@/lib/spot-articles";

export default async function SpotsPage() {
  const spots = await getSpotEntriesFromArticles();

  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">読み込み中...</div>}>
      <SpotsClient initialSpots={spots} />
    </Suspense>
  );
}
