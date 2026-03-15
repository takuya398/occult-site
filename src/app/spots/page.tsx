import { Suspense } from "react";
import SpotsClient from "./SpotsClient";
import { getSpotEntriesFromArticles } from "@/lib/spot-articles";
import { getCommentCounts } from "@/lib/comments/getCommentCounts";

export default async function SpotsPage() {
  const [spots, commentCounts] = await Promise.all([
    getSpotEntriesFromArticles(),
    getCommentCounts("spots"),
  ]);

  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">読み込み中...</div>}>
      <SpotsClient initialSpots={spots} commentCounts={commentCounts} />
    </Suspense>
  );
}
