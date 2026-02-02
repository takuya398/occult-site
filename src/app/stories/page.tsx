import { Suspense } from "react";
import StoriesClient from "./StoriesClient";

export default function StoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
          <div className="mx-auto w-full max-w-5xl px-6 py-12">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              読み込み中...
            </p>
          </div>
        </div>
      }
    >
      <StoriesClient />
    </Suspense>
  );
}
